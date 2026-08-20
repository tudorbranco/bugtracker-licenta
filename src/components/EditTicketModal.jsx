import { useState } from 'react';
import { updateTicket } from '../services/api';

function EditTicketModal({ ticket, onClose, onRefresh, showToast }) {
  const [title, setTitle] = useState(ticket.title || '');
  const [description, setDescription] = useState(ticket.description || '');
  const [ticketType, setTicketType] = useState(ticket.ticket_type || 'Bug');
  const [severity, setSeverity] = useState(ticket.severity || 'Medium');
  const [department, setDepartment] = useState(ticket.department || 'Dev'); // <--- Stare nouă pentru departament
  const [estimate, setEstimate] = useState(ticket.estimate || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTicket(ticket.id, {
        title,
        description,
        ticket_type: ticketType,
        severity,
        assignee: ticket.assignee,
        estimate,
        department // <--- Trimitem departamentul către backend
      });
      showToast('Tichet actualizat cu succes!', 'success');
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Eroare la actualizarea tichetului.', 'error');
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '24px', borderRadius: '10px', width: '480px', maxWidth: '90%', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>Editează Tichetul #{ticket.id}</h4>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Titlu</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Tip</label>
            <select value={ticketType} onChange={(e) => setTicketType(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', background: '#fff', boxSizing: 'border-box' }}>
              <option value="Bug">Bug</option>
              <option value="Task">Task</option>
              <option value="Story">Story</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Departament</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', background: '#fff', boxSizing: 'border-box' }}>
              <option value="Dev">Dev</option>
              <option value="QA">QA</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="DevOps">DevOps</option>
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
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Estimare timp</label>
          <input type="text" value={estimate} onChange={(e) => setEstimate(e.target.value)} placeholder="Ex: 3h sau 2d" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Descriere</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', height: '70px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Salvează Modificările</button>
          <button type="button" onClick={onClose} style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Anulează</button>
        </div>
      </form>
    </div>
  );
}

export default EditTicketModal;