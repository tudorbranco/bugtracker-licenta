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

  const handleSetStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/admin/user-status/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (typeof showToast === 'function') {
        showToast('Status actualizat cu succes!', 'success');
      } else {
        window.alert('Status actualizat cu succes!');
      }
      fetchUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Eroare la actualizarea statusului.';
      if (typeof showToast === 'function') {
        showToast(errorMsg, 'error');
      } else {
        window.alert(errorMsg);
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Sigur doriți să ștergeți definitiv acest cont din sistem?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/admin/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (typeof showToast === 'function') {
          showToast('Utilizator șters definitiv.', 'info');
        } else {
          window.alert('Utilizator șters definitiv.');
        }
        fetchUsers();
      } catch (err) {
        const errorMsg = err.response?.data?.error || 'Eroare la ștergerea utilizatorului.';
        if (typeof showToast === 'function') {
          showToast(errorMsg, 'error');
        } else {
          window.alert(errorMsg);
        }
      }
    }
  };

  const pendingUsers = users.filter(u => u.status === 0);
  const activeUsers = users.filter(u => u.status === 1);
  const inactiveUsers = users.filter(u => u.status === 2);

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h3 style={{ marginTop: 0, color: '#0f172a', marginBottom: '20px' }}>Panou Administrare Echipă</h3>

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
                  <button onClick={() => handleSetStatus(u.id, 1)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Acceptă</button>
                  <button onClick={() => handleSetStatus(u.id, 2)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Refuză</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ color: '#334155', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
          👥 Membri Activi ({activeUsers.length})
        </h4>
        {activeUsers.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>Nu există membri activi.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {activeUsers.map(u => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>{u.username} <span style={{ fontSize: '12px', color: '#64748b' }}>({u.email})</span></div>
                  <div style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>Rol: {u.role} | 🟢 Activ</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleSetStatus(u.id, 2)} style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Dezactivează</button>
                  <button onClick={() => handleDeleteUser(u.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Șterge</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 style={{ color: '#334155', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
          🚫 Membri Inactivi / Refuzați ({inactiveUsers.length})
        </h4>
        {inactiveUsers.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>Nu există membri refuzați sau dezactivați.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {inactiveUsers.map(u => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef2f2', padding: '12px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>{u.username} <span style={{ fontSize: '12px', color: '#64748b' }}>({u.email})</span></div>
                  <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>Rol: {u.role} | 🔴 Inactiv / Refuzat</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleSetStatus(u.id, 1)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Reactivează</button>
                  <button onClick={() => handleDeleteUser(u.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Șterge</button>
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