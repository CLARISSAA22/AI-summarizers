
'use client';

import { useEffect, useState } from 'react';
import { Users, FileText, Clock, ShieldAlert } from 'lucide-react';

interface Stats {
    totalUsers?: number;
    totalNotes?: number;
    pendingApprovals?: number;
    yourNotes?: number;
}

export default function StatsOverview() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                if (res.ok) {
                    setStats(await res.json());
                }
            } catch (err) {
                console.error('Failed to fetch stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-white rounded-3xl border border-gray-100 shadow-sm"></div>
            ))}
        </div>
    );

    if (!stats) return null;

    const cards = [];
    if (stats.totalUsers !== undefined) {
        cards.push({
            label: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        });
    }
    if (stats.totalNotes !== undefined) {
        cards.push({
            label: 'Total Notes',
            value: stats.totalNotes,
            icon: FileText,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        });
    }
    if (stats.pendingApprovals !== undefined) {
        cards.push({
            label: 'Pending Approvals',
            value: stats.pendingApprovals,
            icon: ShieldAlert,
            color: stats.pendingApprovals > 0 ? 'text-orange-600' : 'text-gray-400',
            bg: stats.pendingApprovals > 0 ? 'bg-orange-50' : 'bg-gray-50'
        });
    }
    if (stats.yourNotes !== undefined) {
        cards.push({
            label: 'Your Notes Generated',
            value: stats.yourNotes,
            icon: Clock,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50'
        });
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, i) => {
                const Icon = card.icon;
                return (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                        </div>
                        <div className={`p-4 rounded-2xl ${card.bg}`}>
                            <Icon className={`w-6 h-6 ${card.color}`} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
