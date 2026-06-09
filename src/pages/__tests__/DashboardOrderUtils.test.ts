import { describe, it, expect, beforeEach } from 'vitest';
import { loadWidgetOrder, saveWidgetOrder, DEFAULT_WIDGET_ORDER, WIDGET_ORDER_KEY } from '../dashboard/widget-order';

describe('Dashboard 排序工具函数', () => {
  beforeEach(() => { localStorage.clear(); });

  it('DEFAULT_WIDGET_ORDER 包含 6 个 widget', () => {
    expect(DEFAULT_WIDGET_ORDER).toHaveLength(6);
  });

  it('DEFAULT_WIDGET_ORDER 包含 kpi', () => {
    expect(DEFAULT_WIDGET_ORDER).toContain('kpi');
  });

  it('DEFAULT_WIDGET_ORDER 包含 trend', () => {
    expect(DEFAULT_WIDGET_ORDER).toContain('trend');
  });

  it('DEFAULT_WIDGET_ORDER 包含 repair', () => {
    expect(DEFAULT_WIDGET_ORDER).toContain('repair');
  });

  it('WIDGET_ORDER_KEY 是字符串', () => {
    expect(typeof WIDGET_ORDER_KEY).toBe('string');
    expect(WIDGET_ORDER_KEY.length).toBeGreaterThan(0);
  });

  it('saveWidgetOrder 后立即 load 返回相同值', () => {
    const order = ['todo', 'announcement', 'kpi', 'trend', 'repair', 'expiring'] as typeof DEFAULT_WIDGET_ORDER;
    saveWidgetOrder(order);
    expect(loadWidgetOrder()).toEqual(order);
  });

  it('多次 save 后 load 返回最后一次保存的值', () => {
    const order1 = ['kpi', 'trend', 'repair', 'expiring', 'todo', 'announcement'] as typeof DEFAULT_WIDGET_ORDER;
    const order2 = ['announcement', 'todo', 'expiring', 'repair', 'trend', 'kpi'] as typeof DEFAULT_WIDGET_ORDER;
    saveWidgetOrder(order1);
    saveWidgetOrder(order2);
    expect(loadWidgetOrder()).toEqual(order2);
  });
});
