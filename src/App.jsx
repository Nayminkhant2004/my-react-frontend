import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  // Form State
  const [form, setForm] = useState({
    itemName: '',
    itemCategory: '',
    itemPrice: '',
    status: 'Active'
  });
  const [editingId, setEditingId] = useState(null);

  const API_URL = "http://localhost:3000/api/items";

  // 1. READ (Fetch Items)
  useEffect(() => {
    fetchItems();
  }, [page]);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}?page=${page}&limit=5`);
      const data = await res.json();
      setItems(data.items || []);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  // 2. CREATE & UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    try {
      await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      // Reset form and reload
      setForm({ itemName: '', itemCategory: '', itemPrice: '', status: 'Active' });
      setEditingId(null);
      fetchItems();
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  // 3. DELETE
  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Helper to fill form for editing
  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      itemName: item.itemName,
      itemCategory: item.itemCategory,
      itemPrice: item.itemPrice,
      status: item.status
    });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Item Management (CRUD)</h1>
      
      {/* Form Section */}
      <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h3>{editingId ? "Edit Item" : "Add New Item"}</h3>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
          <input 
            placeholder="Item Name" 
            value={form.itemName} 
            onChange={e => setForm({...form, itemName: e.target.value})} 
            required 
          />
          <input 
            placeholder="Category" 
            value={form.itemCategory} 
            onChange={e => setForm({...form, itemCategory: e.target.value})} 
            required 
          />
          <input 
            type="number" 
            placeholder="Price" 
            value={form.itemPrice} 
            onChange={e => setForm({...form, itemPrice: e.target.value})} 
            required 
          />
          <select 
            value={form.status} 
            onChange={e => setForm({...form, status: e.target.value})}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button type="submit" style={{ backgroundColor: "#0070f3", color: "white", padding: "10px", border: "none" }}>
            {editingId ? "Update Item" : "Create Item"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ itemName: '', itemCategory: '', itemPrice: '', status: 'Active' }); }}>
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* List Section */}
      <table border="1" style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item._id}>
              <td>{item.itemName}</td>
              <td>{item.itemCategory}</td>
              <td>${item.itemPrice}</td>
              <td>{item.status}</td>
              <td>
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item._id)} style={{ marginLeft: "5px", color: "red" }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page} of {totalPages || 1}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

export default App;
