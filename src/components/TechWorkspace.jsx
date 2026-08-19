import { useState, useEffect } from 'react';
import axios from 'axios';

function TechWorkspace() {
  const [globalLogs, setGlobalLogs] = useState([]);

  useEffect(() => {
    // Preluare log-uri tehnice globale (simulat prin interogarea endpoint-urilor sau stării)
    const fetchAllLogs = async () => {
      try {
        // Preluam tichetele și pentru fiecare aducem log-urile
        const resTickets = await axios.get('http://localhost:5000/api/tickets');
        let allLogs = [];
        for (let t of resTickets.data) {
          const resLogs = await axios.get(`http://localhost:5000/api/tickets/${t.id}/logs`);
          const enriched = resLogs.data.map(l => ({ ...l, ticketTitle: t.title }));
          allLogs.push(...enriched);
        }
        // Ordonare după data creării
        allLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setGlobalLogs(allLogs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllLogs();
  }, []);

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '18px' }}>Workspace Tehnic — Jurnale & Activitate Codebase</h3>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
        Acest panou centralizează istorico-tehnic al tuturor commit-urilor, modificărilor și intervențiilor realizate de programatori pe tichetele din sistem.
      </p>

      {globalLogs.length === 0 ? (
        <p style={{ color: '#64748b', fontStyle: 'italic' }}>Niciun jurnal tehnic înregistrat în baza de date până acum.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {globalLogs.map((log) => (
            <div key={log.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ color: '#2563eb', fontSize: '14px' }}>Tichet: "{log.ticketTitle}"</strong>
                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                  ⏱️ {log.hours_spent}
                </span>
              </div>
              <p style={{ margin: '6px 0', color: '#334155', fontSize: '14px' }}>{log.log_text}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                <span>Autor: <strong>{log.author}</strong></span>
                <span>{new Date(log.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TechWorkspace;