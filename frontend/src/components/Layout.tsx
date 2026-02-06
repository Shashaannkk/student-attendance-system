import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { ThemeProvider } from '../context/ThemeContext';

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <ThemeProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-200">
                <Sidebar />
                {/* Responsive margin: no margin on mobile, ml-64 on desktop */}
                <main className="ml-0 md:ml-64 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </ThemeProvider>
    );
};

export default Layout;
