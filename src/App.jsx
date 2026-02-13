import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);

  // Form State
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    firstname: '',
    lastname: '',
    status: 'Active'
  });
  const [editingId, setEditingId] = useState(null);

  const API_URL = "http://localhost:3000/api/users";

  // 1. READ (Fetch Users)
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      // Ensure data is an array
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // 2. CREATE & UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const result = await res.json();
      if (result.error) {
          alert(result.error);
          return;
      }

      // Reset form and reload
      setForm({ username: '', password: '', email: '', firstname: '', lastname: '', status: 'Active' });
      setEditingId(null);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  // 3. DELETE
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Helper to fill form for editing
  const handleEdit = (user) => {
    setEditingId(user._id);
    setForm({
      username: user.username,
      password: '', // We don't fill password on edit for security
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      status: user.status || 'Active'
    });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>User Management System</h1>

      {/* Form Section */}
      <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h3>{editingId ? "Edit User" : "Add New User"}</h3>
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>

          <input placeholder="Username" value={form.username} 
            onChange={e => setForm({...form, username: e.target.value})} 
            disabled={!!editingId} required />

          {!editingId && (
              <input type="password" placeholder="Password" value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
                required />
          )}

          <input type="email" placeholder="Email" value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})} 
            required />

          <input placeholder="First Name" value={form.firstname} 
            onChange={e => setForm({...form, firstname: e.target.value})} 
            required />

          <input placeholder="Last Name" value={form.lastname} 
            onChange={e => setForm({...form, lastname: e.target.value})} 
            required />

          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <div style={{ gridColumn: "span 2" }}>
              <button type="submit" style={{ backgroundColor: "#0070f3", color: "white", padding: "10px", width: "100%", border: "none", cursor: "pointer" }}>
                {editingId ? "Update User" : "Register User"}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setForm({ username: '', password: '', email: '', firstname: '', lastname: '', status: 'Active' }); }}
                    style={{ marginTop: "5px", width: "100%", padding: "5px" }}>
                  Cancel
                </button>
              )}
          </div>
        </form>
      </div>

      {/* List Section */}
      <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th>Username</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.firstname} {user.lastname}</td>
              <td>{user.email}</td>
              <td>{user.status}</td>
              <td style={{ textAlign: "center" }}>
                <button onClick={() => handleEdit(user)} style={{ marginRight: "5px" }}>Edit</button>
                <button onClick={() => handleDelete(user._id)} style={{ color: "red" }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
