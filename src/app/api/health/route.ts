/**
 * Health Check API
 * Docker 컨테이너 헬스 체크용
 */

export async function GET() {
  return Response.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    },
    { status: 200 }
  )
}
