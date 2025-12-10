import { MOCK_PROJECTS, MOCK_TASKS, MOCK_USERS } from '../constants';
import { Task, TaskReport, User, EmailConfig, Project } from '../types';

const KEYS = {
  USERS: 'workflow_users',
  TASKS: 'workflow_tasks',
  PROJECTS: 'workflow_projects',
  REPORTS: 'workflow_reports',
  CURRENT_USER: 'workflow_current_user',
  EMAIL_CONFIG: 'workflow_email_config',
};

// Initialize Storage
export const initStorage = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(MOCK_USERS));
  }
  if (!localStorage.getItem(KEYS.TASKS)) {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(MOCK_TASKS));
  }
  if (!localStorage.getItem(KEYS.PROJECTS)) {
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(MOCK_PROJECTS));
  }
  if (!localStorage.getItem(KEYS.REPORTS)) {
    localStorage.setItem(KEYS.REPORTS, JSON.stringify([]));
  }
};

// Users
export const getUsers = (): User[] => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
export const saveUsers = (users: User[]) => localStorage.setItem(KEYS.USERS, JSON.stringify(users));

export const addUser = (user: User) => {
    const users = getUsers();
    users.push(user);
    saveUsers(users);
}

export const deleteUser = (userId: string) => {
    const users = getUsers();
    const filtered = users.filter(u => u.id !== userId);
    saveUsers(filtered);
}

// Projects
export const getProjects = (): Project[] => JSON.parse(localStorage.getItem(KEYS.PROJECTS) || '[]');
export const addProject = (project: Project) => {
  const projects = getProjects();
  projects.push(project);
  localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
}

// Tasks
export const getTasks = (): Task[] => JSON.parse(localStorage.getItem(KEYS.TASKS) || '[]');
export const saveTasks = (tasks: Task[]) => localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
export const addTask = (task: Task) => {
  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);
};
export const updateTask = (updatedTask: Task) => {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === updatedTask.id);
  if (index !== -1) {
    tasks[index] = updatedTask;
    saveTasks(tasks);
  }
};

// Reports
export const getReports = (): TaskReport[] => JSON.parse(localStorage.getItem(KEYS.REPORTS) || '[]');
export const addReport = (report: TaskReport) => {
  const reports = getReports();
  reports.push(report);
  localStorage.setItem(KEYS.REPORTS, JSON.stringify(reports));
};

// Session
export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(KEYS.CURRENT_USER);
  return stored ? JSON.parse(stored) : null;
};
export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }
};

// Settings
export const getEmailConfig = (): EmailConfig => {
    const stored = localStorage.getItem(KEYS.EMAIL_CONFIG);
    return stored ? JSON.parse(stored) : {
        smtpHost: 'smtp.gmail.com',
        smtpPort: '587',
        senderEmail: '',
        senderPassword: '',
        enableNotifications: true
    };
}

export const saveEmailConfig = (config: EmailConfig) => {
    localStorage.setItem(KEYS.EMAIL_CONFIG, JSON.stringify(config));
}