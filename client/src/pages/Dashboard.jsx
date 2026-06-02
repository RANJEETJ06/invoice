import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stats } from '../api';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    Stats.dashboard().then(setData).catch((e) => setErr(e.message));
  }, []);

  if (err) return <div className="p-8 text-red-600">Error: {err}</div>;
  if (!data) return <div className="p-8 text-slate-500">Loading…</div>;

  const maxMonth = Math.max(1, ...data.monthly.map((m) => m.total));

  return (
    <div className="p-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of invoicing activity.</p>
        </div>
        <Link to="/invoices/new" className="btn-primary">+ Create Invoice</Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Total Invoiced" value={fmt(data.totalInvoiced)} hint={`${data.count} invoices`} />
        <StatCard label="Outstanding" value={fmt(data.totalOutstanding)} tone="amber" />
        <StatCard label="Collected" value={fmt(data.totalPaid)} tone="emerald" />
        <StatCard label="This Month" value={fmt(data.monthInvoiced)} hint={`${data.monthCount} invoices`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Monthly Invoiced ({new Date().getFullYear()})</h2>
          </div>
          <div className="flex h-56 items-end gap-3">
            {Array.from({ length: 12 }).map((_, i) => {
              const m = data.monthly.find((x) => x.month === i + 1);
              const v = m?.total || 0;
              const h = Math.max(2, Math.round((v / maxMonth) * 100));
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-brand transition"
                      style={{ height: `${h}%` }}
                      title={fmt(v)}
                    />
                  </div>
                  <div className="text-[10px] font-medium text-slate-500">{MONTH_NAMES[i]}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">By Status</h2>
          <ul className="space-y-2">
            {data.byStatus.length === 0 && <li className="text-sm text-slate-400">No data</li>}
            {data.byStatus.map((s) => (
              <li key={s._id} className="flex items-center justify-between text-sm">
                <span className="capitalize text-slate-600">{s._id}</span>
                <span className="font-semibold">{fmt(s.total)} <span className="text-xs text-slate-400">({s.count})</span></span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 card overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-700">Recent Invoices</h2>
          <Link to="/invoices" className="text-xs font-medium text-brand hover:underline">View all →</Link>
        </div>
        <table className="table-base">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Customer</th>
              <th className="text-right">Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.recent.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-slate-400">No invoices yet</td></tr>
            )}
            {data.recent.map((inv) => (
              <tr key={inv._id} className="hover:bg-slate-50">
                <td className="font-medium"><Link to={`/invoices/${inv._id}`} className="text-brand">{inv.invoiceNo}</Link></td>
                <td>{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
                <td>{inv.billTo?.name || '—'}</td>
                <td className="text-right font-semibold">{fmt(inv.grandTotal)}</td>
                <td><StatusPill status={inv.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, hint, tone = 'slate' }) {
  const toneMap = {
    slate: 'text-slate-900',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
  };
  return (
    <div className="card p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${toneMap[tone]}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}

export function StatusPill({ status }) {
  const map = {
    draft: 'bg-slate-100 text-slate-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-emerald-100 text-emerald-700',
    partial: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${map[status] || map.draft}`}>
      {status}
    </span>
  );
}
