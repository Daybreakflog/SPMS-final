import { http } from '@/api/request';
import type { PropertyTreeNode, BuildingCreateDTO, BuildingUpdateDTO, FloorCreateDTO, FloorUpdateDTO, UnitCreateDTO, UnitUpdateDTO, UnitBindDTO } from '@/types';

export const propertyService = {
  getTree: (projectId: string) =>
    http.get<PropertyTreeNode[]>(`/properties/projects/${projectId}/tree`),

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
