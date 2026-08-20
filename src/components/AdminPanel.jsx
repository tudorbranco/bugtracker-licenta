import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPanel({ showToast }) {
  const [users, setUsers] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleApproval = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/admin/approve-user/${id}`, { is_approved: !currentStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(currentStatus ? 'Accesul utilizatorului a fost revocat.' : 'Utilizator aprobat cu succes!', 'success');
      fetchUsers();
    } catch (err) {
      showToast('Eroare la modificarea accesului.', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Sigur doriți să refuzați și să ștergeți acest cont?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/admin/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast('Utilizator refuzat și șters din sistem.', 'info');
        fetchUsers();
      } catch (err) {
        showToast('Eroare la ștergerea utilizatorului.', 'error');
      }
    }
  };

  const pendingUsers = users.filter(u => !u.is_approved);
  const activeUsers = users.filter(u => u.is_approved);

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h3 style={{ marginTop: 0, color: '#0f172a', marginBottom: '20px' }}>Panou Administrare Echipă</h3>

      {/* Secțiunea 1: Utilizatori în așteptare / cereri noi */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ color: '#334155', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
          ⏳ Cereri În Așteptare ({pendingUsers.length})
        </h4>
        {pendingUsers.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>Nu există cereri în așteptare.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {pendingUsers.map(u => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>{u.username} <span style={{ fontSize: '12px', color: '#64748b' }}>({u.email})</span></div>
                  <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '500' }}>Rol: {u.role}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleToggleApproval(u.id, u.is_approved)}
                    style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    Acceptă
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(u.id)}
                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    Refuză / Șterge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Secțiunea 2: Membri Activi */}
      <div>
        <h4 style={{ color: '#334155', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
          👥 Membri Activi în Echipă ({activeUsers.length})
        </h4>
        {activeUsers.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>Nu există membri activi.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {activeUsers.map(u => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>{u.username} <span style={{ fontSize: '12px', color: '#64748b' }}>({u.email})</span></div>
                  <div style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>Rol: {u.role} (Activ)</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleToggleApproval(u.id, u.is_approved)}
                    style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    Revocă Accesul
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(u.id)}
                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    Șterge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;