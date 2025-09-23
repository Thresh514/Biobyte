# PayPal Payment System Integration

This project implements a complete PayPal payment flow, including:

- Order creation
- Payment capture
- Webhook event handling

## Environment Setup

1. Copy .env.local.example to .env.local and fill in the required values:

```env
# Database configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=yourdb

# PayPal API configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret

# Application URL configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

```

## Database Setup

Create the `orders` table：

```sql
CREATE TABLE orders (
  order_id VARCHAR(50) PRIMARY KEY,
  status ENUM('PENDING', 'PAID') DEFAULT 'PENDING',
  transaction_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API Endpoints

### 1. Create Order

**Endpoint:** `/api/paypal/create-order`

**Method:** POST

**Request body:**
```json
{
  "amount": 10.99,
  "order_id": "optional_custom_id" 
}
```

**Response:**
```json
{
  "success": true,
  "order_id": "order_123456789",
  "paypal_order_id": "5O190127TN364715T",
  "approval_url": "https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T"
}
```

### 2. Capture Payment

**Endpoint：** `/api/paypal/capture-order`

**Method:** POST

**Request body:**
```json
{
  "paypal_order_id": "5O190127TN364715T"
}
```

**Response:**
```json
{
  "success": true,
  "order_id": "order_123456789",
  "transaction_id": "9TP43732WN775710N", 
  "status": "COMPLETED"
}
```

### 3. Webhook Handling

**Endpoint:** `/api/paypal/webhook`

This endpoint receives PayPal webhook events.
Make sure to configure it in the PayPal Developer Dashboard under Webhook Settings.

## Frontend Integration Example

```javascript
// Create order
async function createOrder() {
  const response = await fetch('/api/paypal/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 10.99 })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Redirect user to PayPal approval page
    window.location.href = data.approval_url;
  }
}

// Capture payment (typically after returning from PayPal)
async function capturePayment(paypalOrderId) {
  const response = await fetch('/api/paypal/capture-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paypal_order_id: paypalOrderId })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Payment completed, show success message
  }
}
```

## Security Considerations

1. Store all sensitive configurations in environment variables.
2. Always use HTTPS in production.
3. Implement Webhook signature verification to prevent spoofed events.
