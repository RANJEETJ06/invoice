import { useEffect, useState } from 'react';
import { Companies } from '../api';

export default function CompanySettings() {
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { Companies.getDefault().then(setForm); }, []);

  if (!form) return <div className="p-8 text-slate-500">Loading…</div>;

  const upd = (k, v) => setForm({ ...form, [k]: v });

  const save = async (e) => {
    e.preventDefault();
    const c = await Companies.saveDefault(form);
    setForm(c);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Company Settings</h1>
      <form onSubmit={save} className="card max-w-3xl p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Company Name" k="name" form={form} upd={upd} required />
          <Field label="GSTIN" k="gstin" form={form} upd={upd} />
          <div className="md:col-span-2"><Field label="Address" k="address" form={form} upd={upd} textarea /></div>
          <Field label="Email" k="email" form={form} upd={upd} />
          <Field label="Phone" k="phone" form={form} upd={upd} />
          <Field label="Default Payment Terms" k="paymentTerms" form={form} upd={upd} />
        </div>
        <h2 className="mt-6 mb-2 text-sm font-semibold text-slate-700">Bank Details (printed on invoices)</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Account Name" k="bankAccountName" form={form} upd={upd} />
          <Field label="Firm Name" k="bankFirmName" form={form} upd={upd} />
          <Field label="Account Number" k="bankAccountNo" form={form} upd={upd} />
          <Field label="IFSC" k="bankIfsc" form={form} upd={upd} />
          <Field label="Bank Name" k="bankName" form={form} upd={upd} />
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button type="submit" className="btn-primary">Save</button>
          {saved && <span className="text-sm text-emerald-600">Saved ✓</span>}
        </div>
      </form>
    </div>
  );
}

function Field({ label, k, form, upd, textarea = false, required = false }) {
  return (
    <div>
      <label className="label">{label}</label>
      {textarea
        ? <textarea className="textarea" value={form[k] || ''} onChange={(e) => upd(k, e.target.value)} />
        : <input className="input" value={form[k] || ''} onChange={(e) => upd(k, e.target.value)} required={required} />}
    </div>
  );
}
