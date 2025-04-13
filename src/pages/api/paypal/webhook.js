import { pool } from "../../../lib/db";
import { validatePayPalWebhook } from "../../../lib/paypal";

export default async function handler(req, res) {
  // 只接受 POST 请求
  if (req.method !== "POST") {
    return res.status(405).json({ message: "方法不允许" });
  }

  try {
    // 解析请求体
    const event = req.body;
    console.log("收到 PayPal Webhook 事件:", event.event_type);

    // 验证webhook事件
    if (!validatePayPalWebhook(event)) {
      console.error("无效的 PayPal Webhook 事件");
      return res.status(400).json({ message: "无效的 Webhook 事件" });
    }

    // 检查是否是支付完成事件
    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      // 提取必要的支付信息
      const paymentData = event.resource;
      const customId = paymentData.custom_id; // 我们的本地订单号
      const transactionId = paymentData.id; // PayPal 的交易号

      console.log(`处理支付完成事件 - 订单号: ${customId}, 交易号: ${transactionId}`);

      // 验证订单号是否存在
      if (!customId) {
        console.warn("PayPal 回调缺少 custom_id，无法更新订单");
        return res.status(200).json({ message: "缺少订单标识，但接受回调" });
      }

      // 连接数据库并更新订单状态
      try {
        // 更新user_study_resources表中所有与该订单ID相关的记录
        const [result] = await pool.query(
          "UPDATE user_study_resources SET status = ?, transaction_id = ? WHERE order_id = ?",
          ['PAID', transactionId, customId]
        );

        // 检查是否更新了任何行
        if (result.affectedRows === 0) {
          console.warn(`未找到订单号 ${customId} 对应的记录`);
        } else {
          console.log(`成功更新订单 ${customId} 的状态为已支付，更新了 ${result.affectedRows} 条记录`);
        }
      } catch (dbError) {
        console.error("数据库更新失败:", dbError);
        // 即使数据库更新失败，仍返回 200 以通知 PayPal 我们已收到请求
        // 这样可以避免 PayPal 重复发送同一事件
      }
    } else {
      console.log(`忽略非支付完成事件: ${event.event_type}`);
    }

    // 始终返回 200 表示我们已接收到事件
    return res.status(200).json({ message: "Webhook 处理成功" });
  } catch (error) {
    console.error("PayPal Webhook 处理错误:", error);
    // 返回 200 以告知 PayPal 我们已收到请求
    // 避免重复发送同一事件
    return res.status(200).json({ message: "Webhook 已接收，但处理过程中出错" });
  }
} 