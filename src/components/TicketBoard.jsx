import { useState } from 'react';
import { updateTicketStatus, assignTicket, deleteTicket } from '../services/api';
import TechLogModal from './TechLogModal';
import EditTicketModal from './EditTicketModal';

function TicketBoard({ tickets, onRefresh, currentUser, currentRole, showToast }) {
  const statuses = ['To Do', 'In Progress', 'Code Review', 'Done'];
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All'); // <--- Stare nouă pentru filtru departament
  const [statusFilter, setStatusFilter] = useState('All');
  const [onlyMyTasks, setOnlyMyTasks] = useState(false);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateTicketStatus(id, newStatus);
      showToast('Statusul tichetului a fost actualizat!', 'success');
      onRefresh();
    } catch (err) {
      showToast('Eroare la actualizarea statusului.', 'error');
    }
  };

  const handleNextStatus = (ticket) => {
    const currentIndex = statuses.indexOf(ticket.status);
    if (currentIndex < statuses.length - 1 && currentIndex !== -1) {
      handleStatusChange(ticket.id, statuses[currentIndex + 1]);
    }
  };

  const handlePrevStatus = (ticket) => {
    const currentIndex = statuses.indexOf(ticket.status);
    if (currentIndex > 0) {
      handleStatusChange(ticket.id, statuses[currentIndex - 1]);
    }
  };

  const handleDragStart = (e, ticketId) => {
    e.dataTransfer.setData('text/plain', ticketId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData('text/plain');
    if (ticketId) {
      const ticket = tickets.find(t => t.id.toString() === ticketId.toString());
      if (ticket && ticket.status !== targetStatus) {
        handleStatusChange(ticket.id, targetStatus);
      }
    }
  };

  const handleSelfAssign = async (id) => {
    try {
      await assignTicket(id, currentUser);
      showToast(`Tichet preluat cu succes de ${currentUser}!`, 'success');
      onRefresh();
    } catch (err) {
      showToast('Eroare la preluarea tichetului.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Ești sigur că vrei să ștergi acest tichet?')) {
      try {
        await deleteTicket(id);
        showToast('Tichet șters din sistem.', 'info');
        onRefresh();
      } catch (err) {
        showToast('Eroare la ștergere.', 'error');
      }
    }
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      Critical: { bg: '#fee2e2', text: '#991b1b' },
      High: { bg: '#ffedd5', text: '#9a3412' },
      Medium: { bg: '#fef9c3', text: '#854d0e' },
      Low: { bg: '#f1f5f9', text: '#475569' }
    };
    const style = colors[severity] || colors.Low;
    return (
      <span style={{ fontSize: '10px', fontWeight: 'bold', background: style.bg, color: style.text, padding: '2px 6px', borderRadius: '4px' }}>
        {severity}
      </span>
    );
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'All' || t.ticket_type === typeFilter;
    const matchesSeverity = severityFilter === 'All' || t.severity === severityFilter;
    const matchesDepartmentFilter = departmentFilter === 'All' || t.department === departmentFilter; // <--- Verificare filtru departament
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesMyTasks = !onlyMyTasks || t.assignee === currentUser;
    
    const isPrivileged = currentRole === 'Admin' || currentRole === 'ProductOwner';
    const matchesDepartment = isPrivileged || !t.department || t.department.toLowerCase() === currentUser.toLowerCase() || t.assignee === currentUser;

    return matchesSearch && matchesType && matchesSeverity && matchesDepartmentFilter && matchesStatus && matchesMyTasks && matchesDepartment;
  });

  return (
    <div>
      {/* Bara de Filtre Avansate */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '12px', marginBottom: '20px', background: '#fff', padding: '16px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="🔍 Caută tichet..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
        />
        <select 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)} 
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff', outline: 'none' }}
        >
          <option value="All">Toate tipurile</option>
          <option value="Bug">Bug</option>
          <option value="Task">Task</option>
          <option value="Story">Story</option>
        </select>
        <select 
          value={severityFilter} 
          onChange={(e) => setSeverityFilter(e.target.value)} 
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff', outline: 'none' }}
        >
          <option value="All">Toate severitățile</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        
        {/* Noul select pentru filtrarea după departament */}
        <select 
          value={departmentFilter} 
          onChange={(e) => setDepartmentFilter(e.target.value)} 
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff', outline: 'none' }}
        >
          <option value="All">Toate departamentele</option>
          <option value="Dev">Dev</option>
          <option value="QA">QA</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="DevOps">DevOps</option>
        </select>

        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff', outline: 'none' }}
        >
          <option value="All">Toate stadiile</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Code Review">Code Review</option>
          <option value="Done">Done</option>
        </select>
        <button 
          onClick={() => setOnlyMyTasks(!onlyMyTasks)}
          style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: onlyMyTasks ? '#2563eb' : '#e2e8f0', color: onlyMyTasks ? '#fff' : '#334155', fontWeight: '600', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}
        >
          {onlyMyTasks ? '📌 Toate Tichetele' : '⭐ Tichetele Mele'}
        </button>
      </div>

      {/* Coloanele Kanban cu Drag & Drop */}
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '10px' }}>
        {statuses.map((status) => {
          if (statusFilter !== 'All' && status !== statusFilter) return null;

          const colTickets = filteredTickets.filter((t) => t.status === status);
          return (
            <div 
              key={status} 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
              style={{ flex: 1, minWidth: '280px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '450px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                <h4 style={{ margin: 0, color: '#334155', fontSize: '15px' }}>{status}</h4>
                <span style={{ background: '#e2e8f0', color: '#475569', fontSize: '12px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px' }}>
                  {colTickets.length}
                </span>
              </div>

              {colTickets.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', marginTop: '40px' }}>Trage tichetele aici sau folosește săgețile</div>
              ) : (
                colTickets.map((t) => (
                  <div 
                    key={t.id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, t.id)}
                    style={{ background: '#fff', padding: '14px', marginBottom: '12px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', cursor: 'grab', wordBreak: 'break-word', overflowWrap: 'break-word' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>
                          {t.ticket_type}
                        </span>
                        {t.department && (
                          <span style={{ fontSize: '11px', fontWeight: '600', color: '#7c3aed', background: '#f3e8ff', padding: '2px 6px', borderRadius: '4px' }}>
                            {t.department}
                          </span>
                        )}
                      </div>
                      {getSeverityBadge(t.severity)}
                    </div>

                    <h5 style={{ margin: '6px 0', fontSize: '14px', color: '#0f172a', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{t.title}</h5>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 10px 0', lineHeight: '1.4', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{t.description}</p>

                    <div style={{ fontSize: '11px', color: '#64748b', background: '#f8fafc', padding: '6px', borderRadius: '4px', marginBottom: '10px' }}>
                      <div>👤 <strong>{t.assignee}</strong></div>
                      <div>⏱️ Est: {t.estimate || 'Nespecificat'}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                        <button 
                          onClick={() => handlePrevStatus(t)} 
                          disabled={statuses.indexOf(t.status) === 0}
                          style={{ background: 'none', border: 'none', cursor: statuses.indexOf(t.status) === 0 ? 'not-allowed' : 'pointer', fontSize: '14px', color: statuses.indexOf(t.status) === 0 ? '#cbd5e1' : '#2563eb', fontWeight: 'bold' }}
                          title="Mută în starea anterioară"
                        >
                          ◀
                        </button>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>{t.status}</span>
                        <button 
                          onClick={() => handleNextStatus(t)} 
                          disabled={statuses.indexOf(t.status) === statuses.length - 1}
                          style={{ background: 'none', border: 'none', cursor: statuses.indexOf(t.status) === statuses.length - 1 ? 'not-allowed' : 'pointer', fontSize: '14px', color: statuses.indexOf(t.status) === statuses.length - 1 ? '#cbd5e1' : '#2563eb', fontWeight: 'bold' }}
                          title="Mută în starea următoare"
                        >
                          ▶
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', gap: '4px', flexWrap: 'wrap' }}>
                        <button onClick={() => handleSelfAssign(t.id)} style={{ background: '#0ea5e9', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '500' }}>
                          Preia
                        </button>
                        <button onClick={() => setSelectedTicket(t)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '500' }}>
                          Dev Log
                        </button>
                        {(currentRole === 'Admin' || currentRole === 'ProductOwner') && (
                          <>
                            <button onClick={() => setEditingTicket(t)} style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '500' }}>
                              Editează
                            </button>
                            <button onClick={() => handleDelete(t.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '500' }}>
                              Șterge
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>

      {selectedTicket && (
        <TechLogModal ticket={selectedTicket} currentUser={currentUser} currentRole={currentRole} showToast={showToast} onClose={() => setSelectedTicket(null)} />
      )}

      {editingTicket && (
        <EditTicketModal ticket={editingTicket} onClose={() => setEditingTicket(null)} onRefresh={onRefresh} showToast={showToast} />
      )}
    </div>
  );
}

export default TicketBoard;