// API service for server communication
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
  };
  expires_at: string;
}

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data!;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.token = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
    }

    return response.data!;
  }

  // Generic CRUD operations
  async create<T>(endpoint: string, data: Partial<T>): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async getById<T>(endpoint: string, id: string): Promise<T> {
    const response = await this.request<T>(`${endpoint}/${id}`);
    return response.data!;
  }

  async getAll<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    const queryString = params 
      ? '?' + new URLSearchParams(params).toString()
      : '';
    
    const response = await this.request<PaginatedResponse<T>>(
      `${endpoint}${queryString}`
    );
    return response.data!;
  }

  async update<T>(endpoint: string, id: string, data: Partial<T>): Promise<T> {
    const response = await this.request<T>(`${endpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  async delete(endpoint: string, id: string): Promise<void> {
    await this.request(`${endpoint}/${id}`, {
      method: 'DELETE',
    });
  }

  // Patient specific operations
  async getPatients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    return this.getAll('/patients', params);
  }

  async createPatient(patient: any) {
    return this.create('/patients', patient);
  }

  async updatePatient(id: string, patient: any) {
    return this.update('/patients', id, patient);
  }

  async deletePatient(id: string) {
    return this.delete('/patients', id);
  }

  async getPatientHistory(patientId: string) {
    const response = await this.request(`/patients/${patientId}/history`);
    return response.data;
  }

  // Appointment specific operations
  async getAppointments(params?: {
    date?: string;
    doctorId?: string;
    patientId?: string;
    status?: string;
  }) {
    return this.getAll('/appointments', params);
  }

  async createAppointment(appointment: any) {
    return this.create('/appointments', appointment);
  }

  async updateAppointment(id: string, appointment: any) {
    return this.update('/appointments', id, appointment);
  }

  async deleteAppointment(id: string) {
    return this.delete('/appointments', id);
  }

  async getDoctorAvailability(doctorId: string, date: string) {
    const response = await this.request(
      `/doctors/${doctorId}/availability?date=${date}`
    );
    return response.data;
  }

  // Medical Records
  async getMedicalRecords(patientId: string) {
    return this.getAll(`/patients/${patientId}/medical-records`);
  }

  async createMedicalRecord(patientId: string, record: any) {
    return this.create(`/patients/${patientId}/medical-records`, record);
  }

  async updateMedicalRecord(patientId: string, recordId: string, record: any) {
    return this.update(`/patients/${patientId}/medical-records`, recordId, record);
  }

  // Billing operations
  async getBillingRecords(params?: {
    patientId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return this.getAll('/billing', params);
  }

  async createInvoice(invoice: any) {
    return this.create('/billing/invoices', invoice);
  }

  async updateInvoice(id: string, invoice: any) {
    return this.update('/billing/invoices', id, invoice);
  }

  async processPayment(invoiceId: string, payment: any) {
    return this.create(`/billing/invoices/${invoiceId}/payments`, payment);
  }

  async submitInsuranceClaim(claim: any) {
    return this.create('/billing/insurance-claims', claim);
  }

  async getInsuranceClaimStatus(claimId: string) {
    const response = await this.request(`/billing/insurance-claims/${claimId}`);
    return response.data;
  }

  // Inventory operations
  async getInventoryItems(params?: {
    category?: string;
    lowStock?: boolean;
    expiringSoon?: boolean;
  }) {
    return this.getAll('/inventory', params);
  }

  async createInventoryItem(item: any) {
    return this.create('/inventory', item);
  }

  async updateInventoryItem(id: string, item: any) {
    return this.update('/inventory', id, item);
  }

  async updateStock(itemId: string, quantity: number, operation: 'add' | 'subtract') {
    return this.create(`/inventory/${itemId}/stock`, { quantity, operation });
  }

  // Lab Tests
  async getLabTests(params?: {
    patientId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return this.getAll('/lab-tests', params);
  }

  async createLabTest(test: any) {
    return this.create('/lab-tests', test);
  }

  async updateLabTest(id: string, test: any) {
    return this.update('/lab-tests', id, test);
  }

  async uploadLabResults(testId: string, results: any) {
    return this.create(`/lab-tests/${testId}/results`, results);
  }

  // Bed Management
  async getBeds(params?: {
    roomType?: string;
    status?: string;
    floor?: string;
  }) {
    return this.getAll('/beds', params);
  }

  async assignBed(bedId: string, patientId: string, admissionData: any) {
    return this.create(`/beds/${bedId}/assign`, { patientId, ...admissionData });
  }

  async dischargeBed(bedId: string, dischargeData: any) {
    return this.create(`/beds/${bedId}/discharge`, dischargeData);
  }

  // Doctor Management
  async getDoctors(params?: {
    department?: string;
    specialization?: string;
    available?: boolean;
  }) {
    return this.getAll('/doctors', params);
  }

  async createDoctor(doctor: any) {
    return this.create('/doctors', doctor);
  }

  async updateDoctor(id: string, doctor: any) {
    return this.update('/doctors', id, doctor);
  }

  async updateDoctorSchedule(doctorId: string, schedule: any) {
    return this.update(`/doctors/${doctorId}/schedule`, '', schedule);
  }

  // Notifications
  async getNotifications(params?: {
    type?: string;
    read?: boolean;
    limit?: number;
  }) {
    return this.getAll('/notifications', params);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.update('/notifications', notificationId, { read: true });
  }

  async sendSMSNotification(notification: {
    phone: string;
    message: string;
    type: string;
  }) {
    return this.create('/notifications/sms', notification);
  }

  // Reports
  async getReports(type: string, params?: Record<string, any>) {
    return this.getAll(`/reports/${type}`, params);
  }

  async generateReport(type: string, filters: any) {
    return this.create(`/reports/${type}/generate`, filters);
  }

  // User Management
  async getUsers() {
    return this.getAll('/users');
  }

  async createUser(user: any) {
    return this.create('/users', user);
  }

  async updateUser(id: string, user: any) {
    return this.update('/users', id, user);
  }

  async updateUserPermissions(userId: string, permissions: string[]) {
    return this.update('/users', userId, { permissions });
  }

  // System operations
  async getSystemStats() {
    const response = await this.request('/system/stats');
    return response.data;
  }

  async backupData() {
    const response = await this.request('/system/backup', { method: 'POST' });
    return response.data;
  }

  async restoreData(backupFile: File) {
    const formData = new FormData();
    formData.append('backup', backupFile);

    const response = await fetch(`${this.baseUrl}/system/restore`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    return response.json();
  }

  // Sync operations
  async getSyncStatus() {
    const response = await this.request('/sync/status');
    return response.data;
  }

  async forceSyncTable(tableName: string) {
    return this.create('/sync/force', { tableName });
  }

  async resolveSyncConflict(conflictId: string, resolution: 'local' | 'server') {
    return this.create('/sync/resolve-conflict', { conflictId, resolution });
  }

  // Utility methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiService = new ApiService();
export default ApiService;