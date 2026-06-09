export const WIDGET_ORDER_KEY = 'dashboard_widget_order';
export type WidgetKey = 'kpi' | 'trend' | 'repair' | 'expiring' | 'todo' | 'announcement';
export const DEFAULT_WIDGET_ORDER: WidgetKey[] = ['kpi', 'trend', 'repair', 'expiring', 'todo', 'announcement'];

export function loadWidgetOrder(): WidgetKey[] {
  try {
    const raw = localStorage.getItem(WIDGET_ORDER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WidgetKey[];
      if (Array.isArray(parsed) && parsed.length === DEFAULT_WIDGET_ORDER.length) return parsed;
    }
  } catch { /* ignore */ }
  return [...DEFAULT_WIDGET_ORDER];
}

export function saveWidgetOrder(order: WidgetKey[]) {
  localStorage.setItem(WIDGET_ORDER_KEY, JSON.stringify(order));
}
