import { createPayPalOrder, generateOrderId } from "../../../lib/paypal";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { amount, order_id } = req.body;
    
    // 验证金额
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: '无效的订单金额' });
    }
    
    // 使用提供的order_id或生成新的
    const orderId = order_id || generateOrderId();
    
    // 不再写入orders表，直接创建PayPal订单
    console.log(`正在创建订单 ID: ${orderId}，金额: ${amount}`);
    
    // 创建PayPal订单
    const paypalOrder = await createPayPalOrder(parseFloat(amount), orderId);
    
    // 查找批准URL
    const approvalUrl = paypalOrder.links.find(link => link.rel === 'approve').href;
    
    return res.status(200).json({
      success: true,
      order_id: orderId,
      paypal_order_id: paypalOrder.id,
      approval_url: approvalUrl
    });
  } catch (error) {
    console.error('创建订单时出错:', error);
    return res.status(500).json({ message: '创建订单失败', error: error.message });
  }
}