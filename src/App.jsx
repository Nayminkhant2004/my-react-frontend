import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [file, setFile] = useState(null); // State for the selected file

  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    firstname: '',
    lastname: '',
    profileImage: '', // New field for image URL
    status: 'Active'
  });
  const [editingId, setEditingId] = useState(null);

  const API_URL = "http://localhost:3000/api/users";
  const UPLOAD_URL = "http://localhost:3000/api/upload";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Upload Image First (if a file is selected)
    let finalImageUrl = form.profileImage;

    if (file) {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const uploadRes = await fetch(UPLOAD_URL, {
                method: "POST",
                body: formData
            });
            const uploadData = await uploadRes.json();

            if (uploadData.error) {
                alert(uploadData.error);
                return;
            }
            finalImageUrl = uploadData.url; // Get the URL from the backend
        } catch (error) {
            console.error("Upload failed", error);
            alert("Image upload failed");
            return;
        }
    }

    // 2. Save User Data with Image URL
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    const userData = { ...form, profileImage: finalImageUrl };

    try {
      await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      // Reset form
      setForm({ username: '', password: '', email: '', firstname: '', lastname: '', profileImage: '', status: 'Active' });
      setFile(null);
      setEditingId(null);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  const handleEdit = (user) => {
    setEditingId(user._id);
    setForm({
      username: user.username,
      password: '', 
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      profileImage: user.profileImage || '',
      status: user.status || 'Active'
    });
    setFile(null); // Clear file input
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto", fontFamily: "Arial" }}>
      <h1>User Profile Management</h1>

      {/* Form */}
      <div style={{ marginBottom: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px", background: "#f9f9f9" }}>
        <h3>{editingId ? "Edit Profile" : "Create New Profile"}</h3>
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>

          <input placeholder="Username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} disabled={!!editingId} required />
          {!editingId && <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />}
          <input placeholder="First Name" value={form.firstname} onChange={e => setForm({...form, firstname: e.target.value})} required />
          <input placeholder="Last Name" value={form.lastname} onChange={e => setForm({...form, lastname: e.target.value})} required />
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />

          {/* Image Upload Input */}
          <div style={{ gridColumn: "span 2" }}>
              <label><strong>Profile Image: </strong></label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {form.profileImage && <p style={{fontSize: "12px", color: "green"}}>Current Image: Has Image</p>}
          </div>

          <div style={{ gridColumn: "span 2" }}>
              <button type="submit" style={{ background: "#0070f3", color: "white", padding: "12px", width: "100%", border: "none", cursor: "pointer", borderRadius: "5px" }}>
                {editingId ? "Update Profile" : "Create Profile"}
              </button>
              {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ username: '', password: '', email: '', firstname: '', lastname: '', profileImage: '', status: 'Active' }); setFile(null); }} style={{ marginTop: "10px", width: "100%", padding: "8px" }}>Cancel</button>}
          </div>
        </form>
      </div>

      {/* List */}
      <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th>Image</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td style={{ textAlign: "center", padding: "10px" }}>
                  {/* Display Image */}
                  {user.profileImage ? (
                      <img src={user.profileImage} alt="Profile" style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                      <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#ddd", margin: "0 auto", lineHeight: "50px" }}>No Img</div>
                  )}
              </td>
              <td>{user.firstname} {user.lastname} <br/> <small style={{color: "gray"}}>({user.username})</small></td>
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
