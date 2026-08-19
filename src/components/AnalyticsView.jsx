import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

function AnalyticsView({ tickets }) {
  // Date pentru stări (To Do, In Progress, Code Review, Done)
  const statusData = [
    { name: 'To Do', value: tickets.filter(t => t.status === 'To Do').length, color: '#94a3b8' },
    { name: 'In Progress', value: tickets.filter(t => t.status === 'In Progress').length, color: '#0284c7' },
    { name: 'Code Review', value: tickets.filter(t => t.status === 'Code Review').length, color: '#f59e0b' },
    { name: 'Done', value: tickets.filter(t => t.status === 'Done').length, color: '#10b981' },
  ];

  // Date pentru severități
  const severityData = [
    { name: 'Critical', count: tickets.filter(t => t.severity === 'Critical').length },
    { name: 'High', count: tickets.filter(t => t.severity === 'High').length },
    { name: 'Medium', count: tickets.filter(t => t.severity === 'Medium').length },
    { name: 'Low', count: tickets.filter(t => t.severity === 'Low').length },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
      {/* Grafic Stări */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a' }}>Distribuție Tichete după Status</h3>
        <div style={{ width: '100%', height: '250px' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grafic Severități */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a' }}>Distribuție Tichete după Severitate</h3>
        <div style={{ width: '100%', height: '250px' }}>
          <ResponsiveContainer>
            <BarChart data={severityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsView;