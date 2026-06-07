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
  floorNumber: number;
  unitCount?: number;
  remark?: string;
}

export interface Unit {
  id: string;
  floorId: string;
  buildingId?: string;
  unitNumber: string;
  houseType?: string;
  buildingArea?: number;
  innerArea?: number;
  direction?: string;
  monthlyRent?: number;
  renterId?: string;
  renterName?: string;
  bindStatus: string;
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
