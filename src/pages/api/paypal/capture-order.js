import { pool } from "../../../lib/db";
import { capturePayPalOrder } from "../../../lib/paypal";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { paypal_order_id } = req.body;
    
    if (!paypal_order_id) {
      return res.status(400).json({ message: '缺少PayPal订单ID' });
    }
    
    // 捕获订单
    const captureData = await capturePayPalOrder(paypal_order_id);
    
    // 从捕获数据中提取信息
    const transactionId = captureData.id; // PayPal交易ID
    
    // 尝试从不同位置获取custom_id
    let customId;
    try {
      // 1. 首先尝试从purchase_units[0].custom_id获取
      if (captureData.purchase_units && 
          captureData.purchase_units[0] && 
          captureData.purchase_units[0].custom_id) {
        customId = captureData.purchase_units[0].custom_id;
      } 
      // 2. 如果上面失败，从payments.captures[0].custom_id获取
      else if (captureData.purchase_units && 
               captureData.purchase_units[0] && 
               captureData.purchase_units[0].payments && 
               captureData.purchase_units[0].payments.captures && 
               captureData.purchase_units[0].payments.captures[0] &&
               captureData.purchase_units[0].payments.captures[0].custom_id) {
        customId = captureData.purchase_units[0].payments.captures[0].custom_id;
      }
      // 3. 如果仍然没有，从reference_id获取(有些PayPal版本使用此字段)
      else if (captureData.purchase_units && 
               captureData.purchase_units[0] && 
               captureData.purchase_units[0].reference_id) {
        customId = captureData.purchase_units[0].reference_id;
      }
      // 4. 如果实在找不到，则从localStorage中获取
      else {
        // 不做任何操作，将由前端处理
        console.log("无法从PayPal响应中提取本地订单ID，将由前端提供");
      }
    } catch (err) {
      console.error("提取本地订单ID时出错:", err);
    }
    
    // 记录响应详情，方便调试
    console.log("PayPal捕获响应:", JSON.stringify(captureData, null, 2));
    
    const paymentStatus = captureData.status; // 支付状态
    
    console.log(`捕获成功 - 交易ID: ${transactionId}, 本地订单ID: ${customId}, 状态: ${paymentStatus}`);
    
    // 确保支付状态为COMPLETED
    if (paymentStatus !== 'COMPLETED') {
      console.warn(`订单支付未完成，状态为: ${paymentStatus}`);
      return res.status(400).json({ 
        success: false, 
        message: `支付未完成，状态为: ${paymentStatus}` 
      });
    }
    
    // 如果前端传递了本地订单ID，使用前端提供的值
    if (!customId && req.body.order_id) {
      customId = req.body.order_id;
      console.log(`使用前端提供的本地订单ID: ${customId}`);
    }
    
    // 如果找不到订单ID，仍然返回成功，但标记需要处理
    if (!customId) {
      console.warn("未找到本地订单ID，但捕获成功");
      return res.status(200).json({
        success: true,
        transaction_id: transactionId,
        status: paymentStatus,
        requires_order_id: true
      });
    }
    
    // 尝试更新数据库订单状态，但不阻止流程
    let dbUpdateSuccess = false;
    try {
      // 直接更新user_study_resources表中的记录
      const [result] = await pool.query(
        'UPDATE user_study_resources SET status = ?, transaction_id = ? WHERE order_id = ?',
        ['PAID', transactionId, customId]
      );
      
      if (result.affectedRows === 0) {
        console.warn(`未找到本地订单ID对应的记录: ${customId}`);
        // 将在checkout API中创建记录，这里不返回错误
      } else {
        console.log(`成功更新订单 ${customId} 的状态为已支付，更新了 ${result.affectedRows} 条记录`);
        dbUpdateSuccess = true;
      }
    } catch (dbError) {
      console.error('更新订单状态失败，但继续处理:', dbError);
      // 不因数据库更新失败而中断流程
    }
    
    // 不管数据库更新是否成功，都返回成功
    return res.status(200).json({
      success: true,
      order_id: customId,
      transaction_id: transactionId,
      status: paymentStatus,
      db_updated: dbUpdateSuccess
    });
  } catch (error) {
    console.error('捕获订单时出错:', error);
    return res.status(500).json({ 
      success: false, 
      message: '捕获订单处理失败', 
      error: error.message 
    });
  }
} 