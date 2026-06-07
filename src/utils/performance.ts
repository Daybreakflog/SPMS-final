import { onCLS, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';

function logMetric(metric: Metric) {
  const { name, value, rating } = metric;
  console.log(`[Web Vitals] ${name}: ${Math.round(value * 100) / 100}ms (${rating})`);
}

export function initWebVitals() {
  onCLS(logMetric);
  onLCP(logMetric);
  onTTFB(logMetric);
  onINP(logMetric);
}

export function trackRouteChange(pathname: string) {
  const startTime = performance.now();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const duration = performance.now() - startTime;
      console.log(`[Route] ${pathname} rendered in ${Math.round(duration)}ms`);
    });
  });
}
