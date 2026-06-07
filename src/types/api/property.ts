export interface BuildingCreateDTO {
  projectId: string;
  name: string;
  code?: string;
  totalFloors?: number;
  builtYear?: number;
  remark?: string;
}

export type BuildingUpdateDTO = Partial<Omit<BuildingCreateDTO, 'projectId'>>;

export interface FloorCreateDTO {
  buildingId: string;
  floorNumber: number;
  remark?: string;
}

export type FloorUpdateDTO = Partial<Omit<FloorCreateDTO, 'buildingId'>>;

export interface UnitCreateDTO {
  floorId: string;
  unitNumber: string;
  houseType?: string;
  buildingArea?: number;
  innerArea?: number;
  direction?: string;
  monthlyRent?: number;
  remark?: string;
}

export type UnitUpdateDTO = Partial<Omit<UnitCreateDTO, 'floorId'>>;

export interface UnitBindDTO {
  renterId: string;
}
