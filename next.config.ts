import type { NextConfig } from 'next'

const corsHeaders = [
  { key: 'Access-Control-Allow-Origin', value: '*' },
  { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
  { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/api/query',
        headers: corsHeaders,
      },
    ]
  },
}

export default nextConfig