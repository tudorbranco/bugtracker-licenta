import { useState } from 'react';

function TimeframeView({ tickets }) {
  const [filterRange, setFilterRange] = useState('All');

  // Grupăm tichetele după estimare (presupunând formatul de tip "4h", "1d", "2d" etc.)
  const categories = [
    { title: '⚡ Quick Wins (< 4 ore)', check: (t) => t.estimate && (t.estimate.includes('h') && parseInt(t.estimate) <= 4) },
    { title: '📅 Task-uri Medii (1 zi)', check: (t) => t.estimate && (t.estimate.includes('1d') || (t.estimate.includes('h') && parseInt(t.estimate) > 4)) },
    { title: '🚀 Proiecte / Complexe (> 1 zi)', check: (t) => t.estimate && (t.estimate.includes('d') && parseInt(t.estimate) > 1) },
    { title: '📌 Fără estimare clară', check: (t) => !t.estimate }
  ];

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ marginTop: 0, color: '#1e293b', marginBottom: '16px' }}>Planificare Tichete după Timeframe / Estimare</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {categories.map((cat, index) => {
          const matchedTickets = tickets.filter(cat.check);
          return (
            <div key={index} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#334155', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px' }}>
                {cat.title} ({matchedTickets.length})
              </h4>
              {matchedTickets.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>Niciun tichet în această categorie</div>
              ) : (
                matchedTickets.map((t) => (
                  <div key={t.id} style={{ background: '#fff', padding: '10px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{t.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#64748b' }}>
                      <span>👤 {t.assignee || 'Nealocat'}</span>
                      <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 4px', borderRadius: '4px' }}>⏱️ {t.estimate}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TimeframeView;