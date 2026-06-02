import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/invoices', label: 'Invoices', icon: '🧾' },
  { to: '/customers', label: 'Customers', icon: '👥' },
  { to: '/products', label: 'Products', icon: '📦' },
  { to: '/settings', label: 'Company', icon: '⚙️' },
];

export default function Layout() {
  const navigate = useNavigate();
  return (
    <div className="flex h-full min-h-screen">
      <aside className="w-60 shrink-0 bg-brand-dark text-white">
        <div className="px-5 py-5">
          <div className="text-lg font-bold tracking-wide">ADIJA TRADEX</div>
          <div className="text-xs text-emerald-100/70">Invoice Manager</div>
        </div>
        <nav className="space-y-1 px-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-emerald-50/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-6 px-5">
          <button
            onClick={() => navigate('/invoices/new')}
            className="w-full rounded-md bg-brand-gold px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400"
          >
            + New Invoice
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
