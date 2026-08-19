function BusinessDashboard({ tickets }) {
  const totalEstimatedHours = tickets.reduce((acc, t) => {
    const hours = parseInt(t.estimate) || 3;
    return acc + hours;
  }, 0);

  const criticalBugs = tickets.filter(t => t.severity === 'Critical' && t.status !== 'Done').length;
  const completedCount = tickets.filter(t => t.status === 'Done').length;
  const completionRate = tickets.length > 0 ? Math.round((completedCount / tickets.length) * 100) : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Total Ore Estimate (Backlog)</span>
        <h3 style={{ margin: '8px 0 0 0', fontSize: '28px', color: '#0f172a' }}>{totalEstimatedHours} ore</h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Efort total planificat pentru livrabilele active.</p>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Rată Globală de Finalizare</span>
        <h3 style={{ margin: '8px 0 0 0', fontSize: '28px', color: '#10b981' }}>{completionRate}%</h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Procentul de tichete mutate în starea "Done".</p>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Bug-uri Critice Active</span>
        <h3 style={{ margin: '8px 0 0 0', fontSize: '28px', color: criticalBugs > 0 ? '#ef4444' : '#10b981' }}>{criticalBugs}</h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Necesită atenție imediată din partea echipei.</p>
      </div>
    </div>
  );
}

export default BusinessDashboard;