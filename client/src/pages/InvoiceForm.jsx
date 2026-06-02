import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Invoices, Customers, Products, Companies } from '../api';

const blankItem = () => ({ name: '', hsnCode: '', qty: 0, unit: 'Kg', rate: 0 });
const blankParty = () => ({ name: '', gstin: '', address: '', email: '', phone: '' });
const todayISO = () => new Date().toISOString().slice(0, 10);

const inr = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

export default function InvoiceForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    invoiceNo: '',
    invoiceDate: todayISO(),
    placeOfSupply: 'Maharashtra',
    paymentTerms: '40% Advance, Balance 8-15 Days',
    seller: blankParty(),
    billTo: blankParty(),
    shipTo: blankParty(),
    sameAsBillTo: true,
    vehicleNumber: '',
    driverName: '',
    driverContact: '',
    items: [blankItem()],
    cgstPercent: 2.5,
    sgstPercent: 2.5,
    igstPercent: 0,
    transportCharges: 0,
    otherCharges: 0,
    status: 'draft',
    notes: '',
    bankAccountName: '',
    bankFirmName: '',
    bankAccountNo: '',
    bankIfsc: '',
    bankName: '',
  });

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Customers.list().then(setCustomers);
    Products.list().then(setProducts);
    if (!editing) {
      Companies.getDefault().then((c) => {
        setForm((f) => ({
          ...f,
          seller: { name: c.name, gstin: c.gstin, address: c.address, email: c.email, phone: c.phone },
          paymentTerms: c.paymentTerms || f.paymentTerms,
          bankAccountName: c.bankAccountName || '',
          bankFirmName: c.bankFirmName || '',
          bankAccountNo: c.bankAccountNo || '',
          bankIfsc: c.bankIfsc || '',
          bankName: c.bankName || '',
        }));
      });
      Invoices.nextNumber().then((r) => setForm((f) => ({ ...f, invoiceNo: r.invoiceNo })));
    } else {
      Invoices.get(id).then((inv) => {
        setForm({
          ...inv,
          invoiceDate: inv.invoiceDate ? inv.invoiceDate.slice(0, 10) : todayISO(),
          shipTo: inv.shipTo || blankParty(),
          billTo: inv.billTo || blankParty(),
          seller: inv.seller || blankParty(),
        });
      });
    }
  }, [id, editing]);

  const totals = useMemo(() => {
    const taxable = form.items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0);
    const cgst = (taxable * (Number(form.cgstPercent) || 0)) / 100;
    const sgst = (taxable * (Number(form.sgstPercent) || 0)) / 100;
    const igst = (taxable * (Number(form.igstPercent) || 0)) / 100;
    const transport = Number(form.transportCharges) || 0;
    const other = Number(form.otherCharges) || 0;
    const raw = taxable + cgst + sgst + igst + transport + other;
    const grand = Math.round(raw);
    return { taxable, cgst, sgst, igst, transport, other, grand, roundOff: grand - raw };
  }, [form]);

  const upd = (path, value) => {
    setForm((f) => {
      const next = structuredClone(f);
      const parts = path.split('.');
      let ref = next;
      for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]];
      ref[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const updItem = (i, key, value) => {
    setForm((f) => {
      const items = f.items.slice();
      items[i] = { ...items[i], [key]: value };
      return { ...f, items };
    });
  };

  const pickCustomer = (cid) => {
    const c = customers.find((x) => x._id === cid);
    if (!c) return;
    setForm((f) => ({
      ...f,
      billTo: { name: c.name, gstin: c.gstin || '', address: c.address || '', email: c.email || '', phone: c.phone || '' },
    }));
  };

  const pickProductIntoRow = (i, pid) => {
    const p = products.find((x) => x._id === pid);
    if (!p) return;
    updItem(i, 'name', p.name);
    updItem(i, 'hsnCode', p.hsnCode || '');
    updItem(i, 'unit', p.unit || 'Kg');
    updItem(i, 'rate', p.rate || 0);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = editing
        ? await Invoices.update(id, form)
        : await Invoices.create(form);
      navigate(`/invoices/${saved._id}`);
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="p-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{editing ? 'Edit Invoice' : 'New Invoice'}</h1>
          <p className="text-sm text-slate-500">Fill in customer, items and tax details.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Invoice'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Invoice Details</h2>
          <div className="space-y-3">
            <div>
              <label className="label">Invoice No</label>
              <input className="input" value={form.invoiceNo} onChange={(e) => upd('invoiceNo', e.target.value)} required />
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={form.invoiceDate} onChange={(e) => upd('invoiceDate', e.target.value)} required />
            </div>
            <div>
              <label className="label">Place of Supply</label>
              <input className="input" value={form.placeOfSupply} onChange={(e) => upd('placeOfSupply', e.target.value)} />
            </div>
            <div>
              <label className="label">Payment Terms</label>
              <input className="input" value={form.paymentTerms} onChange={(e) => upd('paymentTerms', e.target.value)} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={(e) => upd('status', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Bill To</h2>
            <select className="select max-w-[240px]" defaultValue="" onChange={(e) => pickCustomer(e.target.value)}>
              <option value="">— Pick saved customer —</option>
              {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div><label className="label">Name</label><input className="input" value={form.billTo.name} onChange={(e) => upd('billTo.name', e.target.value)} required /></div>
            <div><label className="label">GSTIN</label><input className="input" value={form.billTo.gstin} onChange={(e) => upd('billTo.gstin', e.target.value)} /></div>
            <div className="md:col-span-2"><label className="label">Address</label><textarea className="textarea" value={form.billTo.address} onChange={(e) => upd('billTo.address', e.target.value)} /></div>
            <div><label className="label">Email</label><input className="input" value={form.billTo.email} onChange={(e) => upd('billTo.email', e.target.value)} /></div>
            <div><label className="label">Phone</label><input className="input" value={form.billTo.phone} onChange={(e) => upd('billTo.phone', e.target.value)} /></div>
          </div>

          <div className="mt-5">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.sameAsBillTo}
                onChange={(e) => upd('sameAsBillTo', e.target.checked)}
              />
              Ship To is same as Bill To
            </label>
          </div>
          {!form.sameAsBillTo && (
            <div className="mt-3 grid grid-cols-1 gap-3 border-t pt-3 md:grid-cols-2">
              <div className="md:col-span-2"><h3 className="text-sm font-semibold">Ship To</h3></div>
              <div><label className="label">Name</label><input className="input" value={form.shipTo.name} onChange={(e) => upd('shipTo.name', e.target.value)} /></div>
              <div><label className="label">GSTIN</label><input className="input" value={form.shipTo.gstin} onChange={(e) => upd('shipTo.gstin', e.target.value)} /></div>
              <div className="md:col-span-2"><label className="label">Address</label><textarea className="textarea" value={form.shipTo.address} onChange={(e) => upd('shipTo.address', e.target.value)} /></div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 card p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Vehicle Details</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div><label className="label">Vehicle Number</label><input className="input" value={form.vehicleNumber} onChange={(e) => upd('vehicleNumber', e.target.value)} /></div>
          <div><label className="label">Driver Name</label><input className="input" value={form.driverName} onChange={(e) => upd('driverName', e.target.value)} /></div>
          <div><label className="label">Driver Contact</label><input className="input" value={form.driverContact} onChange={(e) => upd('driverContact', e.target.value)} /></div>
        </div>
      </div>

      <div className="mt-4 card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Items</h2>
          <button type="button" className="btn-secondary text-xs" onClick={() => setForm((f) => ({ ...f, items: [...f.items, blankItem()] }))}>+ Add row</button>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>Product</th>
                <th>HSN</th>
                <th className="w-24">Qty</th>
                <th className="w-20">Unit</th>
                <th className="w-28">Rate (₹)</th>
                <th className="w-32 text-right">Amount (₹)</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {form.items.map((it, i) => (
                <tr key={i}>
                  <td className="text-xs text-slate-400">{i + 1}</td>
                  <td>
                    <input className="input" value={it.name} onChange={(e) => updItem(i, 'name', e.target.value)} required placeholder="Product name" />
                    <select className="mt-1 select text-xs" defaultValue="" onChange={(e) => pickProductIntoRow(i, e.target.value)}>
                      <option value="">— Pick from catalog —</option>
                      {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </td>
                  <td><input className="input" value={it.hsnCode} onChange={(e) => updItem(i, 'hsnCode', e.target.value)} /></td>
                  <td><input type="number" step="0.01" className="input" value={it.qty} onChange={(e) => updItem(i, 'qty', e.target.value)} /></td>
                  <td><input className="input" value={it.unit} onChange={(e) => updItem(i, 'unit', e.target.value)} /></td>
                  <td><input type="number" step="0.01" className="input" value={it.rate} onChange={(e) => updItem(i, 'rate', e.target.value)} /></td>
                  <td className="text-right font-semibold">{inr((Number(it.qty) || 0) * (Number(it.rate) || 0))}</td>
                  <td>
                    {form.items.length > 1 && (
                      <button type="button" className="text-red-600 hover:underline text-xs" onClick={() => setForm((f) => ({ ...f, items: f.items.filter((_, j) => j !== i) }))}>×</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700">Tax & Charges</h3>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="label">CGST %</label><input type="number" step="0.01" className="input" value={form.cgstPercent} onChange={(e) => upd('cgstPercent', e.target.value)} /></div>
              <div><label className="label">SGST %</label><input type="number" step="0.01" className="input" value={form.sgstPercent} onChange={(e) => upd('sgstPercent', e.target.value)} /></div>
              <div><label className="label">IGST %</label><input type="number" step="0.01" className="input" value={form.igstPercent} onChange={(e) => upd('igstPercent', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="label">Transport (₹)</label><input type="number" step="0.01" className="input" value={form.transportCharges} onChange={(e) => upd('transportCharges', e.target.value)} /></div>
              <div><label className="label">Other (₹)</label><input type="number" step="0.01" className="input" value={form.otherCharges} onChange={(e) => upd('otherCharges', e.target.value)} /></div>
            </div>
          </div>

          <div className="rounded-md bg-slate-50 p-4">
            <div className="flex justify-between py-1 text-sm"><span>Taxable Value</span><span>{inr(totals.taxable)}</span></div>
            <div className="flex justify-between py-1 text-sm"><span>CGST ({form.cgstPercent}%)</span><span>{inr(totals.cgst)}</span></div>
            <div className="flex justify-between py-1 text-sm"><span>SGST ({form.sgstPercent}%)</span><span>{inr(totals.sgst)}</span></div>
            {Number(form.igstPercent) > 0 && <div className="flex justify-between py-1 text-sm"><span>IGST ({form.igstPercent}%)</span><span>{inr(totals.igst)}</span></div>}
            <div className="flex justify-between py-1 text-sm"><span>Transport</span><span>{inr(totals.transport)}</span></div>
            <div className="flex justify-between py-1 text-sm"><span>Other</span><span>{inr(totals.other)}</span></div>
            <div className="flex justify-between py-1 text-xs text-slate-500"><span>Round Off</span><span>{inr(totals.roundOff)}</span></div>
            <div className="mt-2 flex justify-between border-t pt-2 text-base font-bold"><span>Grand Total</span><span>{inr(totals.grand)}</span></div>
          </div>
        </div>
      </div>

      <div className="mt-4 card p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Bank Details</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div><label className="label">Account Name</label><input className="input" value={form.bankAccountName} onChange={(e) => upd('bankAccountName', e.target.value)} /></div>
          <div><label className="label">Firm Name</label><input className="input" value={form.bankFirmName} onChange={(e) => upd('bankFirmName', e.target.value)} /></div>
          <div><label className="label">Account No</label><input className="input" value={form.bankAccountNo} onChange={(e) => upd('bankAccountNo', e.target.value)} /></div>
          <div><label className="label">IFSC</label><input className="input" value={form.bankIfsc} onChange={(e) => upd('bankIfsc', e.target.value)} /></div>
          <div><label className="label">Bank Name</label><input className="input" value={form.bankName} onChange={(e) => upd('bankName', e.target.value)} /></div>
        </div>
        <div className="mt-3">
          <label className="label">Notes</label>
          <textarea className="textarea" value={form.notes} onChange={(e) => upd('notes', e.target.value)} />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Invoice'}</button>
      </div>
    </form>
  );
}
