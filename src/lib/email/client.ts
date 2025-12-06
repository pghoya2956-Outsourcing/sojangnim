import nodemailer from 'nodemailer'

/**
 * SMTP 설정으로 nodemailer transporter 생성
 */
export function createEmailTransporter() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const secure = process.env.SMTP_SECURE === 'true'
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD

  if (!host || !user || !pass) {
    console.warn('SMTP 설정이 완료되지 않았습니다. 이메일 발송이 비활성화됩니다.')
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  })
}

/**
 * 이메일 발송 설정
 */
export function getEmailConfig() {
  return {
    fromName: process.env.SMTP_FROM_NAME || '소장님',
    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@example.com',
    notificationEmail: process.env.INQUIRY_NOTIFICATION_EMAIL,
  }
}
