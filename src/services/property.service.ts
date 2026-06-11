import { http } from '@/api/request';
import type { PropertyTreeNode, Building, Floor, Unit, BuildingCreateDTO, BuildingUpdateDTO, FloorCreateDTO, FloorUpdateDTO, UnitCreateDTO, UnitUpdateDTO, UnitBindDTO } from '@/types';

type BackendUnit = Unit & { renterProfile?: { id: string; name: string; phone: string | null } | null };
type BackendFloor = Floor & { units: BackendUnit[] };
type BackendBuilding = Building & { floors: BackendFloor[] };

function toTreeNodes(buildings: BackendBuilding[]): PropertyTreeNode[] {
  return buildings.map((b) => ({
    id: b.id,
    key: b.id,
    title: b.name,
    type: 'BUILDING' as const,
    data: { id: b.id, projectId: b.projectId, name: b.name, code: b.code, sort: b.sort, createdAt: b.createdAt, updatedAt: b.updatedAt },
    children: (b.floors ?? []).map((f) => ({
      id: f.id,
      key: f.id,
      title: `${f.floorNo}层`,
      type: 'FLOOR' as const,
      data: { id: f.id, buildingId: f.buildingId, name: f.name, floorNo: f.floorNo, sort: f.sort, createdAt: f.createdAt, updatedAt: f.updatedAt },
      children: (f.units ?? []).map((u) => ({
        id: u.id,
        key: u.id,
        title: u.name,
        type: 'UNIT' as const,
        data: u,
      })),
    })),
  }));
}

export const propertyService = {
  getTree: (projectId: string) =>
    http.get<BackendBuilding[]>(`/properties/projects/${projectId}/tree`).then(toTreeNodes),

  createBuilding: (data: BuildingCreateDTO) =>
    http.post<PropertyTreeNode>('/properties/buildings', data),

  updateBuilding: (id: string, data: BuildingUpdateDTO) =>
    http.put<PropertyTreeNode>(`/properties/buildings/${id}`, data),

  deleteBuilding: (id: string) =>
    http.delete<void>(`/properties/buildings/${id}`),

  createFloor: (data: FloorCreateDTO) =>
    http.post<PropertyTreeNode>('/properties/floors', data),

  updateFloor: (id: string, data: FloorUpdateDTO) =>
    http.put<PropertyTreeNode>(`/properties/floors/${id}`, data),

  deleteFloor: (id: string) =>
    http.delete<void>(`/properties/floors/${id}`),

  createUnit: (data: UnitCreateDTO) =>
    http.post<PropertyTreeNode>('/properties/units', data),

  updateUnit: (id: string, data: UnitUpdateDTO) =>
    http.put<PropertyTreeNode>(`/properties/units/${id}`, data),

  deleteUnit: (id: string) =>
    http.delete<void>(`/properties/units/${id}`),

  bindUnit: (id: string, data: UnitBindDTO) =>
    http.post<void>(`/properties/units/${id}/bind`, data),

  unbindUnit: (id: string) =>
    http.post<void>(`/properties/units/${id}/unbind`),
};
