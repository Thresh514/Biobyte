/** @type {import('next').NextConfig} */
const nextConfig = {
  // 确保只使用一种数据获取方式
  reactStrictMode: true,
  
  // 优化图片处理
  images: {
    domains: [],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // 添加跨域资源共享配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
  
  // 优化编译性能
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 提高构建性能
  experimental: {
    // 并行构建
    cpus: Math.max(1, (require('os').cpus().length / 2)),
  }
};

module.exports = nextConfig;
