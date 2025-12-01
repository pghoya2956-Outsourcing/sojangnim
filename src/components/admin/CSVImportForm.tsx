'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  slug: string
}

interface ParsedProduct {
  name: string
  description: string
  price: number
  category_slug: string
  badge: string
  image_url: string
  valid: boolean
  errors: string[]
}

export default function CSVImportForm() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase.from('categories').select('*').order('name')
      if (data) setCategories(data)
    }
    loadCategories()
  }, [])

  const parseCSV = (text: string): ParsedProduct[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim())
    const products: ParsedProduct[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      const row: Record<string, string> = {}
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || ''
      })

      const errors: string[] = []

      // Validate required fields
      if (!row.name) errors.push('제품명 필수')
      const price = parseInt(row.price, 10)
      if (!row.price || isNaN(price) || price < 0) errors.push('유효한 가격 필요')

      // Validate category
      if (row.category_slug) {
        const categoryExists = categories.some(c => c.slug === row.category_slug)
        if (!categoryExists) errors.push(`카테고리 "${row.category_slug}" 없음`)
      }

      // Validate badge
      const validBadges = ['신제품', '베스트', '프리미엄', '할인', '']
      if (row.badge && !validBadges.includes(row.badge)) {
        errors.push(`유효하지 않은 배지: ${row.badge}`)
      }

      products.push({
        name: row.name || '',
        description: row.description || '',
        price: isNaN(price) ? 0 : price,
        category_slug: row.category_slug || '',
        badge: row.badge || '',
        image_url: row.image_url || '',
        valid: errors.length === 0,
        errors,
      })
    }

    return products
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    result.push(current)
    return result
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setLoading(true)

    try {
      const text = await selectedFile.text()
      const parsed = parseCSV(text)
      setParsedData(parsed)
    } catch (error) {
      toast.error('CSV 파일을 읽는 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    const validProducts = parsedData.filter(p => p.valid)
    if (validProducts.length === 0) {
      toast.error('등록할 수 있는 유효한 제품이 없습니다')
      return
    }

    setImporting(true)

    try {
      // Category slug -> ID mapping
      const categoryMap = new Map<string, string>()
      categories.forEach(cat => {
        categoryMap.set(cat.slug, cat.id)
      })

      const productsToInsert = validProducts.map(p => ({
        name: p.name,
        description: p.description || null,
        price: p.price,
        category_id: p.category_slug ? categoryMap.get(p.category_slug) || null : null,
        badge: p.badge || null,
        image_url: p.image_url || null,
      }))

      const { error } = await supabase.from('products').insert(productsToInsert)

      if (error) {
        toast.error('제품 등록 실패: ' + error.message)
        return
      }

      toast.success(`${validProducts.length}개 제품이 등록되었습니다`)
      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      toast.error('제품 등록 중 오류가 발생했습니다')
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const headers = 'name,description,price,category_slug,badge,image_url'
    const example = '충전식 드릴,20V 배터리 포함,150000,power-tools,신제품,https://example.com/image.jpg'
    const content = `${headers}\n${example}`

    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'products-template.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const validCount = parsedData.filter(p => p.valid).length
  const invalidCount = parsedData.filter(p => !p.valid).length

  return (
    <div className="space-y-6">
      {/* Template Download */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-[#1a1a1a] mb-3">1. 템플릿 다운로드</h3>
        <p className="text-sm text-gray-600 mb-4">
          아래 버튼을 클릭하여 CSV 템플릿을 다운로드하세요.
        </p>
        <button
          onClick={downloadTemplate}
          className="bg-gray-100 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          템플릿 다운로드
        </button>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-[#1a1a1a] mb-3">2. CSV 파일 업로드</h3>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-800"
        />
        <p className="mt-2 text-xs text-gray-500">
          UTF-8 인코딩된 CSV 파일만 지원합니다.
        </p>
      </div>

      {/* Preview */}
      {loading && (
        <div className="text-center py-8 text-gray-500">파일을 분석 중...</div>
      )}

      {parsedData.length > 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-[#1a1a1a] mb-3">3. 미리보기</h3>

          <div className="flex gap-4 mb-4">
            <span className="text-sm">
              <span className="text-green-600 font-semibold">{validCount}개</span> 등록 가능
            </span>
            {invalidCount > 0 && (
              <span className="text-sm">
                <span className="text-red-600 font-semibold">{invalidCount}개</span> 오류
              </span>
            )}
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">상태</th>
                  <th className="px-3 py-2 text-left">제품명</th>
                  <th className="px-3 py-2 text-left">가격</th>
                  <th className="px-3 py-2 text-left">카테고리</th>
                  <th className="px-3 py-2 text-left">배지</th>
                  <th className="px-3 py-2 text-left">오류</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {parsedData.map((product, index) => (
                  <tr key={index} className={product.valid ? '' : 'bg-red-50'}>
                    <td className="px-3 py-2">
                      {product.valid ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-red-600">✕</span>
                      )}
                    </td>
                    <td className="px-3 py-2">{product.name || '-'}</td>
                    <td className="px-3 py-2">{product.price.toLocaleString()}원</td>
                    <td className="px-3 py-2">{product.category_slug || '-'}</td>
                    <td className="px-3 py-2">{product.badge || '-'}</td>
                    <td className="px-3 py-2 text-red-600 text-xs">
                      {product.errors.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {validCount > 0 && (
            <button
              onClick={handleImport}
              disabled={importing}
              className="mt-4 w-full bg-[#1a1a1a] text-white px-6 py-3 rounded-md hover:bg-black transition-colors font-semibold disabled:opacity-50"
            >
              {importing ? '등록 중...' : `${validCount}개 제품 등록하기`}
            </button>
          )}
        </div>
      )}

      {/* Category Reference */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">사용 가능한 카테고리 슬러그:</h4>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <code key={cat.id} className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">
              {cat.slug}
            </code>
          ))}
        </div>
      </div>
    </div>
  )
}
