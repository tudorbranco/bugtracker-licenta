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

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/api/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, status) 
       VALUES ($1, $2, $3, $4, 0) RETURNING id, username, email, role, status`,
      [username, email, passwordHash, role || 'Developer']
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `Cerere nouă cont BugTracker: ${username}`,
      text: `Utilizatorul ${username} (${email}) s-a înregistrat cu rolul de ${role || 'Developer'}. Intră în baza de date sau panoul de admin pentru a-i aproba contul.`
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) console.log('Eroare trimitere email:', err);
    });

    res.status(201).json({ 
      message: 'Cont înregistrat cu succes! Așteaptă aprobarea administratorului.', 
      user: newUser.rows[0] 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Eroare la înregistrare (utilizatorul sau emailul poate exista deja).' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Utilizatorul nu a fost găsit.' });
    }

    const user = userResult.rows[0];

    if (user.status === 0) {
      return res.status(403).json({ error: 'Contul tău este în așteptarea aprobării de către administrator.' });
    }
    
    if (user.status === 2) {
      return res.status(403).json({ error: 'Acest cont a fost refuzat sau dezactivat.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Parolă incorectă.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Eroare de server la autentificare.' });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await pool.query('SELECT id, username, email, role, status, created_at FROM users ORDER BY id DESC');
    res.json(users.rows);
  } catch (err) {
    res.status(500).json({ error: 'Eroare la preluarea utilizatorilor.' });
  }
});

app.put('/api/admin/user-status/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    if (status === 2) {
      const userRes = await pool.query('SELECT username FROM users WHERE id = $1', [id]);
      if (userRes.rows.length > 0) {
        const username = userRes.rows[0].username;
        const ticketsRes = await pool.query("SELECT count(*) FROM tickets WHERE assignee = $1 AND status != 'Done'", [username]);
        if (parseInt(ticketsRes.rows[0].count) > 0) {
          return res.status(400).json({ error: 'Acest utilizator are tichete active (nefinalizate). Reasignează-le înainte de a-l dezactiva!' });
        }
      }
    }

    await pool.query('UPDATE users SET status = $1 WHERE id = $2', [status, id]);
    res.json({ message: 'Statusul utilizatorului a fost actualizat!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Eroare la actualizarea contului.' });
  }
});

app.delete('/api/admin/user/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const userRes = await pool.query('SELECT username FROM users WHERE id = $1', [id]);
    if (userRes.rows.length > 0) {
      const username = userRes.rows[0].username;
      const ticketsRes = await pool.query("SELECT count(*) FROM tickets WHERE assignee = $1 AND status != 'Done'", [username]);
      if (parseInt(ticketsRes.rows[0].count) > 0) {
        return res.status(400).json({ error: 'Nu poți șterge un utilizator cu tichete active (nefinalizate). Reasignează-le mai întâi!' });
      }
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Utilizator șters cu succes!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Eroare la ștergerea utilizatorului.' });
  }
});

app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await pool.query('SELECT * FROM tickets ORDER BY id DESC');
    res.json(tickets.rows);
  } catch (err) {
    res.status(500).json({ error: 'Eroare la preluarea tichetelor.' });
  }
});

app.post('/api/tickets', async (req, res) => {
  const { title, description, ticket_type, severity, assignee, estimate, department, created_by } = req.body;
  try {
    const newTicket = await pool.query(
      `INSERT INTO tickets (title, description, ticket_type, severity, status, assignee, estimate, department, created_by) 
       VALUES ($1, $2, $3, $4, 'To Do', $5, $6, $7, $8) RETURNING *`,
      [title, description, ticket_type || 'Bug', severity || 'Medium', assignee || 'Neatribuit', estimate ? estimate : null, department || 'Dev', created_by]
    );
    res.status(201).json(newTicket.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Eroare la creare tichet.' });
  }
});

app.put('/api/tickets/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await pool.query('UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Eroare la actualizare status.' });
  }
});

app.put('/api/tickets/:id/assign', async (req, res) => {
  const { id } = req.params;
  const { assignee } = req.body;
  try {
    const updated = await pool.query('UPDATE tickets SET assignee = $1 WHERE id = $2 RETURNING *', [assignee, id]);
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Eroare la atribuire tichet.' });
  }
});

app.get('/api/tickets/:id/logs', async (req, res) => {
  const { id } = req.params;
  try {
    const logs = await pool.query('SELECT * FROM work_logs WHERE ticket_id = $1 ORDER BY id DESC', [id]);
    res.json(logs.rows);
  } catch (err) {
    res.status(500).json({ error: 'Eroare la preluarea log-urilor.' });
  }
});

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
    res.status(500).json({ error: 'Eroare la adăugare log tehnic.' });
  }
});

app.delete('/api/tickets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tickets WHERE id = $1', [id]);
    res.json({ message: 'Tichet șters cu succes.' });
  } catch (err) {
    res.status(500).json({ error: 'Eroare la ștergere.' });
  }
});

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
    res.status(500).json({ error: 'Eroare la actualizarea tichetului.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serverul rulează pe portul ${PORT}`);
});