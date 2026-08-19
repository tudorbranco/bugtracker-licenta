function BugList({ bugs, onDeleteBug }) {
  return (
    <div>
      <h2>Lista Bug-uri</h2>
      <ul>
        {bugs.map((b) => (
          <li key={b.id} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc' }}>
            <strong>{b.title}</strong> - {b.severity} <br />
            {b.description} <br />
            <button onClick={() => onDeleteBug(b.id)}>Șterge</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BugList;