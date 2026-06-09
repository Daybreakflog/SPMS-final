import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadWidgetOrder, saveWidgetOrder, DEFAULT_WIDGET_ORDER, WIDGET_ORDER_KEY } from '../dashboard/widget-order';

describe('Dashboard widget order persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('初始加载：无 localStorage 时返回默认顺序', () => {
    const order = loadWidgetOrder();
    expect(order).toEqual(DEFAULT_WIDGET_ORDER);
  });

  it('saveWidgetOrder 将顺序写入 localStorage', () => {
    const customOrder = ['announcement', 'todo', 'kpi', 'trend', 'repair', 'expiring'] as typeof DEFAULT_WIDGET_ORDER;
    saveWidgetOrder(customOrder);
    const raw = localStorage.getItem(WIDGET_ORDER_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toEqual(customOrder);
  });

  it('loadWidgetOrder 读取已保存的顺序', () => {
    const customOrder = ['announcement', 'todo', 'kpi', 'trend', 'repair', 'expiring'] as typeof DEFAULT_WIDGET_ORDER;
    saveWidgetOrder(customOrder);
    const loaded = loadWidgetOrder();
    expect(loaded).toEqual(customOrder);
  });

  it('localStorage 数据损坏时回退到默认顺序', () => {
    localStorage.setItem(WIDGET_ORDER_KEY, 'not-valid-json');
    const order = loadWidgetOrder();
    expect(order).toEqual(DEFAULT_WIDGET_ORDER);
  });

  it('localStorage 数据长度不对时回退到默认', () => {
    localStorage.setItem(WIDGET_ORDER_KEY, JSON.stringify(['kpi', 'trend']));
    const order = loadWidgetOrder();
    expect(order).toEqual(DEFAULT_WIDGET_ORDER);
  });

  it('removeItem 后 loadWidgetOrder 返回默认顺序（模拟重置）', () => {
    saveWidgetOrder(['announcement', 'todo', 'kpi', 'trend', 'repair', 'expiring'] as typeof DEFAULT_WIDGET_ORDER);
    localStorage.removeItem(WIDGET_ORDER_KEY);
    const order = loadWidgetOrder();
    expect(order).toEqual(DEFAULT_WIDGET_ORDER);
  });
});
