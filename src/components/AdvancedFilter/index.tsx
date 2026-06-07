import { useState, useCallback } from 'react';
import { Button, Card, Input, Select, Space, DatePicker } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { storage } from '@/utils/storage';

const { RangePicker } = DatePicker;

export type FieldType = 'string' | 'number' | 'date' | 'select';

export interface FilterField {
  key: string;
  label: string;
  type: FieldType;
  options?: { label: string; value: string }[];
}

export interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: unknown;
}

export interface FilterGroup {
  logic: 'AND' | 'OR';
  conditions: FilterCondition[];
}

interface SavedScheme {
  name: string;
  group: FilterGroup;
}

interface AdvancedFilterProps {
  fields: FilterField[];
  storageKey: string;
  onApply: (group: FilterGroup) => void;
  onReset: () => void;
}

const OPERATORS_BY_TYPE: Record<FieldType, { label: string; value: string }[]> = {
  string: [
    { label: '=', value: 'eq' },
    { label: '!=', value: 'neq' },
    { label: 'contains', value: 'contains' },
  ],
  number: [
    { label: '=', value: 'eq' },
    { label: '!=', value: 'neq' },
    { label: '>', value: 'gt' },
    { label: '<', value: 'lt' },
    { label: '>=', value: 'gte' },
    { label: '<=', value: 'lte' },
  ],
  date: [
    { label: '=', value: 'eq' },
    { label: 'between', value: 'between' },
  ],
  select: [
    { label: '=', value: 'eq' },
    { label: '!=', value: 'neq' },
  ],
};

let conditionIdCounter = 0;
function genId() {
  return `cond_${Date.now()}_${++conditionIdCounter}`;
}

function makeCondition(): FilterCondition {
  return { id: genId(), field: '', operator: 'eq', value: '' };
}

export default function AdvancedFilter({ fields, storageKey, onApply, onReset }: AdvancedFilterProps) {
  const { t } = useTranslation();
  const schemeStorageKey = `advanced-filter-schemes-${storageKey}`;

  const [group, setGroup] = useState<FilterGroup>({
    logic: 'AND',
    conditions: [makeCondition()],
  });
  const [savedSchemes, setSavedSchemes] = useState<SavedScheme[]>(
    () => storage.get<SavedScheme[]>(schemeStorageKey) ?? [],
  );
  const [schemeName, setSchemeName] = useState('');

  const updateCondition = useCallback((id: string, patch: Partial<FilterCondition>) => {
    setGroup((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const addCondition = () => {
    setGroup((prev) => ({ ...prev, conditions: [...prev.conditions, makeCondition()] }));
  };

  const removeCondition = (id: string) => {
    setGroup((prev) => ({
      ...prev,
      conditions: prev.conditions.length > 1 ? prev.conditions.filter((c) => c.id !== id) : prev.conditions,
    }));
  };

  const handleApply = () => {
    const valid = group.conditions.filter((c) => c.field && c.value !== '' && c.value !== null && c.value !== undefined);
    if (valid.length > 0) {
      onApply({ ...group, conditions: valid });
    }
  };

  const handleReset = () => {
    setGroup({ logic: 'AND', conditions: [makeCondition()] });
    onReset();
  };

  const saveScheme = () => {
    if (!schemeName.trim()) return;
    const next = [...savedSchemes.filter((s) => s.name !== schemeName), { name: schemeName, group }];
    setSavedSchemes(next);
    storage.set(schemeStorageKey, next);
    setSchemeName('');
  };

  const loadScheme = (scheme: SavedScheme) => {
    setGroup({ ...scheme.group, conditions: scheme.group.conditions.map((c) => ({ ...c, id: genId() })) });
  };

  const deleteScheme = (name: string) => {
    const next = savedSchemes.filter((s) => s.name !== name);
    setSavedSchemes(next);
    storage.set(schemeStorageKey, next);
  };

  const getFieldDef = (key: string) => fields.find((f) => f.key === key);

  const renderValueInput = (cond: FilterCondition) => {
    const fieldDef = getFieldDef(cond.field);
    if (!fieldDef) return <Input disabled placeholder={t('advancedFilter.selectField')} style={{ width: 200 }} />;

    if (fieldDef.type === 'select') {
      return (
        <Select
          value={cond.value as string}
          onChange={(v) => updateCondition(cond.id, { value: v })}
          options={fieldDef.options}
          style={{ width: 200 }}
          allowClear
          placeholder={t('advancedFilter.selectValue')}
        />
      );
    }

    if (fieldDef.type === 'date' && cond.operator === 'between') {
      return (
        <RangePicker
          onChange={(dates) => updateCondition(cond.id, { value: dates })}
          style={{ width: 260 }}
        />
      );
    }

    return (
      <Input
        value={cond.value as string}
        onChange={(e) => updateCondition(cond.id, { value: e.target.value })}
        placeholder={t('advancedFilter.enterValue')}
        style={{ width: 200 }}
      />
    );
  };

  return (
    <Card size="small" className="mb-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="text-sm font-medium">{t('advancedFilter.title')}</span>
        <Select
          value={group.logic}
          onChange={(v) => setGroup((prev) => ({ ...prev, logic: v }))}
          style={{ width: 90 }}
          options={[
            { label: 'AND', value: 'AND' },
            { label: 'OR', value: 'OR' },
          ]}
        />
      </div>

      <div className="space-y-2">
        {group.conditions.map((cond) => {
          const fieldDef = getFieldDef(cond.field);
          const operators = fieldDef ? OPERATORS_BY_TYPE[fieldDef.type] : OPERATORS_BY_TYPE.string;

          return (
            <div key={cond.id} className="flex items-center gap-2">
              <Select
                value={cond.field || undefined}
                onChange={(v) => updateCondition(cond.id, { field: v, operator: 'eq', value: '' })}
                placeholder={t('advancedFilter.selectField')}
                style={{ width: 160 }}
                options={fields.map((f) => ({ label: f.label, value: f.key }))}
              />
              <Select
                value={cond.operator}
                onChange={(v) => updateCondition(cond.id, { operator: v })}
                style={{ width: 100 }}
                options={operators}
              />
              {renderValueInput(cond)}
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeCondition(cond.id)}
                disabled={group.conditions.length <= 1}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Space>
          <Button type="dashed" icon={<PlusOutlined />} onClick={addCondition} size="small">
            {t('advancedFilter.addCondition')}
          </Button>
        </Space>
        <Space>
          {savedSchemes.length > 0 && (
            <Select
              placeholder={t('advancedFilter.loadScheme')}
              style={{ width: 150 }}
              allowClear
              onChange={(v) => {
                const s = savedSchemes.find((sc) => sc.name === v);
                if (s) loadScheme(s);
              }}
              options={savedSchemes.map((s) => ({
                label: (
                  <div className="flex items-center justify-between">
                    <span>{s.name}</span>
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={(e) => { e.stopPropagation(); deleteScheme(s.name); }}
                    />
                  </div>
                ),
                value: s.name,
              }))}
            />
          )}
          <Input
            placeholder={t('advancedFilter.schemeName')}
            value={schemeName}
            onChange={(e) => setSchemeName(e.target.value)}
            style={{ width: 120 }}
            size="small"
          />
          <Button size="small" icon={<SaveOutlined />} onClick={saveScheme} disabled={!schemeName.trim()}>
            {t('advancedFilter.save')}
          </Button>
          <Button size="small" onClick={handleReset}>{t('common.reset')}</Button>
          <Button size="small" type="primary" icon={<FolderOpenOutlined />} onClick={handleApply}>
            {t('advancedFilter.apply')}
          </Button>
        </Space>
      </div>
    </Card>
  );
}
