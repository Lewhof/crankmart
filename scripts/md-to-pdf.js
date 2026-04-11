const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Simple markdown to HTML converter (handles tables, code blocks, headers, lists, bold, italic)
function mdToHtml(md) {
  let html = md;

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre style="background:#f4f4f5;padding:12px;border-radius:6px;font-size:13px;overflow-x:auto;"><code>${code.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>`
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background:#f4f4f5;padding:2px 5px;border-radius:3px;font-size:13px;">$1</code>');

  // Tables
  html = html.replace(/^(\|.+\|)\n(\|[-\s:|]+\|)\n((?:\|.+\|\n?)*)/gm, (_, header, sep, body) => {
    const headers = header.split('|').filter(c => c.trim()).map(c => `<th style="border:1px solid #ddd;padding:8px;background:#f8f9fa;text-align:left;">${c.trim()}</th>`).join('');
    const rows = body.trim().split('\n').map(row => {
      const cells = row.split('|').filter(c => c.trim()).map(c => `<td style="border:1px solid #ddd;padding:8px;">${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<table style="border-collapse:collapse;width:100%;margin:16px 0;font-size:14px;"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  });

  // Headers
  html = html.replace(/^#### (.+)$/gm, '<h4 style="color:#273970;margin:20px 0 8px;">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 style="color:#273970;margin:24px 0 10px;border-bottom:1px solid #eee;padding-bottom:6px;">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 style="color:#1a2550;margin:28px 0 12px;border-bottom:2px solid #273970;padding-bottom:8px;">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 style="color:#1a2550;margin:0 0 10px;font-size:28px;">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #ddd;margin:24px 0;">');

  // Checkbox lists
  html = html.replace(/^- \[x\] (.+)$/gm, '<div style="margin:4px 0;padding-left:20px;">&#9745; $1</div>');
  html = html.replace(/^- \[ \] (.+)$/gm, '<div style="margin:4px 0;padding-left:20px;">&#9744; $1</div>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li style="margin:4px 0;">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul style="margin:8px 0;padding-left:24px;">${match}</ul>`);

  // Numbered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li style="margin:4px 0;">$1</li>');

  // Line breaks to paragraphs (lines that aren't already HTML)
  html = html.replace(/^(?!<[a-z]|$)(.+)$/gm, '<p style="margin:6px 0;line-height:1.6;">$1</p>');

  return html;
}

async function generatePdf(inputFile, outputFile) {
  const md = fs.readFileSync(inputFile, 'utf-8');
  const htmlContent = mdToHtml(md);

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { margin: 20mm 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      color: #1a1a1a;
      line-height: 1.6;
      max-width: 100%;
    }
    h1 { page-break-after: avoid; }
    h2, h3, h4 { page-break-after: avoid; }
    table { page-break-inside: avoid; }
    pre { page-break-inside: avoid; }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle' });
  await page.pdf({
    path: outputFile,
    format: 'A4',
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    printBackground: true,
  });
  await browser.close();
  console.log(`PDF generated: ${outputFile}`);
}

const input = process.argv[2];
const output = process.argv[3] || input.replace(/\.md$/, '.pdf');
generatePdf(input, output).catch(console.error);
