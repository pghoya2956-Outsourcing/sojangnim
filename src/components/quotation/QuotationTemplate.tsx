/**
 * 견적서 출력 템플릿
 * Phase 8: 견적서 출력 템플릿 구현
 */

import type { QuotationData } from '@/types/quotation'
import { formatNumber, formatCurrency } from '@/lib/quotation/generator'
import Image from 'next/image'

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
    <div className="quotation-template bg-white p-[15mm] min-h-[297mm] w-[210mm] mx-auto font-['Malgun_Gothic',sans-serif text-[11pt] leading-normal text-black">
      {/* 헤더: 제목 */}
      <div className="mb-8">
        <h1 className="text-[32pt] font-bold text-center mb-5 tracking-[8px]">견 적 서</h1>

        <div className="flex justify-between items-start mb-8">
          {/* 좌측: 수신자 및 메타 정보 */}
          <div className="flex-1 pr-5">
            {/* 수신자 */}
            <div className="mb-4">
              <span className="text-[16pt] font-bold">{recipient.name}</span>
              <span className="text-[16pt] ml-2">귀중</span>
            </div>

            {/* 메타 정보 */}
            <div className="text-[11pt] mt-5">
              <div className="mb-2">
                <span className="font-semibold inline-block w-[100px]">견적서 번호:</span>
                <span>{metadata.number}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold inline-block w-[100px]">작성일자:</span>
                <span>{metadata.date}</span>
              </div>
            </div>
          </div>

          {/* 우측: 공급자 정보 박스 */}
          <div className="border-2 border-black p-3 w-[340px]">
            <table className="w-full text-[10pt]">
              <tbody>
                <tr>
                  <td className="py-1 pr-2 font-semibold w-[110px] border-b border-gray-400">사업자등록번호</td>
                  <td className="py-1 border-b border-gray-400">{company.businessNumber}</td>
                </tr>
                <tr>
                  <td className="py-1 pr-2 font-semibold border-b border-gray-400">상호</td>
                  <td className="py-1 border-b border-gray-400">{company.name}</td>
                </tr>
                <tr>
                  <td className="py-1 pr-2 font-semibold border-b border-gray-400">대표자명</td>
                  <td className="py-1 border-b border-gray-400">{company.representative}</td>
                </tr>
                <tr>
                  <td className="py-1 pr-2 font-semibold border-b border-gray-400">사업장 주소</td>
                  <td className="py-1 border-b border-gray-400">{company.address}</td>
                </tr>
                <tr>
                  <td className="py-1 pr-2 font-semibold border-b border-gray-400">업태</td>
                  <td className="py-1 border-b border-gray-400">{company.businessType}</td>
                </tr>
                <tr>
                  <td className="py-1 pr-2 font-semibold">종목</td>
                  <td className="py-1">{company.businessCategory}</td>
                </tr>
              </tbody>
            </table>

            {/* 도장 이미지 */}
            {company.sealImage && (
              <div className="text-center mt-3 pt-3 border-t border-gray-300">
                <Image
                  src={company.sealImage}
                  alt="회사 도장"
                  width={80}
                  height={80}
                  className="mx-auto"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 품목 테이블 */}
      <table className="w-full border-collapse border-2 border-black mb-5">
        <thead>
          <tr className="bg-[#e8e8e8]">
            <th className="border border-gray-600 px-1.5 py-2.5 font-bold text-center text-[10pt] w-[50px]">순번</th>
            <th className="border border-gray-600 px-1.5 py-2.5 font-bold text-center text-[10pt] w-[200px]">품목명</th>
            <th className="border border-gray-600 px-1.5 py-2.5 font-bold text-center text-[10pt] w-[220px]">규격</th>
            <th className="border border-gray-600 px-1.5 py-2.5 font-bold text-center text-[10pt] w-[60px]">수량</th>
            <th className="border border-gray-600 px-1.5 py-2.5 font-bold text-center text-[10pt] w-[100px]">단가</th>
            <th className="border border-gray-600 px-1.5 py-2.5 font-bold text-center text-[10pt] w-[110px]">공급가액</th>
            <th className="border border-gray-600 px-1.5 py-2.5 font-bold text-center text-[10pt] w-[90px]">세액</th>
          </tr>
        </thead>
        <tbody>
          {/* 실제 품목 */}
          {items.map((item) => (
            <tr key={item.seq}>
              <td className="border border-gray-600 px-1.5 py-2 text-center text-[10pt]">{item.seq}</td>
              <td className="border border-gray-600 px-1.5 py-2 text-left text-[10pt]">{item.name}</td>
              <td className="border border-gray-600 px-1.5 py-2 text-left text-[9pt] text-gray-600">{item.spec}</td>
              <td className="border border-gray-600 px-1.5 py-2 text-center text-[10pt]">{item.quantity}</td>
              <td className="border border-gray-600 px-1.5 py-2 text-right pr-2.5 text-[10pt]">{formatNumber(item.unitPrice)}</td>
              <td className="border border-gray-600 px-1.5 py-2 text-right pr-2.5 text-[10pt]">{formatNumber(item.supplyPrice)}</td>
              <td className="border border-gray-600 px-1.5 py-2 text-right pr-2.5 text-[10pt]">{formatNumber(item.taxAmount)}</td>
            </tr>
          ))}

          {/* 빈 행 */}
          {emptyRows.map((_, index) => (
            <tr key={`empty-${index}`}>
              <td className="border border-gray-600 px-1.5 py-2 text-center text-[10pt]">&nbsp;</td>
              <td className="border border-gray-600 px-1.5 py-2 text-left text-[10pt]">&nbsp;</td>
              <td className="border border-gray-600 px-1.5 py-2 text-left text-[9pt]">&nbsp;</td>
              <td className="border border-gray-600 px-1.5 py-2 text-center text-[10pt]">&nbsp;</td>
              <td className="border border-gray-600 px-1.5 py-2 text-right text-[10pt]">&nbsp;</td>
              <td className="border border-gray-600 px-1.5 py-2 text-right text-[10pt]">&nbsp;</td>
              <td className="border border-gray-600 px-1.5 py-2 text-right text-[10pt]">&nbsp;</td>
            </tr>
          ))}

          {/* 합계 행 */}
          <tr className="bg-[#f0f0f0] font-bold">
            <td colSpan={5} className="border border-gray-600 px-1.5 py-3 text-right text-[10pt]">합계</td>
            <td className="border border-gray-600 px-1.5 py-3 text-right pr-2.5 text-[10pt]">{formatNumber(totalSupplyPrice)}</td>
            <td className="border border-gray-600 px-1.5 py-3 text-right pr-2.5 text-[10pt]">{formatNumber(totalTaxAmount)}</td>
          </tr>
        </tbody>
      </table>

      {/* 총 합계 박스 */}
      <div className="flex justify-end mb-10">
        <div className="border-2 border-black p-3 w-[320px]">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-2 font-semibold w-[140px] border-b border-gray-300">공급가액</td>
                <td className="py-2 text-right font-bold border-b border-gray-300">{formatCurrency(totalSupplyPrice)}</td>
              </tr>
              <tr>
                <td className="py-2 font-semibold border-b border-gray-300">부가세 (10%)</td>
                <td className="py-2 text-right font-bold border-b border-gray-300">{formatCurrency(totalTaxAmount)}</td>
              </tr>
              <tr>
                <td className="pt-3 font-semibold text-[13pt]">총 합계</td>
                <td className="pt-3 text-right font-bold text-[15pt]">{formatCurrency(totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 하단 문구 */}
      <div className="text-center mt-[60px] text-[11pt]">
        <p className="mb-5">위와 같이 견적합니다.</p>
        <p className="font-bold text-[12pt]">{company.name}</p>
      </div>
    </div>
  )
}
