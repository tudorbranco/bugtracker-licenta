import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import TicketForm from './components/TicketForm';
import TicketBoard from './components/TicketBoard';
import AnalyticsView from './components/AnalyticsView';
import BusinessDashboard from './components/BusinessDashboard';
import TechWorkspace from './components/TechWorkspace';
import TimeframeView from './components/TimeframeView'; // <--- Import nou
import Toast from './components/Toast';
import Papa from 'papaparse';
import { getTickets, deleteTicket } from './services/api';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('board'); // 'board', 'backlog', 'timeframe', 'business', 'tech', 'analytics', 'team'
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchTickets = async () => {
    try {
      const res = await getTickets();
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

 const exportToCSV = () => {
  const data = tickets.map(t => ({
    ID: t.id,
    Titlu: t.title,
    Tip: t.ticket_type,
    Severitate: t.severity,
    Status: t.status,
    Asignat: t.assignee,
    Creat_de: t.created_by
  }));

  const csv = Papa.unparse(data, {
    delimiter: ";",
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'raport_bugtracker.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Raport CSV descărcat!', 'success');
};

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Raport Licență - BugTracker</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h1 { color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
            th { background: #0f172a; color: #fff; }
          </style>
        </head>
        <body>
          <h1>Raport Tehnic și Management - BugTracker</h1>
          <p>Generat în data de: ${new Date().toLocaleString()}</p>
          <h3>Sumar Tichete Active: Total ${tickets.length}</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Titlu</th>
                <th>Tip</th>
                <th>Severitate</th>
                <th>Status</th>
                <th>Asignat</th>
              </tr>
            </thead>
            <tbody>
              ${tickets.map(t => `
                <tr>
                  <td>#${t.id}</td>
                  <td>${t.title}</td>
                  <td>${t.ticket_type}</td>
                  <td>${t.severity}</td>
                  <td>${t.status}</td>
                  <td>${t.assignee}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (!user) {
    return (
      <div>
        <Auth onLoginSuccess={(u) => { setUser(u); showToast('Autentificare reușită!', 'success'); }} />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  const totalTickets = tickets.length;
  const completedTickets = tickets.filter(t => t.status === 'Done').length;
  const inProgressTickets = tickets.filter(t => t.status === 'In Progress' || t.status === 'Code Review').length;

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, system-ui, sans-serif', maxWidth: '1400px', margin: '0 auto', background: '#f1f5f9', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Navbar Superior */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', color: '#fff', padding: '16px 24px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', letterSpacing: '-0.5px' }}>BugTracker</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '14px' }}>Conectat: <strong>{user.username}</strong> <span style={{ background: '#334155', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', marginLeft: '6px' }}>{user.role}</span></span>
          <button onClick={handleLogout} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
            Deconectare
          </button>
        </div>
      </div>

      {/* Metrice Agile */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Total Tichete Active</span>
          <h3 style={{ margin: '6px 0 0 0', fontSize: '24px', color: '#0f172a' }}>{totalTickets}</h3>
        </div>
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>În Lucru / Review</span>
          <h3 style={{ margin: '6px 0 0 0', fontSize: '24px', color: '#0284c7' }}>{inProgressTickets}</h3>
        </div>
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Rezolvate (Done)</span>
          <h3 style={{ margin: '6px 0 0 0', fontSize: '24px', color: '#10b981' }}>{completedTickets}</h3>
        </div>
      </div>

      {/* Tab-uri navigare extinse */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveTab('board')} 
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'board' ? '#2563eb' : '#fff', color: activeTab === 'board' ? '#fff' : '#475569', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            📌 Board Kanban
          </button>
          <button 
            onClick={() => setActiveTab('backlog')} 
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'backlog' ? '#2563eb' : '#fff', color: activeTab === 'backlog' ? '#fff' : '#475569', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            📋 Backlog & Listă
          </button>
          <button 
            onClick={() => setActiveTab('timeframe')} 
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'timeframe' ? '#2563eb' : '#fff', color: activeTab === 'timeframe' ? '#fff' : '#475569', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            ⏳ Timeframe
          </button>
          <button 
            onClick={() => setActiveTab('business')} 
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'business' ? '#2563eb' : '#fff', color: activeTab === 'business' ? '#fff' : '#475569', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            📈 Business View
          </button>
          <button 
            onClick={() => setActiveTab('tech')} 
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'tech' ? '#2563eb' : '#fff', color: activeTab === 'tech' ? '#fff' : '#475569', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            💻 Tech Workspace
          </button>
          <button 
            onClick={() => setActiveTab('analytics')} 
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'analytics' ? '#2563eb' : '#fff', color: activeTab === 'analytics' ? '#fff' : '#475569', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            📊 Statistici
          </button>
          {user.role === 'Admin' && (
            <button 
              onClick={() => setActiveTab('team')} 
              style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'team' ? '#2563eb' : '#fff', color: activeTab === 'team' ? '#fff' : '#475569', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            >
              👥 Echipă
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={exportToCSV}
            style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            📥 Export CSV
          </button>
          <button 
            onClick={handlePrintReport}
            style={{ background: '#475569', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            🖨️ Printează PDF
          </button>
        </div>
      </div>

      {/* Conținut Tab-uri */}
      {activeTab === 'board' && (
        <div>
          {(user.role === 'Admin' || user.role === 'ProductOwner') && (
            <TicketForm onTicketCreated={fetchTickets} currentUser={user.username} showToast={showToast} />
          )}
          <TicketBoard tickets={tickets} onRefresh={fetchTickets} currentUser={user.username} currentRole={user.role} showToast={showToast} />
        </div>
      )}

      {activeTab === 'backlog' && (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#0f172a' }}>Backlog General (Toate Tichetele)</h3>
            {(user.role === 'Admin' || user.role === 'ProductOwner') && (
              <TicketForm onTicketCreated={fetchTickets} currentUser={user.username} showToast={showToast} />
            )}
          </div>
          {tickets.length === 0 ? (
            <p style={{ color: '#64748b' }}>Nu există tichete în sistem.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '12px' }}>ID</th>
                    <th style={{ padding: '12px' }}>Titlu</th>
                    <th style={{ padding: '12px' }}>Tip</th>
                    <th style={{ padding: '12px' }}>Severitate</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Asignat</th>
                    <th style={{ padding: '12px' }}>Creat de</th>
                    {(user.role === 'Admin' || user.role === 'ProductOwner') && <th style={{ padding: '12px' }}>Acțiuni</th>}
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0', color: '#334155' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>#{t.id}</td>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{t.title}</td>
                      <td style={{ padding: '12px' }}><span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>{t.ticket_type}</span></td>
                      <td style={{ padding: '12px' }}>{t.severity}</td>
                      <td style={{ padding: '12px' }}><span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{t.status}</span></td>
                      <td style={{ padding: '12px' }}>{t.assignee}</td>
                      <td style={{ padding: '12px' }}>{t.created_by}</td>
                      {(user.role === 'Admin' || user.role === 'ProductOwner') && (
                        <td style={{ padding: '12px' }}>
                          <button 
                            onClick={async () => {
                              if(window.confirm('Sigur doriți să ștergeți acest tichet?')) {
                                await deleteTicket(t.id);
                                showToast('Tichet șters din sistem.', 'info');
                                fetchTickets();
                              }
                            }} 
                            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Șterge
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'timeframe' && (
        <TimeframeView tickets={tickets} />
      )}

      {activeTab === 'business' && (
        <BusinessDashboard tickets={tickets} />
      )}

      {activeTab === 'tech' && (
        <TechWorkspace />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsView tickets={tickets} />
      )}

      {activeTab === 'team' && user.role === 'Admin' && (
        <div>
          <AdminPanel />
        </div>
      )}

    </div>
  );
}

export default App;