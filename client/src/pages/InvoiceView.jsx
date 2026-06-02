import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Invoices } from '../api';

const inr = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

const dt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '');

export default function InvoiceView({ print = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inv, setInv] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    Invoices.get(id).then(setInv).catch((e) => setErr(e.message));
  }, [id]);

  useEffect(() => {
    if (print && inv) setTimeout(() => window.print(), 200);
  }, [print, inv]);

  if (err) return <div className="p-8 text-red-600">{err}</div>;
  if (!inv) return <div className="p-8 text-slate-500">Loading…</div>;

  return (
    <div className={print ? 'bg-white' : 'p-6'}>
      {!print && (
        <div className="no-print mb-4 flex items-center justify-between">
          <button onClick={() => navigate('/invoices')} className="btn-secondary">← Back</button>
          <div className="flex gap-2">
            <Link to={`/invoices/${id}/edit`} className="btn-secondary">Edit</Link>
            <button onClick={() => window.print()} className="btn-primary">🖨️ Print / PDF</button>
          </div>
        </div>
      )}

      <div className={`print-page mx-auto shadow ${print ? '' : 'max-w-[210mm]'}`}>
        <InvoicePaper inv={inv} />
      </div>
    </div>
  );
}

function InvoicePaper({ inv }) {
  return (
    <div className="invoice-paper">
      {/* Header */}
      <div className="text-center">
        <div className="text-[26px] font-bold tracking-wider text-brand-dark">TAX INVOICE</div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-4 border-b-2 border-brand-dark pb-3">
        <div>
          <div className="text-xl font-bold text-brand-dark">{inv.seller?.name || 'ADIJA TRADEX'}</div>
          {inv.seller?.gstin && <div className="text-[11px] font-semibold">GSTIN: {inv.seller.gstin}</div>}
          {inv.seller?.address && <div className="mt-1 whitespace-pre-line text-[11px] leading-snug">{inv.seller.address}</div>}
          {inv.seller?.email && <div className="text-[11px]">✉ {inv.seller.email}</div>}
          {inv.seller?.phone && <div className="text-[11px]">📞 {inv.seller.phone}</div>}
        </div>
        <div className="text-[11px]">
          <Field label="Invoice No" value={inv.invoiceNo} />
          <Field label="Invoice Date" value={dt(inv.invoiceDate)} />
          <Field label="Place of Supply" value={inv.placeOfSupply} />
          <Field label="Payment Terms" value={inv.paymentTerms} />
        </div>
      </div>

      {/* Bill / Ship */}
      <div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">
        <div className="border border-slate-400 p-2">
          <div className="mb-1 bg-brand-dark px-2 py-0.5 text-white">BILL TO</div>
          <div className="font-bold">{inv.billTo?.name}</div>
          {inv.billTo?.gstin && <div>GSTIN: {inv.billTo.gstin}</div>}
          {inv.billTo?.address && <div className="whitespace-pre-line">{inv.billTo.address}</div>}
          {inv.billTo?.email && <div>✉ {inv.billTo.email}</div>}
          {inv.billTo?.phone && <div>📞 {inv.billTo.phone}</div>}
        </div>
        <div className="border border-slate-400 p-2">
          <div className="mb-1 bg-brand-dark px-2 py-0.5 text-white">SHIP TO</div>
          <div className="font-bold">{inv.shipTo?.name || inv.billTo?.name}</div>
          {(inv.shipTo?.gstin || inv.billTo?.gstin) && <div>GSTIN: {inv.shipTo?.gstin || inv.billTo?.gstin}</div>}
          {(inv.shipTo?.address || inv.billTo?.address) && <div className="whitespace-pre-line">{inv.shipTo?.address || inv.billTo?.address}</div>}
        </div>
      </div>

      {/* Vehicle */}
      {(inv.vehicleNumber || inv.driverName || inv.driverContact) && (
        <div className="mt-3 border border-slate-400 text-[11px]">
          <div className="bg-brand-dark px-2 py-0.5 text-white">VEHICLE DETAILS</div>
          <div className="grid grid-cols-3 gap-2 p-2">
            <div><strong>Vehicle No:</strong> {inv.vehicleNumber || '—'}</div>
            <div><strong>Driver:</strong> {inv.driverName || '—'}</div>
            <div><strong>Contact:</strong> {inv.driverContact || '—'}</div>
          </div>
        </div>
      )}

      {/* Items */}
      <table className="invoice-table mt-3 w-full border-collapse">
        <thead>
          <tr>
            <th className="w-8">#</th>
            <th className="text-left">Product Description</th>
            <th>HSN Code</th>
            <th>Qty</th>
            <th>Unit</th>
            <th className="text-right">Rate (₹)</th>
            <th className="text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {inv.items.map((it, i) => (
            <tr key={i}>
              <td className="text-center">{i + 1}</td>
              <td>{it.name}</td>
              <td className="text-center">{it.hsnCode}</td>
              <td className="text-right">{it.qty}</td>
              <td className="text-center">{it.unit}</td>
              <td className="text-right">{Number(it.rate).toFixed(2)}</td>
              <td className="text-right">{Number(it.amount).toFixed(2)}</td>
            </tr>
          ))}
          {Array.from({ length: Math.max(0, 4 - inv.items.length) }).map((_, i) => (
            <tr key={`pad-${i}`}>
              <td className="text-center">&nbsp;</td>
              <td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">
        <div className="border border-slate-400 p-2">
          <div className="mb-1 bg-brand-dark px-2 py-0.5 text-white">BANK DETAILS</div>
          <div><strong>Account Name:</strong> {inv.bankAccountName || '—'}</div>
          <div><strong>Firm Name:</strong> {inv.bankFirmName || '—'}</div>
          <div><strong>Account No:</strong> {inv.bankAccountNo || '—'}</div>
          {inv.bankIfsc && <div><strong>IFSC:</strong> {inv.bankIfsc}</div>}
          {inv.bankName && <div><strong>Bank:</strong> {inv.bankName}</div>}
        </div>
        <div>
          <table className="w-full border-collapse text-[11px]">
            <tbody>
              <tr><td className="border border-slate-400 px-2 py-1">Total Taxable Value</td><td className="border border-slate-400 px-2 py-1 text-right">{inr(inv.totalTaxable)}</td></tr>
              <tr><td className="border border-slate-400 px-2 py-1">CGST ({inv.cgstPercent}%)</td><td className="border border-slate-400 px-2 py-1 text-right">{inr(inv.cgstAmount)}</td></tr>
              <tr><td className="border border-slate-400 px-2 py-1">SGST ({inv.sgstPercent}%)</td><td className="border border-slate-400 px-2 py-1 text-right">{inr(inv.sgstAmount)}</td></tr>
              {inv.igstAmount > 0 && (
                <tr><td className="border border-slate-400 px-2 py-1">IGST ({inv.igstPercent}%)</td><td className="border border-slate-400 px-2 py-1 text-right">{inr(inv.igstAmount)}</td></tr>
              )}
              {inv.transportCharges > 0 && (
                <tr><td className="border border-slate-400 px-2 py-1">Transportation Charges</td><td className="border border-slate-400 px-2 py-1 text-right">{inr(inv.transportCharges)}</td></tr>
              )}
              {inv.otherCharges > 0 && (
                <tr><td className="border border-slate-400 px-2 py-1">Other Charges</td><td className="border border-slate-400 px-2 py-1 text-right">{inr(inv.otherCharges)}</td></tr>
              )}
              {inv.roundOff !== 0 && (
                <tr><td className="border border-slate-400 px-2 py-1">Round Off</td><td className="border border-slate-400 px-2 py-1 text-right">{inr(inv.roundOff)}</td></tr>
              )}
              <tr className="bg-brand-dark text-white">
                <td className="border border-slate-400 px-2 py-1 font-bold">GRAND TOTAL</td>
                <td className="border border-slate-400 px-2 py-1 text-right font-bold">{inr(inv.grandTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-2 text-[11px]">
        <strong>Amount in Words:</strong> {inv.amountInWords}
      </div>

      <div className="mt-3 border border-slate-400 p-2 text-[10px]">
        <div className="font-semibold">TERMS &amp; CONDITIONS</div>
        <ul className="list-disc pl-5">
          <li>Goods once sold will not be taken back.</li>
          <li>Quality complaints must be reported within 48 hours.</li>
          <li>Interest @18% p.a. will be charged on overdue payments.</li>
          <li>Subject to Pune, Maharashtra Jurisdiction.</li>
        </ul>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-[11px]">
        <div>
          <div>For <strong>{inv.seller?.name || 'ADIJA TRADEX'}</strong></div>
          <div className="mt-10 border-t border-slate-500 pt-1 text-center">Authorized Signatory</div>
        </div>
        <div>
          <div>For <strong>{inv.billTo?.name}</strong></div>
          <div className="mt-10 border-t border-slate-500 pt-1 text-center">Authorized Signatory</div>
        </div>
      </div>

      <div className="mt-3 text-center text-[10px] italic text-slate-500">— Thank you for your business —</div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex justify-between border-b border-slate-200 py-0.5">
      <span className="font-semibold">{label}</span>
      <span>{value || '—'}</span>
    </div>
  );
}
