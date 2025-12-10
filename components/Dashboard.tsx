import React, { useMemo } from 'react';
import { Task, TaskStatus, UserRole, User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { AlertCircle, CheckCircle2, Clock, Hourglass, User as UserIcon, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  user: User;
  allUsers: User[]; // Pass all users to calculate stats for everyone if Admin
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks, user, allUsers }) => {
  const { t } = useLanguage();

  // Helper to calculate stats for a specific user ID
  const getUserStats = (userId: string) => {
    const userTasks = tasks.filter(t => t.assignedToId === userId);
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    return {
      total: userTasks.length,
      completed: userTasks.filter(t => t.status === TaskStatus.COMPLETED).length,
      inProgress: userTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      overdue: userTasks.filter(t => t.status !== TaskStatus.COMPLETED && new Date(t.deadline) < now).length,
      dueSoon: userTasks.filter(t => {
        const d = new Date(t.deadline);
        return t.status !== TaskStatus.COMPLETED && d >= now && d <= threeDaysFromNow;
      }).length
    };
  };

  // Logic: 
  // If Admin: Show cards for ALL staff members.
  // If Staff: Show only their own card (or maybe teammates if needed, but let's stick to their own + overview).
  const displayedUsers = useMemo(() => {
    if (user.role === UserRole.ADMIN) {
      return allUsers.filter(u => u.role === UserRole.STAFF);
    }
    return [user];
  }, [user, allUsers]);

  const StatBox = ({ label, value, colorClass, icon: Icon }: any) => (
    <div className={`flex flex-col items-center justify-center p-3 rounded-lg border ${colorClass} bg-white flex-1 min-w-[80px]`}>
      <div className="flex items-center gap-1 mb-1">
        <Icon size={16} />
        <span className="text-xs font-semibold uppercase opacity-80">{label}</span>
      </div>
      <span className="text-xl font-bold">{value}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('dashboard')}</h2>
          <p className="text-sm text-gray-500">{t('personnelOverview')}</p>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayedUsers.map(staff => {
          const stats = getUserStats(staff.id);
          const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

          return (
            <div key={staff.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{staff.name}</h3>
                    <p className="text-xs text-gray-500">{staff.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 uppercase tracking-wide">{t('completionRate')}</div>
                  <div className={`text-lg font-bold ${
                      completionRate >= 80 ? 'text-green-600' : 
                      completionRate >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {completionRate}%
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="p-4">
                <div className="flex flex-wrap gap-3">
                  <div className="w-full flex gap-3 mb-1">
                     <StatBox 
                        label={t('totalTasks')} 
                        value={stats.total} 
                        colorClass="border-gray-100 text-gray-700" 
                        icon={UserIcon} 
                     />
                     <StatBox 
                        label={t('completed')} 
                        value={stats.completed} 
                        colorClass="border-green-100 text-green-700 bg-green-50" 
                        icon={CheckCircle2} 
                     />
                  </div>
                  <div className="w-full flex gap-3">
                     <StatBox 
                        label={t('inProgress')} 
                        value={stats.inProgress} 
                        colorClass="border-blue-100 text-blue-700 bg-blue-50" 
                        icon={Hourglass} 
                     />
                     <StatBox 
                        label={t('dueSoon')} 
                        value={stats.dueSoon} 
                        colorClass="border-yellow-100 text-yellow-700 bg-yellow-50" 
                        icon={Clock} 
                     />
                     <StatBox 
                        label={t('overdue')} 
                        value={stats.overdue} 
                        colorClass="border-red-100 text-red-700 bg-red-50" 
                        icon={AlertCircle} 
                     />
                  </div>
                </div>

                {/* Quick Action or Status Message */}
                <div className="mt-4 pt-3 border-t text-sm">
                   {stats.overdue > 0 ? (
                       <div className="flex items-center gap-2 text-red-600 font-medium">
                           <AlertTriangle size={16} />
                           <span>Attention Needed: {stats.overdue} overdue tasks</span>
                       </div>
                   ) : (
                       <div className="flex items-center gap-2 text-green-600 font-medium">
                           <CheckCircle2 size={16} />
                           <span>On Track</span>
                       </div>
                   )}
                </div>
              </div>
            </div>
          );
        })}

        {displayedUsers.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
             No staff members found to display.
          </div>
        )}
      </div>
    </div>
  );
};