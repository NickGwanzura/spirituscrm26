import { Client, Project, Invoice, HostingPackage, SOP, Contract, OnboardingWorkflow, SystemUser } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearToken();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(email: string, password: string, name: string, role?: string) {
    const data = await this.fetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
    this.setToken(data.token);
    return data;
  }

  async getCurrentUser() {
    return this.fetch('/auth/me');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Dashboard
  async getDashboardStats() {
    return this.fetch('/dashboard');
  }

  // Clients
  async getClients(): Promise<Client[]> {
    const data = await this.fetch('/clients');
    return data.map((c: any) => ({
      id: c.id.toString(),
      name: c.name,
      company: c.company,
      email: c.email,
      status: c.status,
      avatar: c.avatar,
      customFields: c.custom_fields,
    }));
  }

  async createClient(client: Omit<Client, 'id'>): Promise<Client> {
    const data = await this.fetch('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
    return { ...client, id: data.id.toString() };
  }

  async updateClient(id: string, client: Partial<Client>): Promise<Client> {
    const data = await this.fetch(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    });
    return {
      id: data.id.toString(),
      name: data.name,
      company: data.company,
      email: data.email,
      status: data.status,
      avatar: data.avatar,
      customFields: data.custom_fields,
    };
  }

  async deleteClient(id: string): Promise<void> {
    await this.fetch(`/clients/${id}`, { method: 'DELETE' });
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    const data = await this.fetch('/projects');
    return data.map((p: any) => ({
      id: p.id.toString(),
      clientId: p.client_id.toString(),
      name: p.name,
      type: p.type,
      status: p.status,
      startDate: p.start_date,
      endDate: p.end_date,
      budget: p.budget,
      progress: p.progress,
    }));
  }

  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    const data = await this.fetch('/projects', {
      method: 'POST',
      body: JSON.stringify({
        client_id: project.clientId,
        name: project.name,
        type: project.type,
        status: project.status,
        start_date: project.startDate,
        end_date: project.endDate,
        budget: project.budget,
        progress: project.progress,
      }),
    });
    return { ...project, id: data.id.toString() };
  }

  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    const data = await this.fetch(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        client_id: project.clientId,
        name: project.name,
        type: project.type,
        status: project.status,
        start_date: project.startDate,
        end_date: project.endDate,
        budget: project.budget,
        progress: project.progress,
      }),
    });
    return {
      id: data.id.toString(),
      clientId: data.client_id.toString(),
      name: data.name,
      type: data.type,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      budget: data.budget,
      progress: data.progress,
    };
  }

  async deleteProject(id: string): Promise<void> {
    await this.fetch(`/projects/${id}`, { method: 'DELETE' });
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    const data = await this.fetch('/invoices');
    return data.map((i: any) => ({
      id: i.id.toString(),
      invoiceNumber: i.invoice_number,
      clientId: i.client_id.toString(),
      clientName: i.client_name,
      amount: i.amount,
      status: i.status,
      issueDate: i.issue_date,
      dueDate: i.due_date,
    }));
  }

  async createInvoice(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
    const data = await this.fetch('/invoices', {
      method: 'POST',
      body: JSON.stringify({
        invoice_number: invoice.invoiceNumber,
        client_id: invoice.clientId,
        client_name: invoice.clientName,
        amount: invoice.amount,
        status: invoice.status,
        issue_date: invoice.issueDate,
        due_date: invoice.dueDate,
      }),
    });
    return { ...invoice, id: data.id.toString() };
  }

  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    const data = await this.fetch(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        invoice_number: invoice.invoiceNumber,
        client_id: invoice.clientId,
        client_name: invoice.clientName,
        amount: invoice.amount,
        status: invoice.status,
        issue_date: invoice.issueDate,
        due_date: invoice.dueDate,
      }),
    });
    return {
      id: data.id.toString(),
      invoiceNumber: data.invoice_number,
      clientId: data.client_id.toString(),
      clientName: data.client_name,
      amount: data.amount,
      status: data.status,
      issueDate: data.issue_date,
      dueDate: data.due_date,
    };
  }

  async deleteInvoice(id: string): Promise<void> {
    await this.fetch(`/invoices/${id}`, { method: 'DELETE' });
  }

  // Hosting
  async getHostingPackages(): Promise<HostingPackage[]> {
    const data = await this.fetch('/hosting');
    return data.map((h: any) => ({
      id: h.id.toString(),
      clientId: h.client_id.toString(),
      appName: h.app_name,
      monthlyCost: h.monthly_cost,
      lastPaymentDate: h.last_payment_date,
      nextPaymentDate: h.next_payment_date,
      status: h.status,
    }));
  }

  // SOPs
  async getSOPs(): Promise<SOP[]> {
    const data = await this.fetch('/sops');
    return data.map((s: any) => ({
      id: s.id.toString(),
      title: s.title,
      category: s.category,
      content: s.content,
      lastUpdated: s.last_updated,
    }));
  }

  async createSOP(sop: Omit<SOP, 'id'>): Promise<SOP> {
    const data = await this.fetch('/sops', {
      method: 'POST',
      body: JSON.stringify(sop),
    });
    return { ...sop, id: data.id.toString() };
  }

  async updateSOP(id: string, sop: Partial<SOP>): Promise<SOP> {
    const data = await this.fetch(`/sops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sop),
    });
    return {
      id: data.id.toString(),
      title: data.title,
      category: data.category,
      content: data.content,
      lastUpdated: data.last_updated,
    };
  }

  async deleteSOP(id: string): Promise<void> {
    await this.fetch(`/sops/${id}`, { method: 'DELETE' });
  }

  // Contracts
  async getContracts(): Promise<Contract[]> {
    const data = await this.fetch('/contracts');
    return data.map((c: any) => ({
      id: c.id.toString(),
      clientId: c.client_id.toString(),
      clientName: c.client_name,
      type: c.type,
      content: c.content,
      status: c.status,
      createdAt: c.created_at,
    }));
  }

  async createContract(contract: Omit<Contract, 'id'>): Promise<Contract> {
    const data = await this.fetch('/contracts', {
      method: 'POST',
      body: JSON.stringify({
        client_id: contract.clientId,
        client_name: contract.clientName,
        type: contract.type,
        content: contract.content,
        status: contract.status,
      }),
    });
    return { ...contract, id: data.id.toString() };
  }

  async updateContract(id: string, contract: Partial<Contract>): Promise<Contract> {
    const data = await this.fetch(`/contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        client_id: contract.clientId,
        client_name: contract.clientName,
        type: contract.type,
        content: contract.content,
        status: contract.status,
      }),
    });
    return {
      id: data.id.toString(),
      clientId: data.client_id.toString(),
      clientName: data.client_name,
      type: data.type,
      content: data.content,
      status: data.status,
      createdAt: data.created_at,
    };
  }

  // Onboarding
  async getOnboardingWorkflows(): Promise<OnboardingWorkflow[]> {
    const data = await this.fetch('/onboarding');
    return data.map((o: any) => ({
      id: o.id.toString(),
      clientId: o.client_id.toString(),
      clientName: o.client_name,
      templateName: o.template_name,
      status: o.status,
      startDate: o.start_date,
      tasks: o.tasks || [],
    }));
  }

  async createOnboardingWorkflow(workflow: Omit<OnboardingWorkflow, 'id'>): Promise<OnboardingWorkflow> {
    const data = await this.fetch('/onboarding', {
      method: 'POST',
      body: JSON.stringify({
        client_id: workflow.clientId,
        client_name: workflow.clientName,
        template_name: workflow.templateName,
        status: workflow.status,
        start_date: workflow.startDate,
        tasks: workflow.tasks,
      }),
    });
    return { ...workflow, id: data.id.toString() };
  }

  async updateOnboardingWorkflow(id: string, workflow: Partial<OnboardingWorkflow>): Promise<OnboardingWorkflow> {
    const data = await this.fetch(`/onboarding/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        client_id: workflow.clientId,
        client_name: workflow.clientName,
        template_name: workflow.templateName,
        status: workflow.status,
        start_date: workflow.startDate,
        tasks: workflow.tasks,
      }),
    });
    return {
      id: data.id.toString(),
      clientId: data.client_id.toString(),
      clientName: data.client_name,
      templateName: data.template_name,
      status: data.status,
      startDate: data.start_date,
      tasks: data.tasks,
    };
  }

  // Users
  async getUsers(): Promise<SystemUser[]> {
    const data = await this.fetch('/users');
    return data.map((u: any) => ({
      id: u.id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      lastLogin: u.last_login,
      avatar: u.avatar,
    }));
  }

  async deleteUser(id: string): Promise<void> {
    await this.fetch(`/users/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiService();
export default api;
