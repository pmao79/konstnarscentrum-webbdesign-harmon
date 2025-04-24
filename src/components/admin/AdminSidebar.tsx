
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  Users, 
  FileSpreadsheet,
  BarChart 
} from "lucide-react";
import { Link } from 'react-router-dom';

const AdminSidebar = () => {
  const menuItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Översikt', path: '/admin' },
    { icon: <Package size={18} />, label: 'Produkter', path: '/admin/products' },
    { icon: <FileSpreadsheet size={18} />, label: 'Importer', path: '/admin/imports' },
    { icon: <ShoppingCart size={18} />, label: 'Ordrar', path: '/admin/orders' },
    { icon: <Users size={18} />, label: 'Kunder', path: '/admin/customers' },
    { icon: <BarChart size={18} />, label: 'Rapporter', path: '/admin/reports' },
    { icon: <Settings size={18} />, label: 'Inställningar', path: '/admin/settings' },
  ];

  return (
    <aside className="w-60 bg-background border-r h-full">
      <div className="p-4 border-b">
        <h2 className="font-medium text-xl">Admin</h2>
      </div>
      <nav className="p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
