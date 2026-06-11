export interface Building {
  id: string;
  projectId: string;
  name: string;
  code?: string | null;
  sort?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Floor {
  id: string;
  buildingId: string;
  name: string;
  floorNo: number;
  sort?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type UnitStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';

export interface Unit {
  id: string;
  floorId: string;
  name: string;
  code?: string | null;
  area?: number | null;
  unitType: string;
  status: UnitStatus;
  renterProfileId?: string | null;
  renterProfile?: { id: string; name: string; phone: string | null } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyTreeNode {
  id: string;
  key: string;
  title: string;
  type: 'BUILDING' | 'FLOOR' | 'UNIT';
  data: Building | Floor | Unit;
  children?: PropertyTreeNode[];
}
