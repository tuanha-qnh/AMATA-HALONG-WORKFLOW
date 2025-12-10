import React, { useState, useEffect } from 'react';
import { Task, TaskReport, TaskStatus, User, UserRole, Priority } from '../types';
import { format } from 'date-fns';
import { getReports, addReport, updateTask } from '../services/storageService';
import { X, Send, History, AlertTriangle, Wand2 } from 'lucide-react';
import { analyzeProgress } from '../services/geminiService';

interface TaskDetailProps {
  task: Task;
  users: User[];
  currentUser: User;
  onClose: () => void;
  onUpdate: () => void;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ task, users, currentUser, onClose, onUpdate }) => {
  const [reports, setReports] = useState<TaskReport[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'reports'>('info');
  
  // Reporting State
  const [reportContent, setReportContent] = useState('');
  const [reportIssues, setReportIssues] = useState('');
  const [reportProgress, setReportProgress] = useState(task.progress);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const isAssignee = task.assignedToId === currentUser.id;
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const canEdit = isAssignee || isAdmin;

  useEffect(() => {
    // Load reports for this task
    const allReports = getReports();
    setReports(allReports.filter(r => r.taskId === task.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [task.id]);

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (!canEdit) return;
    const updatedTask = { ...task, status: newStatus };
    if (newStatus === TaskStatus.COMPLETED) updatedTask.progress = 100;
    updateTask(updatedTask);
    onUpdate();
  };

  const submitReport = () => {
    if (!reportContent) return alert("Report content is required");

    const newReport: TaskReport = {
      id: Date.now().toString(),
      taskId: task.id,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
      content: reportContent,
      issues: reportIssues,
      percentageCompleted: reportProgress
    };

    addReport(newReport);
    
    // Auto update task progress based on latest report
    const updatedTask = { ...task, progress: reportProgress };
    if (reportProgress === 100 && task.status !== TaskStatus.COMPLETED) {
        updatedTask.status = TaskStatus.COMPLETED;
    }
    updateTask(updatedTask);

    // Reset form
    setReportContent('');
    setReportIssues('');
    setReports([newReport, ...reports]);
    onUpdate();
    alert('Report submitted successfully!');
  };

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    const reportTexts = reports.map(r => `Date: ${r.createdAt}, Content: ${r.content}, Issues: ${r.issues}`);
    const analysis = await analyzeProgress(reportTexts);
    setAiAnalysis(analysis);
    setLoadingAi(false);
  }

  const assignee = users.find(u => u.id === task.assignedToId);
  const collaborators = users.filter(u => task.collaboratorIds.includes(u.id));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto animate-slide-in-right">
        <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className={`text-xs px-2 py-0.5 rounded ${task.priority === Priority.URGENT ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                 {task.priority}
               </span>
               <span className="text-xs text-gray-500">
                 Due: {format(new Date(task.deadline), 'PPP')}
               </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('info')} 
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Details
          </button>
          <button 
            onClick={() => setActiveTab('reports')} 
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'reports' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Reports & History
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'info' ? (
            <div className="space-y-6">
              {/* Task Status Control */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(TaskStatus).map(status => (
                    <button
                      key={status}
                      disabled={!canEdit}
                      onClick={() => handleStatusChange(status)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-all
                        ${task.status === status 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}
                        ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
                <div className="text-gray-700 prose prose-sm whitespace-pre-wrap">
                  {task.description}
                </div>
              </div>

              {task.notes && (
                <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                   <h3 className="text-sm font-bold text-yellow-800 mb-1 flex items-center gap-2">
                     <AlertTriangle size={14}/> Manager Notes
                   </h3>
                   <p className="text-sm text-yellow-700">{task.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Assignee</h4>
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                       {assignee?.name.charAt(0)}
                     </div>
                     <span className="text-sm text-gray-800">{assignee?.name}</span>
                   </div>
                </div>
                <div>
                   <h4 className="text-xs uppercase text-gray-500 font-semibold mb-1">Collaborators</h4>
                   {collaborators.length > 0 ? (
                     <div className="flex -space-x-2">
                       {collaborators.map(c => (
                         <div key={c.id} className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-indigo-700 font-bold text-xs" title={c.name}>
                           {c.name.charAt(0)}
                         </div>
                       ))}
                     </div>
                   ) : <span className="text-sm text-gray-400">None</span>}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Report Form */}
              {isAssignee && task.status !== TaskStatus.COMPLETED && (
                <div className="bg-white border rounded-lg p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Submit Daily Report</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Work Done Today *</label>
                      <textarea 
                        className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        rows={3}
                        value={reportContent}
                        onChange={e => setReportContent(e.target.value)}
                        placeholder="Describe what you completed..."
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Issues / Blockers (Optional)</label>
                      <textarea 
                        className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        rows={2}
                        value={reportIssues}
                        onChange={e => setReportIssues(e.target.value)}
                        placeholder="Any difficulties encountered?"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Progress ({reportProgress}%)</label>
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={reportProgress} 
                        onChange={e => setReportProgress(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <button 
                      onClick={submitReport}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md flex justify-center items-center gap-2 transition-colors"
                    >
                      <Send size={16} /> Submit Report
                    </button>
                  </div>
                </div>
              )}

              {/* History Timeline */}
              <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Report History</h3>
                    {reports.length > 2 && (
                        <button onClick={handleAiAnalysis} disabled={loadingAi} className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700">
                            <Wand2 size={12}/> {loadingAi ? 'Analyzing...' : 'AI Summary'}
                        </button>
                    )}
                </div>

                {aiAnalysis && (
                    <div className="mb-4 bg-purple-50 p-3 rounded text-sm text-purple-800 border border-purple-100">
                        <strong className="block mb-1">AI Analysis:</strong>
                        {aiAnalysis}
                    </div>
                )}

                <div className="space-y-6 pl-2">
                  {reports.length === 0 ? (
                    <p className="text-center text-gray-400 py-4 text-sm">No reports submitted yet.</p>
                  ) : (
                    reports.map((report, idx) => (
                      <div key={report.id} className="relative pl-6 border-l-2 border-gray-200 pb-2 last:pb-0">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200 border-2 border-white"></div>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-gray-500">{format(new Date(report.createdAt), 'MMM dd, HH:mm')}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{report.percentageCompleted}% Complete</span>
                        </div>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{report.content}</p>
                        {report.issues && (
                          <div className="mt-2 bg-red-50 p-2 rounded text-xs text-red-700 border border-red-100">
                            <strong>Issue:</strong> {report.issues}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
