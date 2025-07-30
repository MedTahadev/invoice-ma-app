
import React from 'react';
import { Outlet } from 'react-router-dom';

const BareLayout: React.FC = () => {
    return (
        <main>
            <Outlet />
        </main>
    );
};

export default BareLayout;