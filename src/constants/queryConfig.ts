/**
 * React Query 缓存时间预设（毫秒）。
 * 按数据“变化频率”分级，平衡实时性与请求次数。
 */
export const STALE_TIME = {
  /** 基本不变的字典/下拉项（项目、租户列表等），缓存 30 分钟 */
  STATIC: 30 * 60 * 1000,
  /** 普通列表数据，缓存 5 分钟 */
  LIST: 5 * 60 * 1000,
  /** 详情数据，缓存 5 分钟 */
  DETAIL: 5 * 60 * 1000,
  /** 实时性较强的数据（通知、待办），不缓存 */
  REALTIME: 0,
} as const;

/** 垃圾回收时间预设（毫秒） */
export const GC_TIME = {
  DEFAULT: 5 * 60 * 1000,
  STATIC: 60 * 60 * 1000,
} as const;
