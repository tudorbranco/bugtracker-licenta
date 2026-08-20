import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPanel({ showToast }) {
  const [users, setUsers] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      // Folosim ruta generală sau adăugăm fallback pe pending-users dacă rutele noi nu au primit deploy încă
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      // Fallback în caz că ruta /admin/users nu e activă pe server
      try {
        const token = localStorage.getItem('token');
        const resPending = await axios.get(`${API_URL}/admin/pending-users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(resPending.data);
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/admin/approve-user/${id}`, { is_approved: status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(status ? 'Utilizator activat cu succes!' : 'Utilizator dezactivat / refuzat.', 'success');
      fetchUsers();
    } catch (err) {
      showToast('Eroare la actualizarea statusului.', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Sigur doriți să ștergeți definitiv acest cont din sistem?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/admin/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast('Utilizator șters definitiv.', 'info');
        fetchUsers();
      } catch (err) {
        showToast('Eroare la ștergerea utilizatorului.', 'error');
      }
    }
  };

  const pendingUsers = users.filter(u => u.is_approved === false || u.is_approved === null);
  const activeUsers = users.filter(u => u.is_approved === true);

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h3 style={{ marginTop: 0, color: '#0f172a', marginBottom: '20px' }}>Panou Administrare Echipă</h3>

      {/* Secțiunea 1: Cereri În Așteptare */}
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
                    onClick={() => handleUpdateStatus(u.id, true)}
                    style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    Acceptă
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(u.id)}
                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    Refuză
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Secțiunea 2: Membri Activi & Posibilitatea de Dezactivare */}
      <div>
        <h4 style={{ color: '#334155', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
          👥 Membri Activi & Inactivi ({users.length})
        </h4>
        {users.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>Nu există utilizatori înregistrați.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {users.map(u => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: u.is_approved ? '#f8fafc' : '#fef2f2', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>{u.username} <span style={{ fontSize: '12px', color: '#64748b' }}>({u.email})</span></div>
                  <div style={{ fontSize: '12px', color: u.is_approved ? '#059669' : '#dc2626', fontWeight: '500' }}>
                    Rol: {u.role} | Status: {u.is_approved ? '🟢 Activ' : '🔴 Inactiv / Refuzat'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {u.is_approved ? (
                    <button 
                      onClick={() => handleUpdateStatus(u.id, false)}
                      style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      Dezactivează
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleUpdateStatus(u.id, true)}
                      style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      Activează
                    </button>
                  )}
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