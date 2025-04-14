/**
 * PayPal API 工具函数库
 * 用于处理PayPal API请求的通用功能
 */

// 确定使用的API环境（沙盒或生产环境）
const API_BASE = process.env.NODE_ENV === 'development' 
  ? 'https://api-m.sandbox.paypal.com' 
  : 'https://api-m.paypal.com';

// 获取PayPal API访问令牌
export async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing PayPal API credentials, please check environment variables');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  try {
    const response = await fetch(`${API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to get PayPal access token: ${data.error_description}`);
    }
    
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw error;
  }
}

// 创建PayPal订单
export async function createPayPalOrder(amount, customId) {
  const accessToken = await getPayPalAccessToken();
  
  try {
    const response = await fetch(`${API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: amount.toFixed(2)
          },
          custom_id: customId
        }],
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order-success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart`
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to create PayPal order: ${JSON.stringify(data)}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw error;
  }
}

// 捕获PayPal订单支付
export async function capturePayPalOrder(orderId) {
  const accessToken = await getPayPalAccessToken();
  
  try {
    const response = await fetch(`${API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to capture PayPal order: ${JSON.stringify(data)}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    throw error;
  }
}

// 验证PayPal Webhook事件
export function validatePayPalWebhook(event) {
  // 简单验证，实际项目中可能需要更复杂的验证逻辑
  return event && event.event_type && event.resource;
}

// 生成唯一订单ID
export function generateOrderId() {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `order_${timestamp}_${randomPart}`;
} 