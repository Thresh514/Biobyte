module.exports = {
    siteUrl: 'https://www.biobyte.shop',
    generateRobotsTxt: true, // 自动生成 robots.txt
    changefreq: 'weekly',
    priority: 0.7,
    sitemapSize: 5000,
    // 排除不应该被索引的页面
    exclude: [
        '/cart',
        '/checkout',
        '/dashboard',
        '/faq',
        '/forgot-password',
        '/login',
        '/order-success',
        '/privacy',
        '/register',
        '/reset-password',
        '/terms',
        '/unit/*',  // 动态路由
        '/view/*',  // 动态路由
    ],
};  