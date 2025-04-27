import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, Layers, Tag, ShoppingBag, Settings, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const { signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Översikt', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Produkter', icon: Package },
    { path: '/admin/products/classify', label: 'Klassificering', icon: Layers },
    { path: '/admin/categories', label: 'Kategorier', icon: Tag },
    { path: '/admin/subcategories', label: 'Underkategorier', icon: Tag },
    { path: '/admin/brands', label: 'Varumärken', icon: Tag },
    { path: '/admin/product-groups', label: 'Produktgrupper', icon: Tag },
    { path: '/admin/orders', label: 'Ordrar', icon: ShoppingBag },
    { path: '/admin/settings', label: 'Inställningar', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md fixed h-screen">
          <div className="p-4">
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          </div>
          <nav className="mt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                    isActive ? 'bg-gray-100 border-r-4 border-blue-500' : ''
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 w-full p-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signOut()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logga ut
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 ml-64 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
} 