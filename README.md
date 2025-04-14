# PayPal 支付系统集成

本项目实现了完整的 PayPal 支付流程，包括：

- 创建订单
- 捕获支付
- 处理 Webhook 事件

## 环境配置

1. 复制 `.env.local.example` 为 `.env.local` 并填入相关配置：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=yourdb

# PayPal API 配置
PAYPAL_CLIENT_ID=你的PayPal客户端ID
PAYPAL_SECRET=你的PayPal密钥

# 应用URL配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 数据库设置

创建 `orders` 表：

```sql
CREATE TABLE orders (
  order_id VARCHAR(50) PRIMARY KEY,
  status ENUM('PENDING', 'PAID') DEFAULT 'PENDING',
  transaction_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API 端点

### 1. 创建订单

**端点：** `/api/paypal/create-order`

**请求方法：** POST

**请求参数：**
```json
{
  "amount": 10.99,
  "order_id": "optional_custom_id" 
}
```

**响应：**
```json
{
  "success": true,
  "order_id": "order_123456789",
  "paypal_order_id": "5O190127TN364715T",
  "approval_url": "https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T"
}
```

### 2. 捕获支付

**端点：** `/api/paypal/capture-order`

**请求方法：** POST

**请求参数：**
```json
{
  "paypal_order_id": "5O190127TN364715T"
}
```

**响应：**
```json
{
  "success": true,
  "order_id": "order_123456789",
  "transaction_id": "9TP43732WN775710N", 
  "status": "COMPLETED"
}
```

### 3. Webhook 处理

**端点：** `/api/paypal/webhook`

用于接收 PayPal 发送的支付事件，配置在 PayPal 开发者平台的 Webhook 设置中。

## 前端集成示例

```javascript
// 创建订单
async function createOrder() {
  const response = await fetch('/api/paypal/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 10.99 })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // 重定向到 PayPal 付款页面
    window.location.href = data.approval_url;
  }
}

// 捕获支付 (通常在用户从 PayPal 返回后进行)
async function capturePayment(paypalOrderId) {
  const response = await fetch('/api/paypal/capture-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paypal_order_id: paypalOrderId })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // 支付成功，显示成功信息
  }
}
```

## 安全注意事项

1. 确保所有敏感配置存储在环境变量中
2. 在生产环境中使用 HTTPS
3. 考虑添加 Webhook 签名验证以增强安全性
