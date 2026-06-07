import ReactEChartsCore from 'echarts-for-react/lib/core';
import type { ComponentProps } from 'react';
import echarts from '@/utils/echarts';

/**
 * ECharts 统一封装。
 * echarts-for-react 为 CJS 包，在 Vite dev 的 ESM interop 下 default 可能被多包一层，
 * 导致渲染时「Element type is invalid ... got: object」。此处做容错解包，
 * 兼容 dev / prod / 测试 mock 三种场景，并统一注入按需引入的 echarts 实例。
 */
const ResolvedECharts = ((ReactEChartsCore as unknown as { default?: typeof ReactEChartsCore })
  .default ?? ReactEChartsCore) as typeof ReactEChartsCore;

type EChartProps = Omit<ComponentProps<typeof ReactEChartsCore>, 'echarts'>;

export default function EChart(props: EChartProps) {
  return <ResolvedECharts echarts={echarts} {...props} />;
}
