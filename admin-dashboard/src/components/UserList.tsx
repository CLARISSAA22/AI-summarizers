'use client';

import { useEffect, useState } from 'react';
import { User as UserIcon, Shield, CheckCircle2, XCircle, MoreVertical, Search, Filter } from 'lucide-react';

interface User {
    id: string;
    email: string;
    role: string;
    is_approved: boolean;
    created_at: string;
}

export default function UserList() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUsers = async () => {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
            setUsers(await res.json());
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleApproval = async (user: User) => {
        const res = await fetch('/api/admin/users', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, is_approved: !user.is_approved }),
        });

        if (res.ok) {
            fetchUsers();
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm"></div>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400"
                    />
                </div>
                <div className="flex items-center gap-3 pr-2">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{filteredUsers.length} Users</span>
                    <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredUsers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">No users found matching your search.</p>
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user.id} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-xl hover:border-indigo-100 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                                    {user.role === 'admin' ? <Shield className="w-7 h-7" /> : <UserIcon className="w-7 h-7" />}
                                </div>
                                <div>
                                    <p className="font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors">{user.email}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {user.role}
                                        </span>
                                        <span className="text-[10px] text-gray-300 font-bold">•</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest ${user.is_approved ? 'text-green-500' : 'text-orange-500'}`}>
                                        {user.is_approved ? (
                                            <>
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Approved
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-3.5 h-3.5" />
                                                Pending
                                            </>
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {user.role !== 'admin' && (
                                        <button
                                            onClick={() => toggleApproval(user)}
                                            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap shadow-lg shadow-transparent
                                                ${user.is_approved
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:shadow-red-200'
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'}`}
                                        >
                                            {user.is_approved ? 'Revoke' : 'Approve'}
                                        </button>
                                    )}
                                    <button className="p-3 text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded-2xl transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
