
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ProductImporter from '@/components/admin/ProductImporter';
import ImportHistory from '@/components/admin/ImportHistory';

const AdminImports = () => {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-muted/10">
        <AdminSidebar />
        
        <SidebarInset>
          <div className="container px-4 py-8 md:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-serif mb-1">Produktimport</h1>
              <p className="text-muted-foreground">Importera och hantera produktdata</p>
            </div>

            <div className="grid gap-8">
              <ProductImporter />
              <ImportHistory />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminImports;
