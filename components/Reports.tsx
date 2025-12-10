import React, { useMemo } from 'react';
import { Task, User, TaskStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download } from 'lucide-react';

interface ReportsProps {
    tasks: Task[];
    users: User[];
}

export const Reports: React.FC<ReportsProps> = ({ tasks, users }) => {
    const { t } = useLanguage();

    // Calculate Per-User Stats
    const userStats = useMemo(() => {
        return users.map(user => {
            const userTasks = tasks.filter(t => t.assignedToId === user.id);
            const total = userTasks.length;
            const completed = userTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
            const overdue = userTasks.filter(t => t.status !== TaskStatus.COMPLETED && new Date(t.deadline) < new Date()).length;
            const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
            
            return {
                id: user.id,
                name: user.name,
                total,
                completed,
                overdue,
                completionRate
            };
        }).filter(stat => stat.total > 0); // Only show active users
    }, [tasks, users]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">{t('reports')}</h2>
                <button className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition-colors" onClick={() => alert('Exporting to Excel...')}>
                    <Download size={18} /> Export Excel
                </button>
            </div>

            {/* Charts Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-bold text-gray-700 mb-4">{t('employeeStats')}</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={userStats}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total" fill="#94a3b8" name={t('totalTasks')} />
                            <Bar dataKey="completed" fill="#22c55e" name={t('completed')} />
                            <Bar dataKey="overdue" fill="#ef4444" name={t('overdue')} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userStats.map(stat => (
                    <div key={stat.id} className="bg-white rounded-lg shadow border border-gray-100 p-5">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-gray-800 text-lg">{stat.name}</h4>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                stat.completionRate > 80 ? 'bg-green-100 text-green-700' : 
                                stat.completionRate > 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {stat.completionRate}% Efficiency
                            </span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>{t('totalTasks')}:</span>
                                <span className="font-medium text-gray-900">{stat.total}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>{t('completed')}:</span>
                                <span className="font-medium text-green-600">{stat.completed}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>{t('overdue')}:</span>
                                <span className="font-medium text-red-600">{stat.overdue}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-bold text-gray-700">{t('taskAnalysis')}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-gray-500 uppercase border-b">
                            <tr>
                                <th className="px-6 py-3">Task</th>
                                <th className="px-6 py-3">Assignee</th>
                                <th className="px-6 py-3">Deadline</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Progress</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tasks.map(task => {
                                const assignee = users.find(u => u.id === task.assignedToId);
                                const isOverdue = new Date(task.deadline) < new Date() && task.status !== TaskStatus.COMPLETED;
                                
                                return (
                                    <tr key={task.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-800">{task.title}</td>
                                        <td className="px-6 py-4">{assignee?.name}</td>
                                        <td className={`px-6 py-4 ${isOverdue ? 'text-red-600 font-bold' : ''}`}>
                                            {new Date(task.deadline).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold
                                                ${task.status === TaskStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                                                isOverdue ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {task.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
                                                <div className={`h-2.5 rounded-full ${task.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${task.progress}%` }}></div>
                                            </div>
                                            <span className="text-xs text-gray-500 mt-1 block">{task.progress}%</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};