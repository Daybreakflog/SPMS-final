import { http, HttpResponse } from 'msw';

interface MockUnit {
  id: string;
  floorId: string;
  buildingId: string;
  name: string;
  houseType: string;
  area: number;
  innerArea: number;
  direction: string;
  monthlyRent: number;
  renterProfileId?: string;
  renterName?: string;
  bindStatus: string;
  remark?: string;
}

interface MockFloor {
  id: string;
  buildingId: string;
  floorNo: number;
  unitCount: number;
  remark?: string;
  units: MockUnit[];
}

interface MockBuilding {
  id: string;
  projectId: string;
  name: string;
  code: string;
  totalFloors: number;
  totalUnits: number;
  builtYear: number;
  remark?: string;
  createdAt: string;
  floors: MockFloor[];
}

const directions = ['东', '南', '西', '北', '东南', '西南', '东北', '西北'];
const houseTypes = ['一室一厅', '两室一厅', '两室两厅', '三室一厅', '三室两厅'];

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
        units.push({
          id: `unit-${floorId}-${u + 1}`,
          floorId,
          buildingId,
          name: `${f + 1}${String(u + 1).padStart(2, '0')}`,
          houseType: houseTypes[unitIdx % houseTypes.length],
          area: 60 + (unitIdx % 80),
          innerArea: 50 + (unitIdx % 70),
          direction: directions[unitIdx % directions.length],
          monthlyRent: 2000 + (unitIdx % 30) * 100,
          renterProfileId: isBound ? `renter-${String((unitIdx % 15) + 1).padStart(3, '0')}` : undefined,
          renterName: isBound ? `租户${(unitIdx % 15) + 1}` : undefined,
          bindStatus: isBound ? 'BOUND' : 'UNBOUND',
        });
      }

      floors.push({
        id: floorId,
        buildingId,
        floorNo: f + 1,
        unitCount: unitsPerFloor,
        units,
      });
    }

    result.push({
      id: buildingId,
      projectId,
      name: `${b + 1}号楼`,
      code: `B${String(b + 1).padStart(2, '0')}`,
      totalFloors: floorCount,
      totalUnits: floorCount * unitsPerFloor,
      builtYear: 2018 + (b % 5),
      createdAt: new Date(2024, 0, 1 + b * 10).toISOString(),
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
    data: { id: b.id, projectId: b.projectId, name: b.name, code: b.code, totalFloors: b.totalFloors, totalUnits: b.totalUnits, builtYear: b.builtYear, createdAt: b.createdAt },
    children: b.floors.map((f) => ({
      id: f.id,
      key: f.id,
      title: `${f.floorNo}层`,
      type: 'FLOOR' as const,
      data: { id: f.id, buildingId: f.buildingId, floorNo: f.floorNo, unitCount: f.unitCount },
      children: f.units.map((u) => ({
        id: u.id,
        key: u.id,
        title: `${u.name}`,
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
  // GET /api/properties/my-units — 租户端：我的房源
  http.get('/api/properties/my-units', () => {
    return HttpResponse.json([
      {
        id: 'unit-floor-building-project-101-1-1-1',
        name: '101',
        buildingName: '1号楼',
        floorNo: 1,
        projectId: 'project-101',
        projectName: '星辰·天鹅湖花园',
        houseType: '两室一厅',
        area: 85,
        innerArea: 72,
        direction: '南',
        monthlyRent: 4500,
        bindStatus: 'BOUND',
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
    const newBuilding: MockBuilding = {
      id: `building-${projectId}-${bs.length + 1}`,
      projectId,
      name: body.name as string,
      code: (body.code as string) ?? `B${String(bs.length + 1).padStart(2, '0')}`,
      totalFloors: (body.totalFloors as number) ?? 0,
      totalUnits: 0,
      builtYear: (body.builtYear as number) ?? new Date().getFullYear(),
      remark: body.remark as string | undefined,
      createdAt: new Date().toISOString(),
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
        Object.assign(b, body);
        return HttpResponse.json({ id: b.id, key: b.id, title: b.name, type: 'BUILDING', data: b });
      }
    }
    return HttpResponse.json({ code: 404, message: '楼栋不存在', data: null }, { status: 404 });
  }),

  http.delete('/api/properties/buildings/:id', ({ params }) => {
    for (const [pid, bs] of Object.entries(buildings)) {
      const idx = bs.findIndex((b) => b.id === params.id);
      if (idx !== -1) {
        buildings[pid].splice(idx, 1);
        return HttpResponse.json(null, { status: 200 });
      }
    }
    return HttpResponse.json({ code: 404, message: '楼栋不存在', data: null }, { status: 404 });
  }),

  http.post('/api/properties/floors', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const buildingId = body.buildingId as string;
    for (const bs of Object.values(buildings)) {
      const b = bs.find((b) => b.id === buildingId);
      if (b) {
        const floor: MockFloor = {
          id: `floor-${buildingId}-${b.floors.length + 1}`,
          buildingId,
          floorNo: (body.floorNo as number) ?? b.floors.length + 1,
          unitCount: 0,
          remark: body.remark as string | undefined,
          units: [],
        };
        b.floors.push(floor);
        b.totalFloors = b.floors.length;
        return HttpResponse.json({ id: floor.id, key: floor.id, title: `${floor.floorNo}层`, type: 'FLOOR', data: floor, children: [] }, { status: 201 });
      }
    }
    return HttpResponse.json({ code: 404, message: '楼栋不存在', data: null }, { status: 404 });
  }),

  http.put('/api/properties/floors/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    for (const bs of Object.values(buildings)) {
      for (const b of bs) {
        const f = b.floors.find((f) => f.id === params.id);
        if (f) {
          Object.assign(f, body);
          return HttpResponse.json({ id: f.id, key: f.id, title: `${f.floorNo}层`, type: 'FLOOR', data: f });
        }
      }
    }
    return HttpResponse.json({ code: 404, message: '楼层不存在', data: null }, { status: 404 });
  }),

  http.delete('/api/properties/floors/:id', ({ params }) => {
    for (const bs of Object.values(buildings)) {
      for (const b of bs) {
        const idx = b.floors.findIndex((f) => f.id === params.id);
        if (idx !== -1) {
          b.floors.splice(idx, 1);
          b.totalFloors = b.floors.length;
          return HttpResponse.json(null, { status: 200 });
        }
      }
    }
    return HttpResponse.json({ code: 404, message: '楼层不存在', data: null }, { status: 404 });
  }),

  http.post('/api/properties/units', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const floorId = body.floorId as string;
    for (const bs of Object.values(buildings)) {
      for (const b of bs) {
        const f = b.floors.find((f) => f.id === floorId);
        if (f) {
          const unit: MockUnit = {
            id: `unit-${floorId}-${f.units.length + 1}`,
            floorId,
            buildingId: b.id,
            name: body.name as string,
            houseType: (body.houseType as string) ?? '',
            area: (body.area as number) ?? 0,
            innerArea: (body.innerArea as number) ?? 0,
            direction: (body.direction as string) ?? '',
            monthlyRent: (body.monthlyRent as number) ?? 0,
            bindStatus: 'UNBOUND',
          };
          f.units.push(unit);
          f.unitCount = f.units.length;
          b.totalUnits = b.floors.reduce((sum, fl) => sum + fl.units.length, 0);
          return HttpResponse.json({ id: unit.id, key: unit.id, title: unit.name, type: 'UNIT', data: unit }, { status: 201 });
        }
      }
    }
    return HttpResponse.json({ code: 404, message: '楼层不存在', data: null }, { status: 404 });
  }),

  http.put('/api/properties/units/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const unit = findUnitGlobal(params.id as string);
    if (unit) {
      Object.assign(unit, body);
      return HttpResponse.json({ id: unit.id, key: unit.id, title: unit.name, type: 'UNIT', data: unit });
    }
    return HttpResponse.json({ code: 404, message: '单元不存在', data: null }, { status: 404 });
  }),

  http.delete('/api/properties/units/:id', ({ params }) => {
    for (const bs of Object.values(buildings)) {
      for (const b of bs) {
        for (const f of b.floors) {
          const idx = f.units.findIndex((u) => u.id === params.id);
          if (idx !== -1) {
            f.units.splice(idx, 1);
            f.unitCount = f.units.length;
            b.totalUnits = b.floors.reduce((sum, fl) => sum + fl.units.length, 0);
            return HttpResponse.json(null, { status: 200 });
          }
        }
      }
    }
    return HttpResponse.json({ code: 404, message: '单元不存在', data: null }, { status: 404 });
  }),

  http.post('/api/properties/units/:id/bind', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const unit = findUnitGlobal(params.id as string);
    if (unit) {
      unit.renterProfileId = body.renterProfileId as string;
      unit.renterName = `租户`;
      unit.bindStatus = 'BOUND';
      return HttpResponse.json({ message: '绑定成功' });
    }
    return HttpResponse.json({ code: 404, message: '单元不存在', data: null }, { status: 404 });
  }),

  http.post('/api/properties/units/:id/unbind', async ({ params }) => {
    const unit = findUnitGlobal(params.id as string);
    if (unit) {
      unit.renterProfileId = undefined;
      unit.renterName = undefined;
      unit.bindStatus = 'UNBOUND';
      return HttpResponse.json({ message: '解绑成功' });
    }
    return HttpResponse.json({ code: 404, message: '单元不存在', data: null }, { status: 404 });
  }),
];
