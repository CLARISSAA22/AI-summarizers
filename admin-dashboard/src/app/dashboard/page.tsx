import { getSession } from '@/lib/auth';
import UserList from '@/components/UserList';
import YouTubeSummarizer from '@/components/YouTubeSummarizer';
import StatsOverview from '@/components/StatsOverview';

export default async function DashboardPage() {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
        return <div>Access Denied</div>;
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome, {user.email}</h2>
                    <p className="text-gray-500 mt-1">Here is what's happening today.</p>
                </div>
            </div>

            <StatsOverview />

            {/* YouTube AI Tool Section */}
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
