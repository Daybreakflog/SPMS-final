export interface Building {
  id: string;
  projectId: string;
  name: string;
  code?: string;
  totalFloors?: number;
  totalUnits?: number;
  builtYear?: number;
  remark?: string;
  createdAt?: string;
}

export interface Floor {
  id: string;
  buildingId: string;
  floorNo: number;
  unitCount?: number;
  remark?: string;
}

export type UnitStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';

export interface Unit {
  id: string;
  floorId: string;
  buildingId?: string;
  buildingName?: string;
  floor?: number;
  name: string;
  houseType?: string;
  area?: number;
  innerArea?: number;
  direction?: string;
  monthlyRent?: number;
  renterId?: string;
  renterName?: string;
  bindStatus: string;
  status?: UnitStatus;
  remark?: string;
}

export interface PropertyTreeNode {
  id: string;
  key: string;
  title: string;
  type: 'BUILDING' | 'FLOOR' | 'UNIT';
  data: Building | Floor | Unit;
  children?: PropertyTreeNode[];
}
