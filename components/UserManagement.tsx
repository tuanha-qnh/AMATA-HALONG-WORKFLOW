import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { addUser, deleteUser } from '../services/storageService';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, Trash2, User as UserIcon } from 'lucide-react';

interface UserManagementProps {
    users: User[];
    currentUser: User;
    onUpdate: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, currentUser, onUpdate }) => {
    const { t } = useLanguage();
    const [isAdding, setIsAdding] = useState(false);
    
    // New User Form State
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState<UserRole>(UserRole.STAFF);

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        if (users.some(u => u.username === newUsername)) {
            alert('Username already exists!');
            return;
        }

        const newUser: User = {
            id: Date.now().toString(),
            name: newName,
            email: newEmail,
            username: newUsername,
            password: newPassword, 
            role: newRole,
            isFirstLogin: true
        };

        addUser(newUser);
        onUpdate();
        setIsAdding(false);
        // Reset form
        setNewName('');
        setNewEmail('');
        setNewUsername('');
        setNewPassword('');
        alert(`User ${newUsername} created successfully.`);
    };

    const handleDelete = (id: string) => {
        if(confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            deleteUser(id);
            onUpdate();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">{t('userMgmtTitle')}</h2>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
                >
                    <Plus size={18} /> {t('addUser')}
                </button>
            </div>

            {/* Add User Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">{t('addUser')}</h3>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">{t('name')}</label>
                                <input required className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newName} onChange={e => setNewName(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">{t('username')}</label>
                                <input required className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">{t('password')}</label>
                                <input 
                                    type="password" 
                                    required 
                                    className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                                    value={newPassword} 
                                    onChange={e => setNewPassword(e.target.value)} 
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">{t('email')}</label>
                                <input type="email" required className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">{t('role')}</label>
                                <select className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={newRole} onChange={e => setNewRole(e.target.value as UserRole)}>
                                    <option value={UserRole.STAFF}>Staff</option>
                                    <option value={UserRole.ADMIN}>Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">{t('cancel')}</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">{t('createUser')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-3">{t('name')}</th>
                            <th className="px-6 py-3">{t('username')}</th>
                            <th className="px-6 py-3">{t('email')}</th>
                            <th className="px-6 py-3">{t('role')}</th>
                            <th className="px-6 py-3 text-right">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                        {u.name.charAt(0)}
                                    </div>
                                    <span className="font-medium text-gray-800">{u.name}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{u.username}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {/* Allow deleting anyone EXCEPT self */}
                                    {u.id !== currentUser.id && (
                                        <button 
                                            onClick={() => handleDelete(u.id)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-4 text-gray-500">No users found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};