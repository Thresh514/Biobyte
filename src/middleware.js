import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // 保护 /admin 页面路由
    if (pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
        return await handleAdminPageProtection(request);
    }

    // 保护 /api/admin/* API路由
    if (pathname.startsWith('/api/admin')) {
        return await handleAdminApiProtection(request);
    }

    return NextResponse.next();
}

// 保护admin页面
async function handleAdminPageProtection(request) {
    // 尝试多种方式获取token
    // 方式1: 从cookies对象获取（Next.js推荐方式）
    let token = request.cookies.get('token')?.value;
    
    // 方式2: 如果方式1失败，直接从cookie header解析（备用方案）
    const cookieHeader = request.headers.get('cookie') || '';
    if (!token && cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            if (key && value) acc[key] = decodeURIComponent(value);
            return acc;
        }, {});
        token = cookies.token;
    }
    
    // 调试信息
    const allCookies = Array.from(request.cookies.getAll()).map(c => ({ name: c.name, hasValue: !!c.value }));
    
    console.log('🔍 Middleware检查/admin:', {
        hasToken: !!token,
        tokenLength: token?.length,
        cookieHeaderPreview: cookieHeader.substring(0, 150),
        allCookies: allCookies,
        url: request.url,
        method: request.method
    });

    if (!token) {
        // 没有token，重定向到登录页面
        console.log('❌ Middleware: 没有token，重定向到登录页');
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    try {
        // 验证JWT token - 使用jose库（支持Edge Runtime）
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not set');
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
            return NextResponse.redirect(loginUrl);
        }
        
        // 使用TextEncoder编码secret（jose要求）
        const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
        
        // 验证token
        const { payload } = await jwtVerify(token, secretKey, {
            algorithms: ['HS256']
        });
        
        // 检查role是否为admin
        if (payload.role !== 'admin') {
            // 不是管理员，重定向到dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        
        // 是管理员，允许访问
        return NextResponse.next();
    } catch (error) {
        // Token无效或过期，重定向到登录页面
        console.error('Middleware token verification error:', error.message);
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }
}

// 保护admin API路由
async function handleAdminApiProtection(request) {
    // 优先从cookie获取token，如果没有则从Authorization header获取
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return NextResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        // 验证JWT token - 使用jose库（支持Edge Runtime）
        if (!process.env.JWT_SECRET) {
            return NextResponse.json(
                { message: 'JWT_SECRET is not configured' },
                { status: 500 }
            );
        }
        
        // 使用TextEncoder编码secret（jose要求）
        const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
        
        // 验证token
        const { payload } = await jwtVerify(token, secretKey, {
            algorithms: ['HS256']
        });
        
        // 检查role是否为admin
        if (payload.role !== 'admin') {
            return NextResponse.json(
                { message: 'Access denied. Admin role required.' },
                { status: 403 }
            );
        }
        
        // 将decoded token信息添加到请求头中，供API端点使用
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', payload.id?.toString() || '');
        requestHeaders.set('x-user-email', payload.email || '');
        requestHeaders.set('x-user-role', payload.role || '');

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    } catch (error) {
        console.error('Admin API protection error:', error.message);
        return NextResponse.json(
            { message: 'Invalid or expired token' },
            { status: 401 }
        );
    }
}

// 配置哪些路径需要运行middleware
export const config = {
    matcher: [
        '/admin/:path*',
        '/api/admin/:path*',
    ],
};