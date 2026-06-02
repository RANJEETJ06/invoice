import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Invoices } from '../api';
import { StatusPill } from './Dashboard';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export default function InvoiceList() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  const load = () => Invoices.list({ q, status }).then(setRows);
  useEffect(() => { load(); }, [status]);

  const onDelete = async (id) => {
    if (!confirm('Delete this invoice? This cannot be undone.')) return;
    await Invoices.remove(id);
    load();
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500">{rows.length} invoices</p>
        </div>
        <Link to="/invoices/new" className="btn-primary">+ New Invoice</Link>
      </div>

      <div className="card p-4">
        <div className="mb-3 flex gap-3">
          <input
            className="input max-w-xs"
            placeholder="Search invoice # or customer…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
          <select className="select max-w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="btn-secondary" onClick={load}>Search</button>
        </div>

        <table className="table-base">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Place</th>
              <th className="text-right">Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-slate-400">No invoices found.</td></tr>
            )}
            {rows.map((inv) => (
              <tr key={inv._id} className="hover:bg-slate-50">
                <td className="font-medium"><Link to={`/invoices/${inv._id}`} className="text-brand">{inv.invoiceNo}</Link></td>
                <td>{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
                <td>{inv.billTo?.name || '—'}</td>
                <td>{inv.placeOfSupply}</td>
                <td className="text-right font-semibold">{fmt(inv.grandTotal)}</td>
                <td><StatusPill status={inv.status} /></td>
                <td className="text-right">
                  <Link to={`/invoices/${inv._id}/edit`} className="text-xs font-medium text-slate-600 hover:text-brand">Edit</Link>
                  <span className="mx-2 text-slate-300">|</span>
                  <button onClick={() => onDelete(inv._id)} className="text-xs font-medium text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
