
export enum ProjectStatus {
  PLANNING = 'Planning',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  COMPLETED = 'Completed',
}

export enum PaymentStatus {
  PAID = 'Paid',
  PENDING = 'Pending',
  OVERDUE = 'Overdue',
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'Active' | 'Inactive';
  avatar?: string;
  customFields?: Record<string, string>;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  type: 'AI Solution' | 'Web App' | 'Consulting';
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  budget: number;
  progress: number;
}

export interface Quote {
  id: string;
  clientId: string;
  projectType: string;
  items: { description: string; cost: number }[];
  total: number;
  status: 'Draft' | 'Sent' | 'Accepted';
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  issueDate: string;
  dueDate: string;
}

export interface HostingPackage {
  id: string;
  clientId: string;
  appName: string;
  monthlyCost: number;
  lastPaymentDate: string;
  nextPaymentDate: string;
  status: PaymentStatus;
}

export interface SOP {
  id: string;
  title: string;
  category: string;
  content: string;
  lastUpdated: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: any;
}

export interface SystemUser {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Viewer';
  email: string;
  lastLogin: string;
  avatar: string;
}

export interface ReleaseNote {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

export interface OnboardingTask {
  id: string;
  label: string;
  completed: boolean;
}

export interface OnboardingWorkflow {
  id: string;
  clientId: string;
  clientName: string;
  templateName: string;
  tasks: OnboardingTask[];
  status: 'Active' | 'Completed';
  startDate: string;
}

export interface Contract {
  id: string;
  clientId: string;
  clientName: string;
  type: string;
  content: string;
  status: 'Draft' | 'Active' | 'Expired';
  createdAt: string;
}
