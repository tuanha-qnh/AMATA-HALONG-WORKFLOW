export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export interface User {
  id: string;
  username: string;
  password?: string; // Hashed or plain in demo
  name: string;
  email: string;
  role: UserRole;
  isFirstLogin: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface TaskReport {
  id: string;
  taskId: string;
  userId: string;
  createdAt: string; // ISO Date
  content: string;
  issues?: string;
  delayReason?: string;
  percentageCompleted: number;
}

export interface Task {
  id: string;
  projectId?: string; // Optional: Link to a project
  title: string;
  description: string;
  startDate: string;
  deadline: string;
  assignedToId: string;
  collaboratorIds: string[];
  status: TaskStatus;
  priority: Priority;
  notes?: string;
  createdAt: string;
  progress: number; // 0-100
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: string;
  senderEmail: string;
  senderPassword: string; // stored in local storage for demo
  enableNotifications: boolean;
}

export type Language = 'en' | 'vi';