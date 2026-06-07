export interface Renter {
  id: string;
  name: string;
  gender?: string;
  birthDate?: string;
  idType: string;
  idNumber: string;
  phone: string;
  phoneAlt?: string;
  email?: string;
  emergencyContact?: string;
  company?: string;
  position?: string;
  attachments?: string[];
  remark?: string;
  currentUnit?: string;
  currentProjectId?: string;
  currentProjectName?: string;
  accountStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RenterAccount {
  id: string;
  renterId: string;
  username: string;
  status: string;
  lastLoginAt?: string;
  createdAt?: string;
}
