import axios from 'axios';
import { useEffect, useState } from 'react';

function ComplaintList() {
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Fetching complaints...');
    axios.get('/api/complaints')
      .then(res => {
        console.log('Complaints data:', res.data);  // << Check if data arrives here
        setComplaints(res.data);
      })
      .catch(err => {
        console.error('Error fetching complaints:', err);
        setError(err.message);
      });
  }, []);

  if (error) return <div>Couldn’t load complaints: {error}</div>;

  if (complaints.length === 0) return <div>No complaints yet.</div>;  // Defensive UI

  return (
    <ul>
      {complaints.map(c => (
        <li key={c.id}>{c.user}: {c.complaint}</li>
      ))}
    </ul>
  );
}

export default ComplaintList;
