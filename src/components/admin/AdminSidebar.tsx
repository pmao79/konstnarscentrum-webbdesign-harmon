
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  Users, 
  FileSpreadsheet,
  BarChart,
  Menu 
} from "lucide-react";
import { Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

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
    <Sidebar>
      <SidebarHeader className="p-0">
        <div className="h-16 border-b bg-background px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SidebarTrigger>
            <span className="text-lg font-medium">SKC Admin</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
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
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
