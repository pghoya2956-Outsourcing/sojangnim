export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">소장님</h3>
            <p className="text-sm text-gray-400">
              전문 공구 및 산업용품 카탈로그
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">바로가기</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/products" className="hover:text-white transition-colors">
                  제품 카탈로그
                </a>
              </li>
              <li>
                <a href="/cart" className="hover:text-white transition-colors">
                  장바구니
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">고객지원</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-400">견적서 출력용 카탈로그 사이트</li>
              <li className="text-gray-400">제품 문의 환영합니다</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} 소장님. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
