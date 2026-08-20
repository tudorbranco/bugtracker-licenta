import { useState } from 'react';
import { createTicket } from '../services/api';

function TicketForm({ onTicketCreated, currentUser, showToast }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ticketType, setTicketType] = useState('Bug');
  const [severity, setSeverity] = useState('Medium');
  const [estimate, setEstimate] = useState(''); // <--- Lăsat gol by default pentru a permite tichete fără estimare
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTicket({
        title,
        description,
        ticket_type: ticketType,
        severity,
        estimate,
        created_by: currentUser
      });
      setTitle('');
      setDescription('');
      setEstimate('');
      setIsOpen(false);
      showToast('Tichet creat cu succes în baza de date!', 'success');
      onTicketCreated();
    } catch (err) {
      console.error(err);
      showToast('Eroare la crearea tichetului.', 'error');
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)} 
        style={{ marginBottom: '20px', background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}
      >
        + Creează Tichet Nou
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '24px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>Creează Tichet / Task Nou</h4>
        <button type="button" onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748b' }}>✕</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Titlu</label>
          <input type="text" placeholder="Ex: Eroare autentificare..." value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Tip</label>
          <select value={ticketType} onChange={(e) => setTicketType(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', background: '#fff', boxSizing: 'border-box' }}>
            <option value="Bug">Bug</option>
            <option value="Task">Task</option>
            <option value="Story">Story</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Severitate</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', background: '#fff', boxSizing: 'border-box' }}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Estimare</label>
          <input type="text" placeholder="Ex: 3h sau 2d" value={estimate} onChange={(e) => setEstimate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }} />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Descriere</label>
        <textarea placeholder="Descrie pașii pentru reproducere sau detalii tehnice..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', height: '70px', boxSizing: 'border-box' }} />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Salvează în Sistem</button>
        <button type="button" onClick={() => setIsOpen(false)} style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Anulează</button>
      </div>
    </form>
  );
}

export default TicketForm;