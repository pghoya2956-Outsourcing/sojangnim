/**
 * 견적서 출력 템플릿 (옵션3: 밸런스 버전)
 * Phase 8: 견적서 출력 템플릿 구현
 */

import type { QuotationData } from '@/types/quotation'
import { formatNumber, formatCurrency } from '@/lib/quotation/generator'
import Image from 'next/image'
import styles from './QuotationTemplate.module.css'

interface QuotationTemplateProps {
  data: QuotationData
}

export default function QuotationTemplate({ data }: QuotationTemplateProps) {
  const { metadata, company, recipient, items, totalSupplyPrice, totalTaxAmount, totalAmount } = data

  // 빈 행을 추가하여 최소 행 수 유지
  const MIN_ROWS = 9  // 5개 실제 품목 + 4개 빈 행 = 9행
  const emptyRowsCount = Math.max(0, MIN_ROWS - items.length)
  const emptyRows = Array(emptyRowsCount).fill(null)

  return (
    <div className={styles.quotation}>
      {/* 헤더 */}
      <div className={styles.header}>
        {company.logoImage ? (
          <div className={styles.headerWithLogo}>
            <Image
              src={company.logoImage}
              alt="회사 로고"
              width={120}
              height={40}
              className={styles.logo}
            />
            <h1 className={styles.titleWithLogo}>견 적 서</h1>
          </div>
        ) : (
          <h1 className={styles.title}>견 적 서</h1>
        )}
      </div>

      {/* 상단 정보 영역 */}
      <div className={styles.headerSection}>
        {/* 좌측: 수신자 및 메타 정보 */}
        <div className={styles.recipientMeta}>
          <div className={styles.recipient}>
            <span className={styles.recipientName}>{recipient.name}</span>
            <span className={styles.recipientSuffix}>귀중</span>
          </div>

          {/* 거래처 상세 정보 */}
          {(recipient.contactPerson || recipient.phone || recipient.address) && (
            <div className={styles.recipientDetails}>
              {recipient.contactPerson && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>담당자:</span>
                  <span>{recipient.contactPerson}</span>
                </div>
              )}
              {recipient.phone && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>연락처:</span>
                  <span>{recipient.phone}</span>
                </div>
              )}
              {recipient.address && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>주소:</span>
                  <span>{recipient.address}</span>
                </div>
              )}
            </div>
          )}

          <div className={styles.metaInfo}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>견적서 번호:</span>
              <span>{metadata.number}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>작성일자:</span>
              <span>{metadata.date}</span>
            </div>
          </div>
        </div>

        {/* 우측: 공급자 정보 박스 */}
        <div className={styles.companyBox}>
          <div className={styles.companyHeader}>
            <span className={styles.companyTitle}>공급자 정보</span>
            {company.sealImage && (
              <Image
                src={company.sealImage}
                alt="회사 도장"
                width={32}
                height={32}
                className={styles.sealSmall}
              />
            )}
          </div>

          <table className={styles.companyTable}>
            <tbody>
              <tr>
                <td>사업자번호</td>
                <td>{company.businessNumber}</td>
              </tr>
              <tr>
                <td>상호</td>
                <td>{company.name}</td>
              </tr>
              <tr>
                <td>대표자명</td>
                <td>{company.representative}</td>
              </tr>
              <tr>
                <td>주소</td>
                <td>{company.address}</td>
              </tr>
              <tr>
                <td>업태 / 종목</td>
                <td>{company.businessType} / {company.businessCategory}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 품목 테이블 */}
      <table className={styles.itemsTable}>
        <thead>
          <tr>
            <th style={{ width: '40px' }}>순번</th>
            <th style={{ width: '175px' }}>품목명</th>
            <th style={{ width: '195px' }}>규격</th>
            <th style={{ width: '50px' }}>수량</th>
            <th style={{ width: '90px' }}>단가</th>
            <th style={{ width: '95px' }}>공급가액</th>
            <th style={{ width: '80px' }}>세액</th>
          </tr>
        </thead>
        <tbody>
          {/* 실제 품목 */}
          {items.map((item) => (
            <tr key={item.seq}>
              <td>{item.seq}</td>
              <td className={styles.textLeft}>{item.name}</td>
              <td className={`${styles.textLeft} ${styles.spec}`}>{item.spec}</td>
              <td>{item.quantity}</td>
              <td className={styles.textRight}>{formatNumber(item.unitPrice)}</td>
              <td className={styles.textRight}>{formatNumber(item.supplyPrice)}</td>
              <td className={styles.textRight}>{formatNumber(item.taxAmount)}</td>
            </tr>
          ))}

          {/* 빈 행 */}
          {emptyRows.map((_, index) => (
            <tr key={`empty-${index}`}>
              <td>&nbsp;</td>
              <td className={styles.textLeft}>&nbsp;</td>
              <td className={`${styles.textLeft} ${styles.spec}`}>&nbsp;</td>
              <td>&nbsp;</td>
              <td className={styles.textRight}>&nbsp;</td>
              <td className={styles.textRight}>&nbsp;</td>
              <td className={styles.textRight}>&nbsp;</td>
            </tr>
          ))}

          {/* 소계 행 */}
          <tr className={styles.subtotalRow}>
            <td colSpan={5} className={styles.textRight}>소계</td>
            <td className={styles.textRight}>{formatNumber(totalSupplyPrice)}</td>
            <td className={styles.textRight}>{formatNumber(totalTaxAmount)}</td>
          </tr>

          {/* 총 합계 행 */}
          <tr className={styles.totalRow}>
            <td colSpan={5} className={styles.textRight}>총 합계 (공급가액 + 부가세 10%)</td>
            <td colSpan={2} className={`${styles.textRight} ${styles.grandTotal}`}>
              {formatCurrency(totalAmount)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 하단 문구 */}
      <div className={styles.footer}>
        <p className={styles.footerText}>위와 같이 견적합니다.</p>
        <p className={styles.companyName}>{company.name}</p>
      </div>
    </div>
  )
}
