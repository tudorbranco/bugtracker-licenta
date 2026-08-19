import { useState, useEffect } from 'react';
import { getPendingUsers, approveUser } from '../services/api';

function AdminPanel() {
  const [pendingUsers, setPendingUsers] = useState([]);

  const fetchPending = async () => {
    try {
      const res = await getPendingUsers();
      setPendingUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveUser(id);
      fetchPending();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '10px', marginBottom: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>Panou Administrator — Cereri Aprobare Conturi</h3>
        <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '12px', fontWeight: '700', padding: '2px 10px', borderRadius: '12px' }}>
          {pendingUsers.length} în așteptare
        </span>
      </div>

      {pendingUsers.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Nu există conturi noi în așteptare pentru aprobare.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pendingUsers.map((u) => (
            <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <strong style={{ color: '#0f172a', fontSize: '14px' }}>{u.username}</strong> 
                <span style={{ color: '#64748b', fontSize: '13px', marginLeft: '8px' }}>({u.email})</span>
                <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', marginLeft: '12px' }}>
                  {u.role}
                </span>
              </div>
              <button onClick={() => handleApprove(u.id)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                Aprobă Accesul
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;