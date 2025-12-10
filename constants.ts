import { Priority, Project, Task, TaskStatus, User, UserRole } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    username: 'admin',
    password: 'admin123', // In a real app, this should be hashed
    name: 'Administrator',
    email: 'admin@company.com',
    role: UserRole.ADMIN,
    isFirstLogin: true,
  },
  {
    id: 'u2',
    username: 'staff1',
    password: 'password123',
    name: 'Nguyen Van A',
    email: 'a.nguyen@company.com',
    role: UserRole.STAFF,
    isFirstLogin: true,
  },
  {
    id: 'u3',
    username: 'staff2',
    password: 'password123',
    name: 'Tran Thi B',
    email: 'b.tran@company.com',
    role: UserRole.STAFF,
    isFirstLogin: true,
  },
  {
    id: 'u4',
    username: 'staff3',
    password: 'password123',
    name: 'Le Van C',
    email: 'c.le@company.com',
    role: UserRole.STAFF,
    isFirstLogin: true,
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Q3 Marketing Campaign',
    description: 'All tasks related to the summer rollout.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'p2',
    name: 'Website Redesign',
    description: 'Overhaul of the corporate website.',
    createdAt: new Date().toISOString()
  }
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Design Social Media Assets',
    description: 'Create visuals for Facebook and Instagram.',
    startDate: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    deadline: new Date(Date.now() - 86400000 * 1).toISOString(), // Yesterday (Overdue)
    assignedToId: 'u2',
    collaboratorIds: ['u3'],
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    progress: 50,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't2',
    projectId: 'p2',
    title: 'Setup Staging Server',
    description: 'Prepare environment for new website deployment.',
    startDate: new Date().toISOString(),
    deadline: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days future
    assignedToId: 'u3',
    collaboratorIds: [],
    status: TaskStatus.TODO,
    priority: Priority.URGENT,
    progress: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't3',
    // No project ID (Ad-hoc)
    title: 'Fix Office Printer',
    description: 'Contact vendor to repair 2nd floor printer.',
    startDate: new Date().toISOString(),
    deadline: new Date(Date.now() + 86400000 * 1).toISOString(), 
    assignedToId: 'u2',
    collaboratorIds: [],
    status: TaskStatus.TODO,
    priority: Priority.LOW,
    progress: 0,
    createdAt: new Date().toISOString(),
  }
];