import { useEffect, useState } from 'react';
import { Customers as Api } from '../api';

const blank = { name: '', gstin: '', address: '', city: '', state: '', email: '', phone: '', notes: '' };

export default function Customers() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);

  const load = () => Api.list().then(setRows);
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (editing) await Api.update(editing._id, form);
    else await Api.create(form);
    setForm(blank);
    setEditing(null);
    load();
  };
  const startEdit = (row) => { setEditing(row); setForm(row); };
  const remove = async (id) => {
    if (!confirm('Delete this customer?')) return;
    await Api.remove(id); load();
  };

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Customers</h1>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <form onSubmit={save} className="card p-5 lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">{editing ? 'Edit customer' : 'New customer'}</h2>
          {['name','gstin','address','city','state','email','phone','notes'].map((k) => (
            <div key={k} className="mb-2">
              <label className="label">{k}</label>
              {k === 'address' || k === 'notes'
                ? <textarea className="textarea" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                : <input className="input" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} required={k === 'name'} />}
            </div>
          ))}
          <div className="mt-3 flex gap-2">
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Add'}</button>
            {editing && <button type="button" className="btn-secondary" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}
          </div>
        </form>

        <div className="card p-0 lg:col-span-2">
          <table className="table-base">
            <thead>
              <tr><th>Name</th><th>GSTIN</th><th>Phone</th><th></th></tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-slate-400">No customers yet</td></tr>}
              {rows.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50">
                  <td>
                    <div className="font-medium">{c.name}</div>
                    {c.address && <div className="text-xs text-slate-500">{c.address}</div>}
                  </td>
                  <td>{c.gstin}</td>
                  <td>{c.phone}</td>
                  <td className="text-right">
                    <button onClick={() => startEdit(c)} className="text-xs text-slate-600 hover:text-brand">Edit</button>
                    <span className="mx-2 text-slate-300">|</span>
                    <button onClick={() => remove(c._id)} className="text-xs text-red-600">Delete</button>
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
