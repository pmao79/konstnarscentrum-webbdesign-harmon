
import React from 'react';
import Layout from '@/components/Layout';
import ProductImporter from '@/components/admin/ProductImporter';

const Dashboard = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif mb-8">Admin Dashboard</h1>
        <ProductImporter />
      </div>
    </Layout>
  );
};

export default Dashboard;
