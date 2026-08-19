import { useState, useEffect } from 'react';
import BugForm from './components/BugForm';
import BugList from './components/BugList';

function App() {
  const [bugs, setBugs] = useState(() => {
    const savedBugs = localStorage.getItem('bugs');
    return savedBugs ? JSON.parse(savedBugs) : [];
  });

  useEffect(() => {
    localStorage.setItem('bugs', JSON.stringify(bugs));
  }, [bugs]);

  const addBug = (bug) => {
    setBugs([...bugs, bug]);
  };

  const deleteBug = (id) => {
    setBugs(bugs.filter((b) => b.id !== id));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Bug Tracker</h1>
      <BugForm onAddBug={addBug} />
      <BugList bugs={bugs} onDeleteBug={deleteBug} />
    </div>
  );
}

export default App;