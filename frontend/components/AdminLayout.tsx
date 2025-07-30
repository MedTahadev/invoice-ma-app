
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout: React.FC = () => {
    return (
        <div className="flex">
            <AdminSidebar />
            <div className="flex-grow p-6">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
