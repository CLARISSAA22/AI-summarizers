
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                </div>
                <nav className="mt-6">
                    <Link href="/dashboard" className="block px-6 py-2 text-gray-700 hover:bg-gray-100 hover:text-indigo-600">
                        Home
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-6 py-2 text-red-600 hover:bg-gray-100"
                    >
                        Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
