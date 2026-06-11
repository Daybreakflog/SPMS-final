import { useState, useMemo } from 'react';
import { Tree, Card, Select, Descriptions, Tag, Button, Space, Popconfirm, Empty, Spin, Form, Input, InputNumber, Modal, Drawer } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined, DisconnectOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/PageHeader';
import PermissionGuard from '@/components/PermissionGuard';
import { propertyService } from '@/services/property.service';
import { projectService } from '@/services/project.service';
import { renterService } from '@/services/renter.service';
import { getMessageApi } from '@/utils/antd';
import { RoleCode } from '@/types/enums';
import { STALE_TIME, GC_TIME } from '@/constants/queryConfig';
import type { PropertyTreeNode, Building, Floor, Unit, Renter } from '@/types';

type NodeFormMode = 'createBuilding' | 'editBuilding' | 'createFloor' | 'editFloor' | 'createUnit' | 'editUnit' | null;

export default function PropertyTreePage() {
  const { t } = useTranslation();
  const [projectOverride, setProjectOverride] = useState<string | undefined>(undefined);
  const [selectedNode, setSelectedNode] = useState<PropertyTreeNode | null>(null);
  const [formMode, setFormMode] = useState<NodeFormMode>(null);
  const [nodeForm] = Form.useForm();
  const [bindDrawerOpen, setBindDrawerOpen] = useState(false);
  const [renters, setRenters] = useState<Renter[]>([]);
  const [selectedRenterId, setSelectedRenterId] = useState<string>('');

  const { data: projects = [] } = useQuery({
    queryKey: ['property-projects'],
    queryFn: () => projectService.list({ page: 1, pageSize: 200 }).then((r) => r.items),
    staleTime: STALE_TIME.STATIC,
    gcTime: GC_TIME.STATIC,
  });

  const selectedProjectId = projectOverride ?? (projects.length > 0 ? projects[0].id : '');

  const { data: treeData = [], isLoading: loading, refetch: refetchTree } = useQuery({
    queryKey: ['property-tree', selectedProjectId],
    queryFn: () => propertyService.getTree(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  const handleProjectChange = (val: string) => {
    setProjectOverride(val);
    setSelectedNode(null);
  };

  const handleSelect = (_: unknown, info: { node: { key: string } }) => {
    const findNode = (nodes: PropertyTreeNode[], key: string): PropertyTreeNode | null => {
      for (const n of nodes) {
        if (n.key === key) return n;
        if (n.children) {
          const found = findNode(n.children, key);
          if (found) return found;
        }
      }
      return null;
    };
    const node = findNode(treeData, info.node.key as string);
    setSelectedNode(node);
  };

  const openNodeForm = (mode: NodeFormMode, initialValues?: Record<string, unknown>) => {
    setFormMode(mode);
    nodeForm.resetFields();
    if (initialValues) nodeForm.setFieldsValue(initialValues);
  };

  const handleNodeFormSubmit = async () => {
    try {
      const values = await nodeForm.validateFields();
      if (formMode === 'createBuilding') {
        await propertyService.createBuilding({ ...values, projectId: selectedProjectId });
      } else if (formMode === 'editBuilding') {
        await propertyService.updateBuilding(selectedNode!.id, values);
      } else if (formMode === 'createFloor') {
        await propertyService.createFloor({ ...values, buildingId: selectedNode!.id });
      } else if (formMode === 'editFloor') {
        await propertyService.updateFloor(selectedNode!.id, values);
      } else if (formMode === 'createUnit') {
        await propertyService.createUnit({ ...values, floorId: selectedNode!.id });
      } else if (formMode === 'editUnit') {
        await propertyService.updateUnit(selectedNode!.id, values);
      }
      getMessageApi()?.success('保存成功');
      setFormMode(null);
      refetchTree();
    } catch {
      // validation
    }
  };

  const handleDeleteNode = async () => {
    if (!selectedNode) return;
    if (selectedNode.type === 'BUILDING') {
      await propertyService.deleteBuilding(selectedNode.id);
    } else if (selectedNode.type === 'FLOOR') {
      await propertyService.deleteFloor(selectedNode.id);
    } else {
      await propertyService.deleteUnit(selectedNode.id);
    }
    getMessageApi()?.success('删除成功');
    setSelectedNode(null);
    refetchTree();
  };

  const handleBind = async () => {
    if (!selectedNode || !selectedRenterId) return;
    await propertyService.bindUnit(selectedNode.id, { renterProfileId: selectedRenterId });
    getMessageApi()?.success('绑定成功');
    setBindDrawerOpen(false);
    setSelectedRenterId('');
    refetchTree();
  };

  const handleUnbind = async () => {
    if (!selectedNode) return;
    await propertyService.unbindUnit(selectedNode.id);
    getMessageApi()?.success('解绑成功');
    refetchTree();
  };

  const openBindDrawer = () => {
    setBindDrawerOpen(true);
    renterService.list({ page: 1, pageSize: 200 }).then((res) => setRenters(res.items));
  };

  const formTitle = useMemo(() => {
    const map: Record<string, string> = {
      createBuilding: '新增楼栋',
      editBuilding: '编辑楼栋',
      createFloor: '新增楼层',
      editFloor: '编辑楼层',
      createUnit: '新增单元',
      editUnit: '编辑单元',
    };
    return formMode ? map[formMode] : '';
  }, [formMode]);

  const renderDetailPanel = () => {
    if (!selectedNode) {
      return <Empty description="请选择节点查看详情" />;
    }

    const nodeData = selectedNode.data;

    if (selectedNode.type === 'BUILDING') {
      const b = nodeData as Building;
      return (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="m-0">{b.name}</h4>
            <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE]}>
              <Space>
                <Button size="small" icon={<PlusOutlined />} onClick={() => openNodeForm('createFloor')}>新增楼层</Button>
                <Button size="small" icon={<EditOutlined />} onClick={() => openNodeForm('editBuilding', b as unknown as Record<string, unknown>)}>编辑</Button>
                <Popconfirm title="确定删除此楼栋?" onConfirm={handleDeleteNode}>
                  <Button size="small" icon={<DeleteOutlined />} danger>删除</Button>
                </Popconfirm>
              </Space>
            </PermissionGuard>
          </div>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="楼栋编号">{b.code ?? '-'}</Descriptions.Item>
          </Descriptions>
        </div>
      );
    }

    if (selectedNode.type === 'FLOOR') {
      const f = nodeData as Floor;
      return (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="m-0">{f.floorNo}层</h4>
            <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE]}>
              <Space>
                <Button size="small" icon={<PlusOutlined />} onClick={() => openNodeForm('createUnit')}>新增单元</Button>
                <Button size="small" icon={<EditOutlined />} onClick={() => openNodeForm('editFloor', f as unknown as Record<string, unknown>)}>编辑</Button>
                <Popconfirm title="确定删除此楼层?" onConfirm={handleDeleteNode}>
                  <Button size="small" icon={<DeleteOutlined />} danger>删除</Button>
                </Popconfirm>
              </Space>
            </PermissionGuard>
          </div>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="层号">{f.floorNo}</Descriptions.Item>
          </Descriptions>
        </div>
      );
    }

    const u = nodeData as Unit;
    const isBound = !!u.renterProfileId;
    return (
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="m-0">单元 {u.name}</h4>
          <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE]}>
            <Space>
              {!isBound ? (
                <Button size="small" icon={<LinkOutlined />} type="primary" onClick={openBindDrawer}>绑定租户</Button>
              ) : (
                <Popconfirm title="确定解绑租户?" onConfirm={handleUnbind}>
                  <Button size="small" icon={<DisconnectOutlined />} danger>解绑租户</Button>
                </Popconfirm>
              )}
              <Button size="small" icon={<EditOutlined />} onClick={() => openNodeForm('editUnit', u as unknown as Record<string, unknown>)}>编辑</Button>
              <Popconfirm title="确定删除此单元?" onConfirm={handleDeleteNode}>
                <Button size="small" icon={<DeleteOutlined />} danger>删除</Button>
              </Popconfirm>
            </Space>
          </PermissionGuard>
        </div>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="单元名称">{u.name}</Descriptions.Item>
          <Descriptions.Item label="编号">{u.code ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="类型">{u.unitType}</Descriptions.Item>
          <Descriptions.Item label="建筑面积">{u.area ? `${u.area} ㎡` : '-'}</Descriptions.Item>
          <Descriptions.Item label="绑定状态">
            <Tag color={isBound ? 'green' : 'default'}>
              {isBound ? '已绑定' : '未绑定'}
            </Tag>
          </Descriptions.Item>
          {u.renterProfile && <Descriptions.Item label="当前租户">{u.renterProfile.name}</Descriptions.Item>}
        </Descriptions>
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title={t('property.treeTitle')}
        extra={
          <PermissionGuard roles={[RoleCode.PLATFORM_ADMIN, RoleCode.COMPANY_ADMIN, RoleCode.PROJECT_ADMIN, RoleCode.CUSTOMER_SERVICE]}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openNodeForm('createBuilding')} disabled={!selectedProjectId}>
              新增楼栋
            </Button>
          </PermissionGuard>
        }
      />

      <div className="flex gap-4">
        <Card className="w-72 shrink-0" styles={{ body: { padding: 16 } }}>
          <div className="mb-3">
            <Select
              value={selectedProjectId}
              onChange={handleProjectChange}
              placeholder="选择项目"
              style={{ width: '100%' }}
              options={projects.map((p) => ({ value: p.id, label: p.name }))}
            />
          </div>
          {loading ? (
            <div className="flex h-40 items-center justify-center"><Spin /></div>
          ) : treeData.length === 0 ? (
            <Empty description="暂无房源数据" />
          ) : (
            <Tree
              treeData={treeData}
              fieldNames={{ key: 'key', title: 'title', children: 'children' }}
              onSelect={(_, info) => handleSelect(_, info as { node: { key: string } })}
              defaultExpandAll
              showLine
              height={500}
            />
          )}
        </Card>

        <Card className="flex-1" styles={{ body: { padding: 16 } }}>
          {renderDetailPanel()}
        </Card>
      </div>

      <Modal
        title={formTitle}
        open={!!formMode}
        onCancel={() => { setFormMode(null); nodeForm.resetFields(); }}
        onOk={handleNodeFormSubmit}
        destroyOnClose
      >
        <Form form={nodeForm} layout="vertical">
          {(formMode === 'createBuilding' || formMode === 'editBuilding') && (
            <>
              <Form.Item name="name" label="楼栋名称" rules={[{ required: true, message: '请输入楼栋名称' }]}>
                <Input placeholder="如：1号楼" />
              </Form.Item>
              <Form.Item name="code" label="楼栋编号">
                <Input placeholder="如：B01" />
              </Form.Item>
            </>
          )}
          {(formMode === 'createFloor' || formMode === 'editFloor') && (
            <Form.Item name="floorNo" label="楼层号" rules={[{ required: true, message: '请输入楼层号' }]}>
              <InputNumber min={-5} max={200} style={{ width: '100%' }} placeholder="请输入楼层号" />
            </Form.Item>
          )}
          {(formMode === 'createUnit' || formMode === 'editUnit') && (
            <>
              <Form.Item name="name" label="单元名称" rules={[{ required: true, message: '请输入单元名称' }]}>
                <Input placeholder="如：101" />
              </Form.Item>
              <Form.Item name="code" label="单元编号">
                <Input placeholder="如：B01-101" />
              </Form.Item>
              <Form.Item name="area" label="建筑面积（㎡）">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入建筑面积" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      <Drawer
        title="绑定租户"
        open={bindDrawerOpen}
        onClose={() => { setBindDrawerOpen(false); setSelectedRenterId(''); }}
        styles={{ wrapper: { width: 400 } }}
        extra={
          <Button type="primary" onClick={handleBind} disabled={!selectedRenterId}>
            确认绑定
          </Button>
        }
      >
        <Select
          showSearch
          value={selectedRenterId || undefined}
          onChange={setSelectedRenterId}
          placeholder="搜索选择租户"
          style={{ width: '100%' }}
          filterOption={(input, option) =>
            (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
          }
          options={renters.map((r) => ({
            value: r.id,
            label: `${r.name} - ${r.phone}`,
          }))}
        />
      </Drawer>
    </div>
  );
}
