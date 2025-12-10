import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, User, UserRole, Priority, Project } from '../types';
import { format } from 'date-fns';
import { AlertCircle, Calendar, CheckCircle2, ChevronRight, Filter, Plus, Briefcase } from 'lucide-react';
import { getProjects } from '../services/storageService';

interface TaskListProps {
  tasks: Task[];
  users: User[];
  currentUser: User;
  onTaskClick: (task: Task) => void;
  onCreateClick: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, users, currentUser, onTaskClick, onCreateClick }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  // Filtering Logic
  const filteredTasks = tasks.filter(task => {
    // Permission Filter
    if (currentUser.role !== UserRole.ADMIN) {
      const isAssigned = task.assignedToId === currentUser.id;
      const isCollaborator = task.collaboratorIds.includes(currentUser.id);
      if (!isAssigned && !isCollaborator) return false;
    }

    // Status Filter
    if (filterStatus !== 'ALL' && task.status !== filterStatus) return false;

    // Search Filter
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;

    return true;
  });

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.URGENT: return 'bg-red-100 text-red-700 border-red-200';
      case Priority.HIGH: return 'bg-orange-100 text-orange-700 border-orange-200';
      case Priority.MEDIUM: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  const isOverdue = (task: Task) => {
    return new Date(task.deadline) < new Date() && task.status !== TaskStatus.COMPLETED;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Task Management</h2>
        {currentUser.role === UserRole.ADMIN && (
          <button
            onClick={onCreateClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus size={18} />
            <span>Assign New Task</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="ALL">All Status</option>
          <option value={TaskStatus.TODO}>To Do</option>
          <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
          <option value={TaskStatus.COMPLETED}>Completed</option>
        </select>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.map(task => {
            const overdue = isOverdue(task);
            const assignee = users.find(u => u.id === task.assignedToId);
            const project = projects.find(p => p.id === task.projectId);
            
            return (
              <div 
                key={task.id}
                onClick={() => onTaskClick(task)}
                className={`bg-white rounded-xl p-5 shadow-sm border-2 cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 relative group
                  ${task.status === TaskStatus.COMPLETED ? 'border-green-200' : overdue ? 'border-red-200' : 'border-transparent'}`}
              >
                {/* Status Indicator Bar */}
                <div className={`absolute top-0 left-0 w-full h-1.5 rounded-t-xl
                  ${task.status === TaskStatus.COMPLETED ? 'bg-green-500' : overdue ? 'bg-red-500' : 'bg-blue-500'}
                `}></div>

                <div className="flex justify-between items-start mb-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(task.priority)} font-medium`}>
                    {task.priority}
                  </span>
                  {task.status === TaskStatus.COMPLETED ? (
                    <CheckCircle2 size={20} className="text-green-500" />
                  ) : overdue ? (
                    <AlertCircle size={20} className="text-red-500" />
                  ) : (
                    <div className="text-xs font-semibold text-gray-400">{task.progress}%</div>
                  )}
                </div>

                {project && (
                    <div className="mb-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <Briefcase size={10} /> {project.name}
                        </span>
                    </div>
                )}

                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{task.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{task.description}</p>

                <div className="flex flex-col gap-2 text-sm text-gray-600">
                   <div className="flex items-center gap-2">
                     <Calendar size={14} className="text-gray-400"/>
                     <span className={overdue ? "text-red-600 font-medium" : ""}>
                        Due: {format(new Date(task.deadline), 'MMM dd, yyyy')}
                     </span>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                        {assignee?.name.charAt(0) || '?'}
                     </div>
                     <span>{assignee?.name || 'Unassigned'}</span>
                   </div>
                </div>
                
                {/* Visual Feedback for Overdue */}
                {overdue && (
                   <div className="absolute top-2 right-2 flex h-3 w-3">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                   </div>
                )}
              </div>
            );
        })}
        
        {filteredTasks.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No tasks found based on your filters.
          </div>
        )}
      </div>
    </div>
  );
};