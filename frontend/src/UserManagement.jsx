import React, { useState, useEffect } from 'react';
import { fetchUsers, deleteUser, updateUserRole } from './api';

export default function UserManagement({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await fetchUsers();
        setUsers(response.data);
      } catch (err) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (userId === user.id) {
      alert("You can't delete yourself!");
      return;
    }
    
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userId === user.id) {
      alert("You can't change your own role!");
      return;
    }

    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="p-4 bg-white border border-black mb-4">
      <h3 className="text-xl mb-2">👥 User Management (Admin Only)</h3>
      
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-black p-2">ID</th>
            <th className="border border-black p-2">Username</th>
            <th className="border border-black p-2">Role</th>
            <th className="border border-black p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((userItem) => (
            <tr key={userItem.id}>
              <td className="border border-black p-2">{userItem.id}</td>
              <td className="border border-black p-2">
                {userItem.username}
                {userItem.id === user.id && ' (You)'}
              </td>
              <td className="border border-black p-2">
                <select
                  value={userItem.role}
                  onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                  disabled={userItem.id === user.id}
                  className="p-1 border border-gray-400"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="border border-black p-2">
                <button
                  onClick={() => handleDeleteUser(userItem.id)}
                  disabled={userItem.id === user.id}
                  className="p-1 bg-red-600 text-white border border-black text-sm disabled:opacity-50"
                >
                  🗑️ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}