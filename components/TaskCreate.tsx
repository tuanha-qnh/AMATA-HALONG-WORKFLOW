import React, { useState, useEffect } from 'react';
import { Priority, Task, TaskStatus, User, UserRole, Project } from '../types';
import { addTask, addProject, getProjects } from '../services/storageService';
import { suggestTaskDetails } from '../services/geminiService';
import { Wand2, X, Briefcase, FilePlus2, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TaskCreateProps {
  users: User[];
  currentUser: User;
  onClose: () => void;
  onSuccess: () => void;
}

type CreateMode = 'adhoc' | 'project';

export const TaskCreate: React.FC<TaskCreateProps> = ({ users, currentUser, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [mode, setMode] = useState<CreateMode>('project');
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Project State
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isNewProject, setIsNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // Task Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    deadline: '',
    assignedToId: '',
    collaboratorIds: [] as string[],
    priority: Priority.MEDIUM,
    notes: ''
  });

  const staffUsers = users.filter(u => u.role === UserRole.STAFF);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deadline) return alert('Deadline is required');
    if (!formData.assignedToId) return alert('Assignee is required');
    
    // Project Validation
    let finalProjectId = selectedProjectId;
    if (mode === 'project') {
        if (isNewProject) {
            if (!newProjectName) return alert('Project Name is required');
            const newProject: Project = {
                id: Date.now().toString(),
                name: newProjectName,
                description: newProjectDesc,
                createdAt: new Date().toISOString()
            };
            addProject(newProject);
            finalProjectId = newProject.id;
        } else {
            if (!selectedProjectId) return alert('Please select a project');
        }
    } else {
        finalProjectId = undefined; // Ad-hoc has no project
    }

    setLoading(true);

    const newTask: Task = {
      id: Date.now().toString(),
      ...formData,
      projectId: finalProjectId,
      status: TaskStatus.TODO,
      collaboratorIds: formData.collaboratorIds,
      createdAt: new Date().toISOString(),
      progress: 0,
      startDate: new Date(formData.startDate).toISOString(),
      deadline: new Date(formData.deadline).toISOString(),
    };

    addTask(newTask);

    // Simulate Email Sending
    const assignee = users.find(u => u.id === formData.assignedToId);
    setTimeout(() => {
        alert(`Simulated Email Sent to ${assignee?.email}\nType: ${mode === 'project' ? 'Project Task' : 'Ad-hoc Task'}\nSubject: ${newTask.title}`);
        setLoading(false);
        onSuccess();
    }, 500);
  };

  const handleAiSuggest = async () => {
    if (!formData.title) return alert("Please enter a title first");
    setAiLoading(true);
    const context = mode === 'project' 
        ? `Task for Project "${isNewProject ? newProjectName : projects.find(p=>p.id===selectedProjectId)?.name || 'Unknown'}"` 
        : "Ad-hoc single task";
    const suggestion = await suggestTaskDetails(`${formData.title} (${context})`);
    setFormData(prev => ({ ...prev, description: suggestion }));
    setAiLoading(false);
  };

  const toggleCollaborator = (userId: string) => {
    setFormData(prev => {
      const exists = prev.collaboratorIds.includes(userId);
      if (exists) return { ...prev, collaboratorIds: prev.collaboratorIds.filter(id => id !== userId) };
      return { ...prev, collaboratorIds: [...prev.collaboratorIds, userId] };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        <div className="bg-slate-800 p-4 flex justify-between items-center text-white flex-shrink-0">
          <h2 className="text-lg font-bold">{t('assignNewTask')}</h2>
          <button onClick={onClose}><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
            {/* Mode Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <button 
                    type="button"
                    onClick={() => setMode('project')}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                        mode === 'project' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-200 text-gray-500'
                    }`}
                >
                    <Briefcase size={24} className="mb-2"/>
                    <span className="font-bold">{t('project')}</span>
                </button>
                <button 
                    type="button"
                    onClick={() => setMode('adhoc')}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                        mode === 'adhoc' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-200 text-gray-500'
                    }`}
                >
                    <FilePlus2 size={24} className="mb-2"/>
                    <span className="font-bold">{t('adhoc')}</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Project Selection Section */}
                {mode === 'project' && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                        {!isNewProject ? (
                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('selectProject')}</label>
                                    <select 
                                        className="w-full border rounded-md p-2 text-sm"
                                        value={selectedProjectId}
                                        onChange={e => setSelectedProjectId(e.target.value)}
                                        required={!isNewProject}
                                    >
                                        <option value="">-- Choose Existing Project --</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => setIsNewProject(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md flex items-center gap-2 text-sm"
                                >
                                    <Plus size={16}/> {t('createProject')}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3 animate-fade-in">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-green-700">{t('createProject')}</h3>
                                    <button type="button" onClick={() => setIsNewProject(false)} className="text-xs text-red-500 hover:underline">Cancel</button>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">{t('projectName')} *</label>
                                    <input 
                                        className="w-full border rounded-md p-2 text-sm"
                                        value={newProjectName}
                                        onChange={e => setNewProjectName(e.target.value)}
                                        placeholder="e.g. Website Overhaul 2024"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">{t('projectDesc')}</label>
                                    <input 
                                        className="w-full border rounded-md p-2 text-sm"
                                        value={newProjectDesc}
                                        onChange={e => setNewProjectDesc(e.target.value)}
                                        placeholder="Brief goal of the project..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Task Details */}
                <div className="space-y-4 pt-2">
                    <h3 className="text-md font-bold text-gray-800 border-b pb-1">Task Information</h3>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                        <div className="flex gap-2">
                        <input 
                            required
                            className="flex-1 border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="e.g. Design Homepage Mockup"
                        />
                        <button 
                            type="button" 
                            onClick={handleAiSuggest}
                            disabled={aiLoading}
                            className="bg-purple-100 text-purple-700 px-3 py-2 rounded-md hover:bg-purple-200 transition-colors"
                            title="Generate Description with AI"
                        >
                            <Wand2 size={18} className={aiLoading ? "animate-spin" : ""} />
                        </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea 
                        required
                        className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="Detailed instructions..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input 
                            type="date"
                            required
                            className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.startDate}
                            onChange={e => setFormData({...formData, startDate: e.target.value})}
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
                        <input 
                            type="date"
                            required
                            min={formData.startDate}
                            className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.deadline}
                            onChange={e => setFormData({...formData, deadline: e.target.value})}
                        />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assignee *</label>
                        <select
                            required
                            className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.assignedToId}
                            onChange={e => setFormData({...formData, assignedToId: e.target.value})}
                        >
                            <option value="">Select Employee</option>
                            {staffUsers.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.priority}
                            onChange={e => setFormData({...formData, priority: e.target.value as Priority})}
                        >
                            {Object.values(Priority).map(p => (
                            <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Collaborators</label>
                        <div className="flex flex-wrap gap-2">
                        {staffUsers.filter(u => u.id !== formData.assignedToId).map(u => (
                            <button
                            key={u.id}
                            type="button"
                            onClick={() => toggleCollaborator(u.id)}
                            className={`text-xs px-2 py-1 rounded-full border transition-all ${
                                formData.collaboratorIds.includes(u.id) 
                                ? 'bg-blue-100 text-blue-700 border-blue-200' 
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                            >
                            {u.name}
                            </button>
                        ))}
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t mt-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg border text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
                    >
                        {loading ? 'Processing...' : t('assignNewTask')}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};