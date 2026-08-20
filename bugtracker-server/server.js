const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Conexiunea la baza de date PostgreSQL (Suportă atât DATABASE_URL în cloud, cât și variabilele locale)
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
      }
);

// Configurare Nodemailer pentru trimiterea email-urilor de notificare către admin
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 1. ÎNREGISTRARE UTILIZATOR (Contul se creează cu is_approved = false)
app.post('/api/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, is_approved) 
       VALUES ($1, $2, $3, $4, FALSE) RETURNING id, username, email, role, is_approved`,
      [username, email, passwordHash, role || 'Developer']
    );

    // Trimitere email de alertă către Administrator
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Se trimite la admin
      subject: `Cerere nouă cont BugTracker: ${username}`,
      text: `Utilizatorul ${username} (${email}) s-a înregistrat cu rolul de ${role || 'Developer'}. Intră în baza de date sau panoul de admin pentru a-i aproba contul.`
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) console.log('Erore trimitere email:', err);
    });

    res.status(201).json({ 
      message: 'Cont înregistrat cu succes! Așteaptă aprobarea administratorului.', 
      user: newUser.rows[0] 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erore la înregistrare (utilizatorul sau emailul poate exista deja).' });
  }
});

// 2. LOGIN UTILIZATOR (Verifică dacă este aprobat)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Utilizatorul nu a fost găsit.' });
    }

    const user = userResult.rows[0];

    if (!user.is_approved) {
      return res.status(403).json({ error: 'Contul tău nu a fost încă aprobat de către administrator.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Parolă incorectă.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erore de server la autentificare.' });
  }
});

// 3. LISTARE TOȚI UTILIZATORII (Pentru Panoul de Admin)
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await pool.query('SELECT id, username, email, role, is_approved, created_at FROM users ORDER BY id DESC');
    res.json(users.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erore la preluarea utilizatorilor.' });
  }
});

// 4. APROBARE / DEZACTIVARE UTILIZATOR (is_approved devine true sau false)
app.put('/api/admin/approve-user/:id', async (req, res) => {
  const { id } = req.params;
  const { is_approved } = req.body;
  try {
    await pool.query('UPDATE users SET is_approved = $1 WHERE id = $2', [is_approved, id]);
    res.json({ message: 'Statusul utilizatorului a fost actualizat!' });
  } catch (err) {
    res.status(500).json({ error: 'Erore la actualizarea contului.' });
  }
});

// 4.1 ȘTERGERE DEFINITIVĂ UTILIZATOR
app.delete('/api/admin/user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Utilizator șters cu succes!' });
  } catch (err) {
    res.status(500).json({ error: 'Erore la ștergerea utilizatorului.' });
  }
});

// 5. PRELUARE TOATE TICHETELE
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await pool.query('SELECT * FROM tickets ORDER BY id DESC');
    res.json(tickets.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erore la preluarea tichetelor.' });
  }
});

// 6. CREARE TICHET NOU
app.post('/api/tickets', async (req, res) => {
  const { title, description, ticket_type, severity, assignee, estimate, department, created_by } = req.body;
  try {
    const newTicket = await pool.query(
      `INSERT INTO tickets (title, description, ticket_type, severity, status, assignee, estimate, department, created_by) 
       VALUES ($1, $2, $3, $4, 'To Do', $5, $6, $7, $8, $9) RETURNING *`,
      [title, description, ticket_type || 'Bug', severity || 'Medium', assignee || 'Neatribuit', estimate ? estimate : null, department || 'Dev', created_by]
    );
    res.status(201).json(newTicket.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erore la creare tichet.' });
  }
});

// 7. ACTUALIZARE STATUS TICHET (Drag & Drop / Change Status)
app.put('/api/tickets/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await pool.query('UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erore la actualizare status.' });
  }
});

// 8. ATRIBUIRE TICHET (Self-Assign)
app.put('/api/tickets/:id/assign', async (req, res) => {
  const { id } = req.params;
  const { assignee } = req.body;
  try {
    const updated = await pool.query('UPDATE tickets SET assignee = $1 WHERE id = $2 RETURNING *', [assignee, id]);
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erore la atribuire tichet.' });
  }
});

// 9. PRELUARE JURNALE TEHNICE PENTRU UN TICHET
app.get('/api/tickets/:id/logs', async (req, res) => {
  const { id } = req.params;
  try {
    const logs = await pool.query('SELECT * FROM work_logs WHERE ticket_id = $1 ORDER BY id DESC', [id]);
    res.json(logs.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erore la preluarea log-urilor.' });
  }
});

// 10. ADAUGARE JURNAL TEHNIC
app.post('/api/tickets/:id/logs', async (req, res) => {
  const { id } = req.params;
  const { author, log_text, hours_spent, userRole } = req.body;
  
  try {
    const ticketResult = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
    
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tichetul nu a fost găsit.' });
    }
    
    const ticket = ticketResult.rows[0];

    if (userRole !== 'Admin' && ticket.assignee !== author) {
      return res.status(403).json({ error: 'Doar persoana asignată acestui tichet sau un Administrator poate adăuga jurnale tehnice.' });
    }

    const newLog = await pool.query(
      `INSERT INTO work_logs (ticket_id, author, log_text, hours_spent) VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, author, log_text, hours_spent || '1h']
    );
    
    res.status(201).json(newLog.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erore la adăugare log tehnic.' });
  }
});

// 11. ȘTERGERE TICHET
app.delete('/api/tickets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tickets WHERE id = $1', [id]);
    res.json({ message: 'Tichet șters cu succes.' });
  } catch (err) {
    res.status(500).json({ error: 'Erore la ștergere.' });
  }
});

// 12. ACTUALIZARE TICHET (Editare completă)
app.put('/api/tickets/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, ticket_type, severity, assignee, estimate, department } = req.body;
  try {
    const updated = await pool.query(
      `UPDATE tickets 
       SET title = $1, description = $2, ticket_type = $3, severity = $4, assignee = $5, estimate = $6, department = $7 
       WHERE id = $8 RETURNING *`,
      [title, description, ticket_type, severity, assignee || 'Neatribuit', estimate ? estimate : null, department, id]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Tichetul nu a fost găsit.' });
    }
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erore la actualizarea tichetului.' });
  }
});

// Pornire server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serverul rulează pe portul ${PORT}`);
});