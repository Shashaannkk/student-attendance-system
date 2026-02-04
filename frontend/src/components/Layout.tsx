import { ReactNode } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Sidebar />
            <main className="ml-64 p-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
