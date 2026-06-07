import { authHandlers } from './auth';
import { companyHandlers } from './company';
import { projectHandlers } from './project';
import { userHandlers } from './user';
import { renterHandlers } from './renter';
import { propertyHandlers } from './property';
import { leaseHandlers } from './lease';
import { contractHandlers } from './contract';
import { billingHandlers } from './billing';
import { paymentHandlers } from './payment';
import { repairHandlers } from './repair';
import { complaintHandlers } from './complaint';
import { announcementHandlers } from './announcement';
import { notificationHandlers } from './notification';
import { dashboardHandlers } from './dashboard';
import { reportHandlers } from './report';
import { auditHandlers } from './audit';

export const handlers = [
  ...authHandlers,
  ...companyHandlers,
  ...projectHandlers,
  ...userHandlers,
  ...renterHandlers,
  ...propertyHandlers,
  ...leaseHandlers,
  ...contractHandlers,
  ...billingHandlers,
  ...paymentHandlers,
  ...repairHandlers,
  ...complaintHandlers,
  ...announcementHandlers,
  ...notificationHandlers,
  ...dashboardHandlers,
  ...reportHandlers,
  ...auditHandlers,
];
