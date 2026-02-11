
import { getSession } from '@/lib/auth';
import UserList from '@/components/UserList';
import YouTubeSummarizer from '@/components/YouTubeSummarizer';

export default async function DashboardPage() {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
        return <div>Access Denied</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Welcome, {user.email}</h2>

            {/* YouTube AI Tool Section - Available for everyone */}
            <div className="my-8">
                <YouTubeSummarizer />
            </div>

            {user.role === 'admin' ? (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                    <UserList />
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg p-6">
                    <p className="text-gray-600">You have access to the dashboard.</p>
                </div>
            )}
        </div>
    );
}
