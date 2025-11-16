/**
 * 견적서 출력 템플릿 (리팩토링)
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

  // 빈 행을 추가하여 최소 10줄 유지
  const MIN_ROWS = 10
  const emptyRowsCount = Math.max(0, MIN_ROWS - items.length)
  const emptyRows = Array(emptyRowsCount).fill(null)

  return (
    <div className={styles.quotation}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h1 className={styles.title}>견 적 서</h1>

        <div className={styles.headerInfo}>
          {/* 좌측: 수신자 및 메타 정보 */}
          <div className={styles.recipientSection}>
            <div className={styles.recipient}>
              <span className={styles.recipientName}>{recipient.name}</span>
              <span className={styles.recipientSuffix}>귀중</span>
            </div>

            <div className={styles.metadata}>
              <div className={styles.metadataRow}>
                <span className={styles.metadataLabel}>견적서 번호:</span>
                <span>{metadata.number}</span>
              </div>
              <div className={styles.metadataRow}>
                <span className={styles.metadataLabel}>작성일자:</span>
                <span>{metadata.date}</span>
              </div>
            </div>
          </div>

          {/* 우측: 공급자 정보 박스 */}
          <div className={styles.companyBox}>
            <table className={styles.companyTable}>
              <tbody>
                <tr>
                  <td>사업자등록번호</td>
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
                  <td>사업장 주소</td>
                  <td>{company.address}</td>
                </tr>
                <tr>
                  <td>업태</td>
                  <td>{company.businessType}</td>
                </tr>
                <tr>
                  <td>종목</td>
                  <td>{company.businessCategory}</td>
                </tr>
              </tbody>
            </table>

            {/* 도장 이미지 */}
            {company.sealImage && (
              <div className={styles.companySeal}>
                <Image
                  src={company.sealImage}
                  alt="회사 도장"
                  width={100}
                  height={100}
                  className="mx-auto"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 품목 테이블 */}
      <table className={styles.itemsTable}>
        <thead>
          <tr>
            <th style={{ width: '50px' }}>순번</th>
            <th style={{ width: '200px' }}>품목명</th>
            <th style={{ width: '220px' }}>규격</th>
            <th style={{ width: '60px' }}>수량</th>
            <th style={{ width: '100px' }}>단가</th>
            <th style={{ width: '110px' }}>공급가액</th>
            <th style={{ width: '90px' }}>세액</th>
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

          {/* 합계 행 */}
          <tr className={styles.totalRow}>
            <td colSpan={5} className={styles.textRight}>합계</td>
            <td className={styles.textRight}>{formatNumber(totalSupplyPrice)}</td>
            <td className={styles.textRight}>{formatNumber(totalTaxAmount)}</td>
          </tr>
        </tbody>
      </table>

      {/* 총 합계 박스 */}
      <div className={styles.summarySection}>
        <div className={styles.summaryBox}>
          <table className={styles.summaryTable}>
            <tbody>
              <tr>
                <td>공급가액</td>
                <td>{formatCurrency(totalSupplyPrice)}</td>
              </tr>
              <tr>
                <td>부가세 (10%)</td>
                <td>{formatCurrency(totalTaxAmount)}</td>
              </tr>
              <tr>
                <td>총 합계</td>
                <td className={styles.grandTotal}>{formatCurrency(totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 하단 문구 */}
      <div className={styles.footer}>
        <p className={styles.footerText}>위와 같이 견적합니다.</p>
        <p className={styles.companyName}>{company.name}</p>
      </div>
    </div>
  )
}
