export interface BuildingCreateDTO {
  projectId: string;
  name: string;
  code?: string;
  sort?: number;
}

export type BuildingUpdateDTO = Partial<Omit<BuildingCreateDTO, 'projectId'>>;

export interface FloorCreateDTO {
  buildingId: string;
  name: string;
  floorNo: number;
  sort?: number;
}

export type FloorUpdateDTO = Partial<Omit<FloorCreateDTO, 'buildingId'>>;

export interface UnitCreateDTO {
  floorId: string;
  name: string;
  code?: string;
  area?: number;
  unitType?: 'ROOM' | 'SHOP' | 'PARKING';
  status?: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';
}

export type UnitUpdateDTO = Partial<Omit<UnitCreateDTO, 'floorId'>>;

export interface UnitBindDTO {
  renterProfileId: string;
}
