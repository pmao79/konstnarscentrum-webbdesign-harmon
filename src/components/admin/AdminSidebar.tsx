import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Tag as TagIcon, 
  ShoppingBag, 
  Users, 
  Settings 
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from '@/hooks/useAuth';

const AdminSidebar = () => {
  const { user } = useAuth();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader>
          <Link to="/admin" className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src={user?.image} alt={user?.name} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-bold">{user?.name}</span>
          </Link>
        </SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/admin">
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/admin/produkter">
                <ShoppingBag className="h-4 w-4" />
                <span>Produkter</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/admin/produktklassificering">
                <TagIcon className="h-4 w-4" />
                <span>Produktklassificering</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/admin/anvandare">
                <Users className="h-4 w-4" />
                <span>Användare</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/admin/installningar">
                <Settings className="h-4 w-4" />
                <span>Inställningar</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
