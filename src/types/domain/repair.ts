export interface RepairOrder {
  id: string;
  repairNo: string;
  title: string;
  description: string;
  images?: string[];
  renterId: string;
  renterName: string;
  unitId: string;
  unitNumber: string;
  repairType: string;
  urgency: string;
  status: string;
  engineerId?: string;
  engineerName?: string;
  rating?: number;
  ratingComment?: string;
  submittedAt: string;
  assignedAt?: string;
  completedAt?: string;
  ratedAt?: string;
  timeline?: RepairTimeline[];
  createdAt: string;
  updatedAt: string;
}

export interface RepairMessage {
  id: string;
  repairId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  images?: string[];
  createdAt: string;
}

export interface RepairTimeline {
  id: string;
  action: string;
  operatorId: string;
  operatorName: string;
  remark?: string;
  createdAt: string;
}
