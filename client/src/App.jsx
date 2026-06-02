import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InvoiceList from './pages/InvoiceList';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceView from './pages/InvoiceView';
import Customers from './pages/Customers';
import Products from './pages/Products';
import CompanySettings from './pages/CompanySettings';

export default function App() {
  return (
    <Routes>
      <Route path="/print/:id" element={<InvoiceView print />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/invoices" element={<InvoiceList />} />
        <Route path="/invoices/new" element={<InvoiceForm />} />
        <Route path="/invoices/:id/edit" element={<InvoiceForm />} />
        <Route path="/invoices/:id" element={<InvoiceView />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/products" element={<Products />} />
        <Route path="/settings" element={<CompanySettings />} />
        <Route path="*" element={<div className="p-8">Not found</div>} />
      </Route>
    </Routes>
  );
}
