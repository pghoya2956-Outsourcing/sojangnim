import { createEmailTransporter, getEmailConfig } from './client'
import type { InquiryItem } from '@/types/inquiry'

interface InquiryNotificationData {
  customerName: string
  customerContact: string
  message?: string
  items: InquiryItem[]
  totalAmount: number
  tenantName: string
}

/**
 * 문의 알림 이메일 발송
 */
export async function sendInquiryNotification(data: InquiryNotificationData): Promise<void> {
  const transporter = createEmailTransporter()
  const config = getEmailConfig()

  if (!transporter) {
    console.warn('이메일 transporter가 설정되지 않았습니다.')
    return
  }

  if (!config.notificationEmail) {
    console.warn('알림 이메일 주소가 설정되지 않았습니다.')
    return
  }

  const subject = `[새 문의] ${data.customerName}님이 문의를 남겼습니다`

  const itemsTable = data.items
    .map(
      (item) =>
        `  ${item.product_name.padEnd(20)} ${String(item.quantity).padStart(3)}개    ${item.subtotal.toLocaleString('ko-KR').padStart(12)}원`
    )
    .join('\n')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { border-bottom: 2px solid #1a1a1a; padding-bottom: 10px; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 18px; color: #1a1a1a; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: bold; color: #1a1a1a; margin-bottom: 8px; }
    .info-row { margin: 4px 0; }
    .info-label { color: #666; }
    .items-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    .items-table th, .items-table td { border: 1px solid #e0e0e0; padding: 8px; text-align: left; }
    .items-table th { background: #f5f5f5; }
    .items-table .right { text-align: right; }
    .total-row { font-weight: bold; background: #f9f9f9; }
    .message-box { background: #f9f9f9; padding: 12px; border-radius: 4px; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; color: #888; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>새로운 문의가 접수되었습니다</h1>
    </div>

    <div class="section">
      <div class="section-title">고객 정보</div>
      <div class="info-row">
        <span class="info-label">이름/회사:</span> ${escapeHtml(data.customerName)}
      </div>
      <div class="info-row">
        <span class="info-label">연락처:</span> ${escapeHtml(data.customerContact)}
      </div>
    </div>

    ${data.message ? `
    <div class="section">
      <div class="section-title">문의 내용</div>
      <div class="message-box">${escapeHtml(data.message)}</div>
    </div>
    ` : ''}

    <div class="section">
      <div class="section-title">문의 품목</div>
      <table class="items-table">
        <thead>
          <tr>
            <th>품목명</th>
            <th class="right">수량</th>
            <th class="right">단가</th>
            <th class="right">금액</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
          <tr>
            <td>${escapeHtml(item.product_name)}</td>
            <td class="right">${item.quantity}개</td>
            <td class="right">${item.product_price.toLocaleString('ko-KR')}원</td>
            <td class="right">${item.subtotal.toLocaleString('ko-KR')}원</td>
          </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="3" class="right">합계</td>
            <td class="right">${data.totalAmount.toLocaleString('ko-KR')}원</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">문의 시각</div>
      <div>${new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</div>
    </div>

    <div class="footer">
      이 이메일은 ${escapeHtml(data.tenantName)}의 문의 시스템에서 자동 발송되었습니다.
    </div>
  </div>
</body>
</html>
`

  const text = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
새로운 문의가 접수되었습니다
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 고객 정보
  이름/회사: ${data.customerName}
  연락처: ${data.customerContact}

${data.message ? `■ 문의 내용
  ${data.message}

` : ''}■ 문의 품목
${itemsTable}
  ────────────────────────────────────
  합계                      ${data.totalAmount.toLocaleString('ko-KR')}원

■ 문의 시각
  ${new Date().toLocaleString('ko-KR')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이 이메일은 ${data.tenantName}의 문의 시스템에서 자동 발송되었습니다.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

  await transporter.sendMail({
    from: `"${config.fromName}" <${config.fromEmail}>`,
    to: config.notificationEmail,
    subject,
    text,
    html,
  })

  console.log(`문의 알림 이메일 발송 완료: ${config.notificationEmail}`)
}

/**
 * HTML 이스케이프
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
