/**
 * 全局错误上报工具。
 * - 统一收集 ErrorBoundary / window 错误 / 未处理 Promise 拒绝
 * - 上报前对敏感信息脱敏（手机号、身份证、邮箱、Token）
 * - 默认输出到控制台；配置 VITE_ERROR_REPORT_URL 后通过 sendBeacon 上报远端
 */

export type ErrorSource =
  | 'react'
  | 'window'
  | 'unhandledrejection'
  | 'manual';

export interface ErrorReport {
  message: string;
  stack?: string;
  source: ErrorSource;
  context?: string;
  url: string;
  userAgent: string;
  time: string;
}

const SENSITIVE_PATTERNS: { re: RegExp; replacer: (m: string) => string }[] = [
  // 手机号
  { re: /1[3-9]\d{9}/g, replacer: (m) => `${m.slice(0, 3)}****${m.slice(7)}` },
  // 身份证（15/18 位）
  { re: /\b\d{17}[\dXx]\b|\b\d{15}\b/g, replacer: (m) => `${m.slice(0, 3)}***${m.slice(-2)}` },
  // 邮箱
  { re: /[\w.+-]+@[\w-]+\.[\w.-]+/g, replacer: (m) => `${m[0]}***@***` },
  // Bearer / JWT Token
  { re: /(eyJ[\w-]+\.[\w-]+\.[\w-]+)/g, replacer: () => '***TOKEN***' },
];

/** 对文本做脱敏处理 */
export function desensitize(text: string | undefined): string {
  if (!text) return '';
  return SENSITIVE_PATTERNS.reduce(
    (acc, { re, replacer }) => acc.replace(re, replacer),
    text,
  );
}

function buildReport(
  error: unknown,
  source: ErrorSource,
  context?: string,
): ErrorReport {
  const err = error instanceof Error ? error : new Error(String(error));
  return {
    message: desensitize(err.message),
    stack: desensitize(err.stack).slice(0, 2000) || undefined,
    source,
    context: context ? desensitize(context) : undefined,
    url: desensitize(window.location.href),
    userAgent: navigator.userAgent,
    time: new Date().toISOString(),
  };
}

/** 上报一条错误 */
export function reportError(
  error: unknown,
  source: ErrorSource = 'manual',
  context?: string,
): ErrorReport {
  const report = buildReport(error, source, context);

  // 始终输出到控制台，便于本地排查
  console.error('[errorReporter]', report);

  const endpoint = import.meta.env.VITE_ERROR_REPORT_URL as string | undefined;
  if (endpoint && typeof navigator.sendBeacon === 'function') {
    try {
      navigator.sendBeacon(endpoint, JSON.stringify(report));
    } catch {
      // 上报失败不应影响主流程
    }
  }

  return report;
}

let initialized = false;

/** 注册全局错误监听（仅注册一次） */
export function initGlobalErrorHandlers(): void {
  if (initialized) return;
  initialized = true;

  window.addEventListener('error', (event) => {
    reportError(event.error ?? event.message, 'window');
  });

  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason, 'unhandledrejection');
  });
}
