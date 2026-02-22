import { Link, useLocation } from '@tanstack/react-router';
import { LayoutDashboard, Database, CreditCard, Key, Settings, HelpCircle, Shield } from 'lucide-react';
import { useIsCallerAdmin } from '../hooks/useQueries';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/data-manager', icon: Database, label: 'Data Manager' },
  { to: '/billing', icon: CreditCard, label: 'Billing' },
  { to: '/key-vault', icon: Key, label: 'Key Vault' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/support', icon: HelpCircle, label: 'Support' },
];

export default function DashboardSidebar() {
  const location = useLocation();
  const { data: isAdmin } = useIsCallerAdmin();

  return (
    <aside className="w-64 border-r border-border bg-card hidden md:block">
      <div className="p-4 border-b border-border">
        <img src="/assets/1-modified.png" alt="IronGuard ICP" className="h-12 w-auto mx-auto" />
      </div>
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        {isAdmin && (
          <Link
            to="/admin"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === '/admin'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Shield className="h-5 w-5" />
            <span className="font-medium">Admin</span>
          </Link>
        )}
      </nav>
    </aside>
  );
}
