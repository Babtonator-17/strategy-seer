
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart4, 
  Home, 
  LineChart, 
  Settings, 
  TrendingUp, 
  Wallet, 
  X, 
  BrainCircuit, 
  Bookmark, 
  Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Markets', href: '/markets', icon: LineChart },
  { name: 'Strategies', href: '/strategies', icon: TrendingUp },
  { name: 'AI Assistant', href: '/assistant', icon: BrainCircuit },
  { name: 'Portfolio', href: '/portfolio', icon: Wallet },
  { name: 'Analysis', href: '/analysis', icon: BarChart4 },
  { name: 'Watchlist', href: '/watchlist', icon: Bookmark },
  { name: 'Performance', href: '/performance', icon: Gauge },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const location = useLocation();
  
  return (
    <div
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-semibold">StrategySeer</h1>
          <Button variant="ghost" size="icon" onClick={closeSidebar} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="mt-4 space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/' && location.pathname.startsWith(item.href));
              
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
                onClick={() => closeSidebar()}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto p-4">
          <Link to="/settings">
            <Button className="w-full" onClick={() => closeSidebar()}>
              Connect Broker
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
