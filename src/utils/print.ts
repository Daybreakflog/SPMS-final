/**
 * 打印 / 导出 PDF 工具。
 * 通过隐藏 iframe 仅打印目标区域，避免整页（含侧边栏/头部）被打印。
 * 用户在系统打印对话框中选择“另存为 PDF”即可导出 PDF。
 */

/** 收集当前页面的样式标签，复制到打印 iframe 中以保持外观一致 */
function collectStyles(): string {
  return Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((node) => node.outerHTML)
    .join('\n');
}

/**
 * 打印指定 DOM 节点的内容。
 * @param elementId 目标节点的 id
 * @param title 打印文档标题（也是“另存为 PDF”时的默认文件名）
 */
export function printElementById(elementId: string, title = document.title): void {
  const el = document.getElementById(elementId);
  if (!el) {
    // 找不到目标节点时退化为整页打印
    window.print();
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    document.body.removeChild(iframe);
    window.print();
    return;
  }

  const theme = document.documentElement.getAttribute('data-theme') ?? 'light';
  doc.open();
  doc.write(
    `<!doctype html><html data-theme="${theme}"><head><meta charset="utf-8"><title>${title}</title>${collectStyles()}` +
      `<style>body{margin:0;padding:24px;background:#fff;color:#000;} @page{margin:16mm;}</style>` +
      `</head><body>${el.outerHTML}</body></html>`,
  );
  doc.close();

  const triggerPrint = () => {
    win.focus();
    win.print();
    // 打印对话框关闭后清理 iframe
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 500);
  };

  // 等待样式与内容加载完成
  if (doc.readyState === 'complete') {
    setTimeout(triggerPrint, 300);
  } else {
    iframe.onload = () => setTimeout(triggerPrint, 300);
  }
}
