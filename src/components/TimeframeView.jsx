import { useState } from 'react';

function TimeframeView({ tickets }) {
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredTickets = tickets.filter(t => {
    if (statusFilter === 'All') return true;
    return t.status === statusFilter;
  });

  // Funcție ajutătoare care extrage numărul total de ore dintr-un string de estimare (ex: "48h", "3h", "2d", "1.5d")
  const parseHours = (estimateStr) => {
    if (!estimateStr) return 0;
    const cleanStr = estimateStr.toLowerCase().trim();
    const val = parseFloat(cleanStr);
    if (isNaN(val)) return 0;
    
    if (cleanStr.includes('d')) {
      return val * 24; // transformăm zilele în ore
    }
    return val; // altfel sunt deja ore
  };

  const categories = [
    { 
      title: '⚡ Quick Wins (< 4 ore)', 
      check: (t) => {
        const hours = parseHours(t.estimate);
        return hours > 0 && hours <= 4;
      } 
    },
    { 
      title: '📅 Task-uri Medii (1 zi / 5-24h)', 
      check: (t) => {
        const hours = parseHours(t.estimate);
        return hours > 4 && hours <= 24;
      } 
    },
    { 
      title: '🚀 Proiecte / Complexe (> 1 zi / > 24h)', 
      check: (t) => {
        const hours = parseHours(t.estimate);
        return hours > 24;
      } 
    },
    { 
      title: '📌 Fără estimare clară', 
      check: (t) => !t.estimate || t.estimate.trim() === '' || parseHours(t.estimate) === 0 
    }
  ];

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ margin: 0, color: '#1e293b' }}>Planificare Tichete după Timeframe / Estimare</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Filtrează după stadiu:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff', outline: 'none' }}
          >
            <option value="All">Toate stările</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Code Review">Code Review</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {categories.map((cat, index) => {
          const matchedTickets = filteredTickets.filter(cat.check);
          return (
            <div key={index} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#334155', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{cat.title}</span>
                <span style={{ background: '#e2e8f0', padding: '0 6px', borderRadius: '10px', fontSize: '12px' }}>{matchedTickets.length}</span>
              </h4>
              {matchedTickets.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>Niciun tichet găsit</div>
              ) : (
                matchedTickets.map((t) => (
                  <div key={t.id} style={{ background: '#fff', padding: '10px', marginBottom: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                    <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>{t.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
                      <span>👤 {t.assignee || 'Nealocat'}</span>
                      <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>⏱️ {t.estimate}</span>
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