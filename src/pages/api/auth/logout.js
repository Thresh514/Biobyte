export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // 清除cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', [
        'token=; HttpOnly; Path=/; Max-Age=0',
        'token_exp=; Path=/; Max-Age=0'
    ]);

    return res.status(200).json({ 
        success: true,
        message: 'Logged out successfully' 
    });
}