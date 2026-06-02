import { useEffect, useState } from 'react';
import { Products as Api } from '../api';

const blank = { name: '', hsnCode: '', unit: 'Kg', rate: 0, description: '' };

export default function Products() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);

  const load = () => Api.list().then(setRows);
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (editing) await Api.update(editing._id, form);
    else await Api.create(form);
    setForm(blank); setEditing(null); load();
  };
  const startEdit = (row) => { setEditing(row); setForm(row); };
  const remove = async (id) => {
    if (!confirm('Delete this product?')) return;
    await Api.remove(id); load();
  };

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Products</h1>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <form onSubmit={save} className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">{editing ? 'Edit product' : 'New product'}</h2>
          <div className="mb-2"><label className="label">Name</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="mb-2"><label className="label">HSN Code</label><input className="input" value={form.hsnCode} onChange={(e) => setForm({ ...form, hsnCode: e.target.value })} /></div>
          <div className="mb-2 grid grid-cols-2 gap-2">
            <div><label className="label">Unit</label><input className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
            <div><label className="label">Rate (₹)</label><input type="number" step="0.01" className="input" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} /></div>
          </div>
          <div className="mb-2"><label className="label">Description</label><textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="mt-3 flex gap-2">
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Add'}</button>
            {editing && <button type="button" className="btn-secondary" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}
          </div>
        </form>

        <div className="card p-0 lg:col-span-2">
          <table className="table-base">
            <thead><tr><th>Name</th><th>HSN</th><th>Unit</th><th className="text-right">Rate</th><th></th></tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-slate-400">No products yet</td></tr>}
              {rows.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50">
                  <td><div className="font-medium">{p.name}</div>{p.description && <div className="text-xs text-slate-500">{p.description}</div>}</td>
                  <td>{p.hsnCode}</td>
                  <td>{p.unit}</td>
                  <td className="text-right">₹{Number(p.rate).toFixed(2)}</td>
                  <td className="text-right">
                    <button onClick={() => startEdit(p)} className="text-xs text-slate-600 hover:text-brand">Edit</button>
                    <span className="mx-2 text-slate-300">|</span>
                    <button onClick={() => remove(p._id)} className="text-xs text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
