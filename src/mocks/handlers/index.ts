import { settingHandlers } from './setting';
import { authHandlers } from './auth';
import { healthHandlers } from './health';
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
import { notificationHandlers, notificationCenterHandlers } from './notification';
import { dashboardHandlers } from './dashboard';
import { reportHandlers } from './report';
import { auditHandlers } from './audit';
import { fileHandlers } from './files';

export const handlers = [
  ...settingHandlers,
  ...authHandlers,
  ...healthHandlers,
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
  ...notificationCenterHandlers,
  ...dashboardHandlers,
  ...reportHandlers,
  ...auditHandlers,
  ...fileHandlers,
];
