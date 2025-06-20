import React from 'react';

export default function ComplaintList({ complaints, onDelete, userRole }) {
  if (!complaints || complaints.length === 0) {
    return <div>No complaints yet.</div>;
  }

  const isAdmin = userRole === 'admin';

  return (
    <div className="complaints-list">
      <ul>
        {complaints.map((complaint) => (
          <li key={complaint.id} className="mb-2 p-2 bg-white border border-black">
            <div>
              <strong>{complaint.user}</strong>
              {complaint.email && isAdmin && ` (${complaint.email})`}: {complaint.complaint}
            </div>
            <div className="text-sm text-gray-600">
              {complaint.date} at {complaint.hour}
            </div>
            {isAdmin && (
              <button 
                onClick={() => onDelete(complaint.id)} 
                className="mt-1 p-1 bg-red-600 text-white border border-black text-sm"
              >
                🗑️ Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
