import { useState, useEffect } from 'react';
import { getTicketLogs, addTicketLog } from '../services/api';

function TechLogModal({ ticket, currentUser, currentRole, showToast, onClose }) {
  const [logs, setLogs] = useState([]);
  const [logText, setLogText] = useState('');
  const [hoursSpent, setHoursSpent] = useState('2h');

  // Verifică dacă are dreptul să adauge log (este asignat sau este Admin)
  const canAddLog = currentRole === 'Admin' || ticket.assignee === currentUser;

  const fetchLogs = async () => {
    try {
      const res = await getTicketLogs(ticket.id);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [ticket.id]);

  const handleAddLog = async (e) => {
    e.preventDefault();
    try {
      await addTicketLog(ticket.id, {
        author: currentUser,
        log_text: logText,
        hours_spent: hoursSpent,
        userRole: currentRole
      });
      setLogText('');
      showToast('Jurnal tehnic adăugat cu succes!', 'success');
      fetchLogs();
    } catch (err) {
      showToast(err.response?.data?.error || 'Nu ai permisiunea să adaugi log pentru acest tichet.', 'error');
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: '#fff', padding: '28px', borderRadius: '12px', width: '100%', maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb', background: '#eff6ff', padding: '3px 8px', borderRadius: '4px' }}>
              TICICHET #{ticket.id} (Asignat: {ticket.assignee})
            </span>
            <h3 style={{ margin: '8px 0 4px 0', fontSize: '18px', color: '#0f172a' }}>{ticket.title}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b', fontWeight: 'bold' }}>✕</button>
        </div>

        <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '0 0 20px 0' }}>
          {ticket.description || 'Fără descriere adițională.'}
        </p>

        <h4 style={{ fontSize: '14px', color: '#0f172a', fontWeight: '700', marginBottom: '12px' }}>Jurnale Tehnice & Progres Dezvoltator</h4>
        
        {logs.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: '#94a3b8', fontSize: '13px', background: '#f8fafc', padding: '16px', textAlign: 'center', borderRadius: '8px' }}>Niciun jurnal tehnic înregistrat.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
            {logs.map((l) => (
              <div key={l.id} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <strong style={{ color: '#0f172a' }}>{l.author}</strong>
                  <span style={{ color: '#0284c7', fontWeight: '600' }}>⏱️ {l.hours_spent}</span>
                </div>
                <p style={{ margin: '4px 0', fontSize: '13px', color: '#334155' }}>{l.log_text}</p>
                <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>{new Date(l.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}

        {/* Formularul apare doar dacă utilizatorul este asignat sau este Admin */}
        {canAddLog ? (
          <form onSubmit={handleAddLog} style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <h5 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#0f172a' }}>Adaugă un nou log tehnic (Ești asignat / Admin)</h5>
            <textarea placeholder="Detalii tehnice, modificări în cod..." value={logText} onChange={(e) => setLogText(e.target.value)} required style={{ width: '100%', height: '60px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', marginBottom: '10px', outline: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginRight: '8px' }}>Timp alocat:</label>
                <input type="text" value={hoursSpent} onChange={(e) => setHoursSpent(e.target.value)} style={{ width: '70px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </div>
              <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Salvează Log</button>
            </div>
          </form>
        ) : (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}>
            🔒 Nu poți adăuga jurnale tehnice deoarece acest tichet nu îți este asignat.
          </div>
        )}

        <div style={{ textAlign: 'right', marginTop: '20px' }}>
          <button onClick={onClose} style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Închide fereastra</button>
        </div>
      </div>
    </div>
  );
}

export default TechLogModal;