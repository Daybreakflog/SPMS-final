import { http, HttpResponse } from 'msw';

interface MockRenterProfile {
  id: string;
  name: string;
  phone: string | null;
}

interface MockUnit {
  id: string;
  floorId: string;
  name: string;
  code: string;
  area: number;
  unitType: string;
  status: string;
  renterProfileId?: string;
  renterProfile?: MockRenterProfile | null;
  createdAt: string;
  updatedAt: string;
}

interface MockFloor {
  id: string;
  buildingId: string;
  name: string;
  floorNo: number;
  sort: number;
  createdAt: string;
  updatedAt: string;
  units: MockUnit[];
}

interface MockBuilding {
  id: string;
  projectId: string;
  name: string;
  code: string;
  sort: number;
  createdAt: string;
  updatedAt: string;
  floors: MockFloor[];
}

const buildings: Record<string, MockBuilding[]> = {};

function initProjectBuildings(projectId: string): MockBuilding[] {
  if (buildings[projectId]) return buildings[projectId];
  const projectIndex = parseInt(projectId.replace('project-', ''), 10) - 1;
  const buildingCount = 3 + (projectIndex % 3);
  const result: MockBuilding[] = [];

  for (let b = 0; b < buildingCount; b++) {
    const buildingId = `building-${projectId}-${b + 1}`;
    const floorCount = 5 + (b % 4);
    const unitsPerFloor = 4 + (b % 3);
    const floors: MockFloor[] = [];

    for (let f = 0; f < floorCount; f++) {
      const floorId = `floor-${buildingId}-${f + 1}`;
      const units: MockUnit[] = [];

      for (let u = 0; u < unitsPerFloor; u++) {
        const unitIdx = b * 100 + f * 10 + u;
        const isBound = unitIdx % 4 === 0;
        const renterId = isBound ? `renter-${String((unitIdx % 15) + 1).padStart(3, '0')}` : undefined;
        units.push({
          id: `unit-${floorId}-${u + 1}`,
          floorId,
          name: `${f + 1}${String(u + 1).padStart(2, '0')}`,
          code: `${buildingId}-${f + 1}${String(u + 1).padStart(2, '0')}`,
          area: 60 + (unitIdx % 80),
          unitType: 'ROOM',
          status: isBound ? 'OCCUPIED' : 'VACANT',
          renterProfileId: renterId,
          renterProfile: renterId ? { id: renterId, name: `租户${(unitIdx % 15) + 1}`, phone: null } : null,
          createdAt: new Date(2024, 0, 1).toISOString(),
          updatedAt: new Date(2024, 0, 1).toISOString(),
        });
      }

      floors.push({
        id: floorId,
        buildingId,
        name: `${f + 1}层`,
        floorNo: f + 1,
        sort: f,
        createdAt: new Date(2024, 0, 1).toISOString(),
        updatedAt: new Date(2024, 0, 1).toISOString(),
        units,
      });
    }

    result.push({
      id: buildingId,
      projectId,
      name: `${b + 1}号楼`,
      code: `B${String(b + 1).padStart(2, '0')}`,
      sort: b,
      createdAt: new Date(2024, 0, 1 + b * 10).toISOString(),
      updatedAt: new Date(2024, 0, 1 + b * 10).toISOString(),
      floors,
    });
  }

  buildings[projectId] = result;
  return result;
}

function buildTreeResponse(buildingList: MockBuilding[]) {
  return buildingList.map((b) => ({
    id: b.id,
    key: b.id,
    title: b.name,
    type: 'BUILDING' as const,
    data: { id: b.id, projectId: b.projectId, name: b.name, code: b.code, sort: b.sort, createdAt: b.createdAt, updatedAt: b.updatedAt },
    children: b.floors.map((f) => ({
      id: f.id,
      key: f.id,
      title: `${f.floorNo}层`,
      type: 'FLOOR' as const,
      data: { id: f.id, buildingId: f.buildingId, name: f.name, floorNo: f.floorNo, sort: f.sort, createdAt: f.createdAt, updatedAt: f.updatedAt },
      children: f.units.map((u) => ({
        id: u.id,
        key: u.id,
        title: u.name,
        type: 'UNIT' as const,
        data: u,
      })),
    })),
  }));
}

function findUnitGlobal(unitId: string): MockUnit | undefined {
  for (const bs of Object.values(buildings)) {
    for (const b of bs) {
      for (const f of b.floors) {
        const u = f.units.find((u) => u.id === unitId);
        if (u) return u;
      }
    }
  }
  return undefined;
}

export const propertyHandlers = [
  http.get('/api/properties/my-units', () => {
    return HttpResponse.json([
      {
        id: 'unit-floor-building-project-101-1-1-1',
        name: '101',
        code: 'B01-101',
        floorId: 'floor-building-project-101-1-1',
        area: 85,
        unitType: 'ROOM',
        status: 'OCCUPIED',
        renterProfileId: 'renter-001',
        renterProfile: { id: 'renter-001', name: '张伟', phone: '13901000101' },
        createdAt: new Date(2024, 0, 1).toISOString(),
        updatedAt: new Date(2024, 0, 1).toISOString(),
      },
    ]);
  }),

  http.get('/api/properties/projects/:projectId/tree', ({ params }) => {
    const projectId = params.projectId as string;
    const buildingList = initProjectBuildings(projectId);
    return HttpResponse.json(buildTreeResponse(buildingList));
  }),

  http.post('/api/properties/buildings', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const projectId = body.projectId as string;
    const bs = initProjectBuildings(projectId);
    const now = new Date().toISOString();
    const newBuilding: MockBuilding = {
      id: `building-${projectId}-${bs.length + 1}`,
      projectId,
      name: body.name as string,
      code: (body.code as string) ?? `B${String(bs.length + 1).padStart(2, '0')}`,
      sort: (body.sort as number) ?? bs.length,
      createdAt: now,
      updatedAt: now,
      floors: [],
    };
    bs.push(newBuilding);
    return HttpResponse.json({ id: newBuilding.id, key: newBuilding.id, title: newBuilding.name, type: 'BUILDING', data: newBuilding, children: [] }, { status: 201 });
  }),

  http.put('/api/properties/buildings/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    for (const bs of Object.values(buildings)) {
      const b = bs.find((b) => b.id === params.id);
      if (b) {
        Object.assign(b, body, { updatedAt: new Date().toISOString() });
        return HttpResponse.json({ id: b.id, key: b.id, title: b.name, type: 'BUILDING', data: b });
      }
    }
    return HttpResponse.json({ message: '楼栋不存在' }, { status: 404 });
  }),

  http.delete('/api/properties/buildings/:id', ({ params }) => {
    for (const [pid, bs] of Object.entries(buildings)) {
      const idx = bs.findIndex((b) => b.id === params.id);
      if (idx !== -1) {
        buildings[pid].splice(idx, 1);
        return HttpResponse.json(null, { status: 200 });
      }
    }
    return HttpResponse.json({ message: '楼栋不存在' }, { status: 404 });
  }),

  http.post('/api/properties/floors', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const buildingId = body.buildingId as string;
    for (const bs of Object.values(buildings)) {
      const b = bs.find((b) => b.id === buildingId);
      if (b) {
        const now = new Date().toISOString();
        const floorNo = (body.floorNo as number) ?? b.floors.length + 1;
        const floor: MockFloor = {
          id: `floor-${buildingId}-${b.floors.length + 1}`,
          buildingId,
          name: `${floorNo}层`,
          floorNo,
          sort: b.floors.length,
          createdAt: now,
          updatedAt: now,
          units: [],
        };
        b.floors.push(floor);
        return HttpResponse.json({ id: floor.id, key: floor.id, title: `${floor.floorNo}层`, type: 'FLOOR', data: floor, children: [] }, { status: 201 });
      }
    }
    return HttpResponse.json({ message: '楼栋不存在' }, { status: 404 });
  }),

  http.put('/api/properties/floors/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    for (const bs of Object.values(buildings)) {
      for (const b of bs) {
        const f = b.floors.find((f) => f.id === params.id);
        if (f) {
          Object.assign(f, body, { updatedAt: new Date().toISOString() });
          return HttpResponse.json({ id: f.id, key: f.id, title: `${f.floorNo}层`, type: 'FLOOR', data: f });
        }
      }
    }
    return HttpResponse.json({ message: '楼层不存在' }, { status: 404 });
  }),

  http.delete('/api/properties/floors/:id', ({ params }) => {
    for (const bs of Object.values(buildings)) {
      for (const b of bs) {
        const idx = b.floors.findIndex((f) => f.id === params.id);
        if (idx !== -1) {
          b.floors.splice(idx, 1);
          return HttpResponse.json(null, { status: 200 });
        }
      }
    }
    return HttpResponse.json({ message: '楼层不存在' }, { status: 404 });
  }),

  http.post('/api/properties/units', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const floorId = body.floorId as string;
    for (const bs of Object.values(buildings)) {
      for (const b of bs) {
        const f = b.floors.find((f) => f.id === floorId);
        if (f) {
          const now = new Date().toISOString();
          const unit: MockUnit = {
            id: `unit-${floorId}-${f.units.length + 1}`,
            floorId,
            name: body.name as string,
            code: (body.code as string) ?? `${f.id}-${f.units.length + 1}`,
            area: (body.area as number) ?? 0,
            unitType: (body.unitType as string) ?? 'ROOM',
            status: 'VACANT',
            renterProfileId: undefined,
            renterProfile: null,
            createdAt: now,
            updatedAt: now,
          };
          f.units.push(unit);
          return HttpResponse.json({ id: unit.id, key: unit.id, title: unit.name, type: 'UNIT', data: unit }, { status: 201 });
        }
      }
    }
    return HttpResponse.json({ message: '楼层不存在' }, { status: 404 });
  }),

  http.put('/api/properties/units/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const unit = findUnitGlobal(params.id as string);
    if (unit) {
      Object.assign(unit, body, { updatedAt: new Date().toISOString() });
      return HttpResponse.json({ id: unit.id, key: unit.id, title: unit.name, type: 'UNIT', data: unit });
    }
    return HttpResponse.json({ message: '单元不存在' }, { status: 404 });
  }),

  http.delete('/api/properties/units/:id', ({ params }) => {
    for (const bs of Object.values(buildings)) {
      for (const b of bs) {
        for (const f of b.floors) {
          const idx = f.units.findIndex((u) => u.id === params.id);
          if (idx !== -1) {
            f.units.splice(idx, 1);
            return HttpResponse.json(null, { status: 200 });
          }
        }
      }
    }
    return HttpResponse.json({ message: '单元不存在' }, { status: 404 });
  }),

  http.post('/api/properties/units/:id/bind', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const unit = findUnitGlobal(params.id as string);
    if (unit) {
      const renterId = body.renterProfileId as string;
      unit.renterProfileId = renterId;
      unit.renterProfile = { id: renterId, name: '租户', phone: null };
      unit.status = 'OCCUPIED';
      return HttpResponse.json({ message: '绑定成功' });
    }
    return HttpResponse.json({ message: '单元不存在' }, { status: 404 });
  }),

  http.post('/api/properties/units/:id/unbind', async ({ params }) => {
    const unit = findUnitGlobal(params.id as string);
    if (unit) {
      unit.renterProfileId = undefined;
      unit.renterProfile = null;
      unit.status = 'VACANT';
      return HttpResponse.json({ message: '解绑成功' });
    }
    return HttpResponse.json({ message: '单元不存在' }, { status: 404 });
  }),
];
