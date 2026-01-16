import { pool } from './db';

/**
 * 检查用户是否有权限访问资源
 * @param {number|null} userId - 用户ID，如果为null表示未登录
 * @param {number} resourceId - 资源ID
 * @returns {Promise<boolean>} - 是否有权限访问
 */
export async function checkResourceAccess(userId, resourceId) {
  try {
    // 1. 获取资源信息
    const [resources] = await pool.query(
      'SELECT price FROM study_resources WHERE id = $1',
      [resourceId]
    );

    if (resources.length === 0) {
      return false; // 资源不存在
    }

    const resource = resources[0];
    const price = parseFloat(resource.price);

    // 2. 根据价格判断权限类型
    if (price === 0.00) {
      // 免费资源：只需检查用户是否登录
      return userId !== null;
    }

    if (price === -1.00) {
      // 会员资源：检查会员状态
      if (!userId) {
        return false; // 未登录用户无法访问会员资源
      }
      const membership = await checkMembership(userId);
      return membership !== null && membership.status === 'active';
    }

    if (price > 0.00) {
      // 付费资源：检查订单
      if (!userId) {
        return false; // 未登录用户无法访问付费资源
      }
      const hasOrder = await checkPaidOrder(userId, resourceId);
      return hasOrder;
    }

    return false;
  } catch (error) {
    console.error('Error checking resource access:', error);
    return false;
  }
}

/**
 * 检查用户是否有有效的会员权限
 * @param {number} userId - 用户ID
 * @returns {Promise<Object|null>} - 会员信息，如果没有有效会员则返回null
 */
export async function checkMembership(userId) {
  try {
    const [memberships] = await pool.query(
      `SELECT * FROM membership 
       WHERE user_id = $1 
         AND status = 'active' 
         AND (expire_date IS NULL OR expire_date > NOW())`,
      [userId]
    );

    if (memberships.length === 0) {
      return null;
    }

    return memberships[0];
  } catch (error) {
    console.error('Error checking membership:', error);
    return null;
  }
}

/**
 * 检查用户是否已购买指定资源
 * @param {number} userId - 用户ID
 * @param {number} resourceId - 资源ID
 * @returns {Promise<boolean>} - 是否已购买
 */
export async function checkPaidOrder(userId, resourceId) {
  try {
    const [results] = await pool.query(
      `SELECT COUNT(*) as count FROM order_items oi
       JOIN orders o ON oi.order_id = o.order_id
       WHERE oi.study_resource_id = $1
         AND o.user_id = $2
         AND o.status = 'PAID'`,
      [resourceId, userId]
    );

    // PostgreSQL 的 COUNT 返回字符串，需要转换为数字
    return parseInt(results[0].count, 10) > 0;
  } catch (error) {
    console.error('Error checking paid order:', error);
    return false;
  }
}

/**
 * 创建订单
 * @param {Object} orderData - 订单数据
 * @param {string} orderData.order_id - 订单号
 * @param {number|null} orderData.user_id - 用户ID（可为null）
 * @param {string} orderData.user_email - 用户邮箱
 * @param {string} orderData.user_name - 用户姓名
 * @param {number} orderData.total_price - 总价
 * @param {string} orderData.payment_method - 支付方式
 * @returns {Promise<Object>} - 创建的订单信息
 */
export async function createOrder(orderData) {
  try {
    const {
      order_id,
      user_id,
      user_email,
      user_name,
      total_price,
      payment_method = 'paypal'
    } = orderData;

    const [result] = await pool.query(
      `INSERT INTO orders (order_id, user_id, user_email, user_name, total_price, payment_method, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
       RETURNING *`,
      [order_id, user_id, user_email, user_name, total_price, payment_method]
    );

    return result[0];
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * 添加订单明细
 * @param {Object} itemData - 订单明细数据
 * @param {string} itemData.order_id - 订单号
 * @param {number} itemData.study_resource_id - 资源ID
 * @param {number} itemData.quantity - 数量
 * @param {number} itemData.unit_price - 单价
 * @param {number} itemData.total_price - 总价
 * @returns {Promise<Object>} - 创建的订单明细信息
 */
export async function createOrderItem(itemData) {
  try {
    const {
      order_id,
      study_resource_id,
      quantity = 1,
      unit_price,
      total_price
    } = itemData;

    const [result] = await pool.query(
      `INSERT INTO order_items (order_id, study_resource_id, quantity, unit_price, total_price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [order_id, study_resource_id, quantity, unit_price, total_price]
    );

    return result[0];
  } catch (error) {
    console.error('Error creating order item:', error);
    throw error;
  }
}

/**
 * 更新订单状态为已支付
 * @param {string} order_id - 订单号
 * @param {string} transaction_id - 交易ID
 * @returns {Promise<Object>} - 更新后的订单信息
 */
export async function updateOrderToPaid(order_id, transaction_id) {
  try {
    const [result] = await pool.query(
      `UPDATE orders 
       SET status = 'PAID', transaction_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE order_id = $2
       RETURNING *`,
      [transaction_id, order_id]
    );

    if (result.length === 0) {
      throw new Error('Order not found');
    }

    return result[0];
  } catch (error) {
    console.error('Error updating order to paid:', error);
    throw error;
  }
}

/**
 * 获取用户的订单列表
 * @param {number} userId - 用户ID
 * @param {Object} options - 查询选项
 * @param {number} options.limit - 限制数量
 * @param {number} options.offset - 偏移量
 * @returns {Promise<Array>} - 订单列表
 */
export async function getUserOrders(userId, options = {}) {
  try {
    const { limit = 50, offset = 0 } = options;

    const [orders] = await pool.query(
      `SELECT 
        o.id,
        o.order_id,
        o.user_id,
        o.user_email,
        o.user_name,
        o.total_price,
        o.status,
        o.payment_method,
        o.transaction_id,
        o.created_at,
        o.updated_at,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', oi.id,
            'study_resource_id', oi.study_resource_id,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'total_price', oi.total_price,
            'title', sr.title,
            'type', sr.type,
            'level', sr.level,
            'chapter', sr.chapter
          )
        ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.order_id = oi.order_id
       LEFT JOIN study_resources sr ON oi.study_resource_id = sr.id
       WHERE o.user_id = $1
       GROUP BY o.id, o.order_id, o.user_id, o.user_email, o.user_name, 
                o.total_price, o.status, o.payment_method, o.transaction_id, 
                o.created_at, o.updated_at
       ORDER BY o.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return orders;
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
}

/**
 * 获取用户已购买的资源ID列表
 * @param {number} userId - 用户ID
 * @returns {Promise<Array<number>>} - 资源ID列表
 */
export async function getUserPurchasedResources(userId) {
  try {
    const [results] = await pool.query(
      `SELECT DISTINCT oi.study_resource_id
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.order_id
       WHERE o.user_id = $1 AND o.status = 'PAID'`,
      [userId]
    );

    return results.map(row => row.study_resource_id);
  } catch (error) {
    console.error('Error getting user purchased resources:', error);
    return [];
  }
}

/**
 * 获取资源信息
 * @param {number} resourceId - 资源ID
 * @returns {Promise<Object|null>} - 资源信息
 */
export async function getResource(resourceId) {
  try {
    const [resources] = await pool.query(
      'SELECT * FROM study_resources WHERE id = $1',
      [resourceId]
    );

    if (resources.length === 0) {
      return null;
    }

    return resources[0];
  } catch (error) {
    console.error('Error getting resource:', error);
    return null;
  }
}

/**
 * 批量检查用户对多个资源的访问权限
 * @param {number|null} userId - 用户ID
 * @param {Array<number>} resourceIds - 资源ID列表
 * @returns {Promise<Object>} - 权限映射对象 {resourceId: hasAccess}
 */
export async function batchCheckResourceAccess(userId, resourceIds) {
  if (resourceIds.length === 0) {
    return {};
  }

  try {
    // 获取所有资源信息
    const placeholders = resourceIds.map((_, i) => `$${i + 1}`).join(',');
    const [resources] = await pool.query(
      `SELECT id, price FROM study_resources WHERE id IN (${placeholders})`,
      resourceIds
    );

    const accessMap = {};
    const freeResources = [];
    const memberResources = [];
    const paidResources = [];

    // 分类资源
    resources.forEach(resource => {
      const price = parseFloat(resource.price);
      if (price === 0.00) {
        freeResources.push(resource.id);
        accessMap[resource.id] = userId !== null; // 免费资源只需登录
      } else if (price === -1.00) {
        memberResources.push(resource.id);
      } else if (price > 0.00) {
        paidResources.push(resource.id);
      }
    });

    // 批量检查会员权限
    if (memberResources.length > 0 && userId) {
      const membership = await checkMembership(userId);
      const hasMembership = membership !== null && membership.status === 'active';
      memberResources.forEach(id => {
        accessMap[id] = hasMembership;
      });
    } else {
      memberResources.forEach(id => {
        accessMap[id] = false;
      });
    }

    // 批量检查付费资源
    if (paidResources.length > 0 && userId) {
      const placeholders = paidResources.map((_, i) => `$${i + 1}`).join(',');
      const userIdParam = `$${paidResources.length + 1}`;
      const [results] = await pool.query(
        `SELECT DISTINCT oi.study_resource_id
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.order_id
         WHERE oi.study_resource_id IN (${placeholders})
           AND o.user_id = ${userIdParam}
           AND o.status = 'PAID'`,
        [...paidResources, userId]
      );

      const purchasedIds = new Set(results.map(row => row.study_resource_id));
      paidResources.forEach(id => {
        accessMap[id] = purchasedIds.has(id);
      });
    } else {
      paidResources.forEach(id => {
        accessMap[id] = false;
      });
    }

    return accessMap;
  } catch (error) {
    console.error('Error batch checking resource access:', error);
    // 返回所有false
    return resourceIds.reduce((acc, id) => {
      acc[id] = false;
      return acc;
    }, {});
  }
}

// ==================== 用户相关方法 ====================

/**
 * 根据邮箱获取用户
 * @param {string} email - 用户邮箱
 * @returns {Promise<Object|null>} - 用户信息
 */
export async function getUserByEmail(email) {
  try {
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

/**
 * 根据ID获取用户
 * @param {number} userId - 用户ID
 * @returns {Promise<Object|null>} - 用户信息
 */
export async function getUserById(userId) {
  try {
    const [users] = await pool.query(
      'SELECT id, email, role, name, created_at FROM users WHERE id = $1',
      [userId]
    );
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error getting user by id:', error);
    return null;
  }
}

/**
 * 创建新用户
 * @param {Object} userData - 用户数据
 * @param {string} userData.email - 邮箱
 * @param {string} userData.password_hash - 密码哈希
 * @param {string} userData.role - 角色，默认为 'member'
 * @returns {Promise<Object>} - 创建的用户信息
 */
export async function createUser(userData) {
  try {
    const { email, password_hash, role = 'member' } = userData;
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
      [email, password_hash, role]
    );
    return result[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * 更新用户密码
 * @param {string} email - 用户邮箱
 * @param {string} password_hash - 新密码哈希
 * @returns {Promise<boolean>} - 是否更新成功
 */
export async function updateUserPassword(email, password_hash) {
  try {
    const [result] = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id',
      [password_hash, email]
    );
    return result.length > 0;
  } catch (error) {
    console.error('Error updating user password:', error);
    return false;
  }
}

/**
 * 设置用户密码重置令牌
 * @param {string} email - 用户邮箱
 * @param {string} token - 重置令牌
 * @param {Date|null} expires - 过期时间，如果为null则使用数据库计算（NOW() + 1小时）
 * @returns {Promise<boolean>} - 是否设置成功
 */
export async function setUserResetToken(email, token, expires = null) {
  try {
    // 如果 expires 为 null，使用数据库的 NOW() + 1小时来计算，确保时区一致
    if (expires === null) {
      const [result] = await pool.query(
        `UPDATE users 
         SET reset_token = $1, reset_expires = NOW() + INTERVAL '1 hour' 
         WHERE email = $2 
         RETURNING id`,
        [token, email]
      );
      return result.length > 0;
    } else {
      // 如果提供了 expires，使用提供的值
      const [result] = await pool.query(
        'UPDATE users SET reset_token = $1, reset_expires = $2 WHERE email = $3 RETURNING id',
        [token, expires, email]
      );
      return result.length > 0;
    }
  } catch (error) {
    console.error('Error setting reset token:', error);
    return false;
  }
}

/**
 * 根据重置令牌获取用户
 * @param {string} token - 重置令牌
 * @returns {Promise<Object|null>} - 用户信息
 */
export async function getUserByResetToken(token) {
  try {
    const [users] = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_expires > NOW()',
      [token]
    );
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Error getting user by reset token:', error);
    return null;
  }
}

// ==================== 验证码相关方法 ====================

/**
 * 获取验证码
 * @param {string} email - 邮箱
 * @returns {Promise<Object|null>} - 验证码信息
 */
export async function getVerificationCode(email) {
  try {
    const [codes] = await pool.query(
      'SELECT * FROM verification_codes WHERE email = $1',
      [email]
    );
    return codes.length > 0 ? codes[0] : null;
  } catch (error) {
    console.error('Error getting verification code:', error);
    return null;
  }
}

/**
 * 检查验证码发送频率限制
 * @param {string} email - 邮箱
 * @param {number} cooldownSeconds - 冷却时间（秒），默认60秒
 * @returns {Promise<{allowed: boolean, remainingSeconds?: number}>} - 是否允许发送及剩余秒数
 */
export async function checkVerificationCodeRateLimit(email, cooldownSeconds = 60) {
  try {
    // 使用数据库的 NOW() 直接计算时间差，确保时区一致
    // 因为 created_at 也是用 NOW() 存储的，所以时区一致
    const [result] = await pool.query(
      `SELECT 
        created_at,
        EXTRACT(EPOCH FROM (NOW() - created_at)) as seconds_since_created
       FROM verification_codes 
       WHERE email = $1`,
      [email]
    );
    
    if (result.length === 0) {
      return { allowed: true };
    }
    
    const secondsSinceCreated = parseFloat(result[0].seconds_since_created);
    
    // 如果时间差是负数（数据库时间问题），允许发送
    if (secondsSinceCreated < 0) {
      console.warn('Warning: created_at is in the future. Allowing code send.', {
        email,
        secondsSinceCreated,
        created_at: result[0].created_at
      });
      return { allowed: true };
    }
    
    // 如果距离上次发送不足冷却时间，不允许发送
    if (secondsSinceCreated < cooldownSeconds) {
      const remainingSeconds = Math.ceil(cooldownSeconds - secondsSinceCreated);
      return { 
        allowed: false, 
        remainingSeconds: Math.max(1, remainingSeconds)
      };
    }
    
    return { allowed: true };
  } catch (error) {
    console.error('Error checking verification code rate limit:', error);
    // 出错时允许发送，避免阻塞用户
    return { allowed: true };
  }
}

/**
 * 创建或更新验证码
 * @param {string} email - 邮箱
 * @param {string} code - 验证码
 * @param {Date} expires_at - 过期时间
 * @returns {Promise<boolean>} - 是否成功
 */
export async function upsertVerificationCode(email, code, expires_at) {
  try {
    // 如果 expires_at 为 null，使用数据库的 NOW() + 10分钟来计算，确保时区一致
    // 这样可以避免应用层和数据库层时区不一致的问题
    if (expires_at === null) {
      await pool.query(
        `INSERT INTO verification_codes (email, code, expires_at, created_at)
         VALUES ($1, $2, NOW() + INTERVAL '10 minutes', NOW())
         ON CONFLICT (email) 
         DO UPDATE SET code = $2, expires_at = NOW() + INTERVAL '10 minutes', created_at = NOW()`,
        [email, code]
      );
    } else {
      // 如果提供了 expires_at，使用提供的值
      await pool.query(
        `INSERT INTO verification_codes (email, code, expires_at, created_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (email) 
         DO UPDATE SET code = $2, expires_at = $3, created_at = NOW()`,
        [email, code, expires_at]
      );
    }
    
    console.log('Stored verification code:', { email, code, expires_at_provided: expires_at !== null });
    return true;
  } catch (error) {
    console.error('Error upserting verification code:', error);
    return false;
  }
}

/**
 * 验证验证码
 * @param {string} email - 邮箱
 * @param {string} code - 验证码
 * @returns {Promise<boolean>} - 验证码是否有效
 */
export async function verifyCode(email, code) {
  try {
    // 确保验证码是字符串类型并去除空格
    const cleanCode = String(code).trim();
    
    // 先获取验证码记录，用于调试
    const [allCodes] = await pool.query(
      'SELECT * FROM verification_codes WHERE email = $1',
      [email]
    );
    
    if (allCodes.length === 0) {
      console.log('No verification code found for email:', email);
      return false;
    }
    
    const dbCode = allCodes[0];
    console.log('Verification code check:', {
      email,
      inputCode: cleanCode,
      dbCode: dbCode.code,
      dbCodeType: typeof dbCode.code,
      inputCodeType: typeof cleanCode,
      codesMatch: dbCode.code === cleanCode,
      expiresAt: dbCode.expires_at,
      now: new Date(),
      isExpired: new Date(dbCode.expires_at) <= new Date()
    });
    
    // 直接使用数据库的NOW()比较，因为expires_at也是用NOW()计算的，时区一致
    const [codes] = await pool.query(
      `SELECT * FROM verification_codes 
       WHERE email = $1 
       AND code = $2 
       AND expires_at > NOW()`,
      [email, cleanCode]
    );
    
    const isValid = codes.length > 0;
    console.log('Verification result:', isValid, {
      queryResultCount: codes.length,
      dbExpiresAt: dbCode.expires_at,
      dbCode: dbCode.code,
      inputCode: cleanCode
    });
    return isValid;
  } catch (error) {
    console.error('Error verifying code:', error);
    return false;
  }
}

/**
 * 删除验证码
 * @param {string} email - 邮箱
 * @returns {Promise<boolean>} - 是否删除成功
 */
export async function deleteVerificationCode(email) {
  try {
    await pool.query('DELETE FROM verification_codes WHERE email = $1', [email]);
    return true;
  } catch (error) {
    console.error('Error deleting verification code:', error);
    return false;
  }
}

// ==================== 资源相关方法 ====================

/**
 * 根据标题获取资源
 * @param {string} title - 资源标题
 * @returns {Promise<Object|null>} - 资源信息
 */
export async function getResourceByTitle(title) {
  try {
    const [resources] = await pool.query(
      'SELECT * FROM study_resources WHERE title = $1',
      [title]
    );
    return resources.length > 0 ? resources[0] : null;
  } catch (error) {
    console.error('Error getting resource by title:', error);
    return null;
  }
}

/**
 * 根据ID获取资源
 * @param {number} resourceId - 资源ID
 * @returns {Promise<Object|null>} - 资源信息
 */
export async function getResourceById(resourceId) {
  return await getResource(resourceId);
}

/**
 * 获取随机资源
 * @param {number} limit - 限制数量，默认3
 * @returns {Promise<Array>} - 资源列表
 */
export async function getRandomResources(limit = 3) {
  try {
    const [resources] = await pool.query(
      'SELECT id, title, price, image, type, level, chapter FROM study_resources ORDER BY RANDOM() LIMIT $1',
      [limit]
    );
    return resources;
  } catch (error) {
    console.error('Error getting random resources:', error);
    return [];
  }
}

/**
 * 获取所有资源（用于调试）
 * @returns {Promise<Array>} - 资源列表
 */
export async function getAllResources() {
  try {
    const [resources] = await pool.query('SELECT id, title, type, level FROM study_resources');
    return resources;
  } catch (error) {
    console.error('Error getting all resources:', error);
    return [];
  }
}

/**
 * 根据条件查询资源
 * @param {Object} filters - 过滤条件
 * @param {string} filters.type - 类型
 * @param {string} filters.level - 级别
 * @param {string} filters.chapter - 章节
 * @returns {Promise<Array>} - 资源列表
 */
export async function getResourcesByFilters(filters = {}) {
  try {
    let query = 'SELECT * FROM study_resources WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.type) {
      query += ` AND type = $${paramIndex++}`;
      params.push(filters.type);
    }
    if (filters.level) {
      query += ` AND level = $${paramIndex++}`;
      params.push(filters.level);
    }
    if (filters.chapter) {
      query += ` AND chapter = $${paramIndex++}`;
      params.push(filters.chapter);
    }

    const [resources] = await pool.query(query, params);
    return resources;
  } catch (error) {
    console.error('Error getting resources by filters:', error);
    return [];
  }
}

/**
 * 获取 Mindmap 类型的所有章节（按章节号排序）
 * @param {string} level - 级别 (AS/A2)
 * @returns {Promise<Array>} - 章节列表
 */
export async function getMindmapChapters(level) {
  try {
    const [chapters] = await pool.query(
      `SELECT * FROM study_resources 
       WHERE type = 'Mindmap' AND level = $1
       ORDER BY CASE 
          WHEN chapter = 'All' THEN 0 
          ELSE CAST(REGEXP_REPLACE(chapter, '[^0-9]', '') AS INTEGER) 
       END`,
      [level]
    );
    return chapters;
  } catch (error) {
    console.error('Error getting mindmap chapters:', error);
    return [];
  }
}

// ==================== 高亮相关方法 ====================

/**
 * 保存高亮
 * @param {Object} highlightData - 高亮数据
 * @param {string} highlightData.section_id - 章节ID
 * @param {string} highlightData.item_id - 项目ID
 * @param {number} highlightData.user_id - 用户ID
 * @param {string} highlightData.serialized_data - 序列化数据
 * @returns {Promise<Object>} - 创建的高亮信息
 */
export async function saveHighlight(highlightData) {
  try {
    const { section_id, item_id, user_id = 1, serialized_data } = highlightData;
    const [result] = await pool.query(
      `INSERT INTO highlights (section_id, item_id, user_id, serialized_data, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING *`,
      [section_id, item_id, user_id, typeof serialized_data === 'string' ? serialized_data : JSON.stringify(serialized_data)]
    );
    return result[0];
  } catch (error) {
    console.error('Error saving highlight:', error);
    throw error;
  }
}

/**
 * 获取高亮
 * @param {Object} filters - 过滤条件
 * @param {string} filters.section_id - 章节ID
 * @param {string} filters.item_id - 项目ID
 * @param {number} filters.user_id - 用户ID
 * @returns {Promise<Array>} - 高亮列表
 */
export async function getHighlights(filters = {}) {
  try {
    let query = 'SELECT * FROM highlights WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.section_id) {
      query += ` AND section_id = $${paramIndex++}`;
      params.push(filters.section_id);
    }
    if (filters.item_id) {
      query += ` AND item_id = $${paramIndex++}`;
      params.push(filters.item_id);
    }
    if (filters.user_id) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(filters.user_id);
    }

    query += ' ORDER BY created_at DESC LIMIT 1';

    const [highlights] = await pool.query(query, params);
    return highlights.map(highlight => ({
      ...highlight,
      serialized_data: highlight.serialized_data ? JSON.parse(highlight.serialized_data) : null
    }));
  } catch (error) {
    console.error('Error getting highlights:', error);
    return [];
  }
}

/**
 * 删除高亮
 * @param {number} id - 高亮ID
 * @param {number} user_id - 用户ID
 * @returns {Promise<boolean>} - 是否删除成功
 */
export async function deleteHighlight(id, user_id) {
  try {
    const [result] = await pool.query(
      'DELETE FROM highlights WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, user_id]
    );
    return result.length > 0;
  } catch (error) {
    console.error('Error deleting highlight:', error);
    return false;
  }
}

// ==================== 订单相关辅助方法 ====================

/**
 * 获取订单中的资源文件路径（用于发送邮件）
 * @param {Array<number>} resourceIds - 资源ID列表
 * @returns {Promise<Array>} - 资源信息列表
 */
export async function getResourcesForEmail(resourceIds) {
  if (resourceIds.length === 0) {
    return [];
  }

  try {
    const placeholders = resourceIds.map((_, i) => `$${i + 1}`).join(',');
    const [resources] = await pool.query(
      `SELECT id, file_path, title FROM study_resources WHERE id IN (${placeholders})`,
      resourceIds
    );
    return resources;
  } catch (error) {
    console.error('Error getting resources for email:', error);
    return [];
  }
}

/**
 * 获取用户的购买记录（用于重发邮件）
 * @param {number} userId - 用户ID
 * @param {number} study_resource_id - 资源ID
 * @returns {Promise<Array>} - 购买记录列表
 */
export async function getUserPurchaseRecords(userId, study_resource_id) {
  try {
    const [records] = await pool.query(
      `SELECT 
        o.order_id,
        o.created_at as purchase_date,
        o.transaction_id,
        sr.title,
        sr.file_path
       FROM orders o
       JOIN order_items oi ON o.order_id = oi.order_id
       JOIN study_resources sr ON oi.study_resource_id = sr.id
       WHERE o.user_id = $1 
         AND oi.study_resource_id = $2
         AND o.status = 'PAID'
       ORDER BY o.created_at DESC`,
      [userId, study_resource_id]
    );
    return records;
  } catch (error) {
    console.error('Error getting user purchase records:', error);
    return [];
  }
}

// ==================== 管理员相关方法 ====================

/**
 * 创建或更新会员记录
 * @param {number} userId - 用户ID
 * @param {string} membershipType - 会员类型 ('premium' 或 'lifetime')
 * @param {number|null} days - 会员天数（lifetime时为null）
 * @returns {Promise<Object>} - 创建的或更新的会员信息
 */
export async function createOrUpdateMembership(userId, membershipType, days = null) {
  try {
    // 使用数据库的 NOW() + INTERVAL 来计算过期时间，确保时区一致
    // 如果 days 为 null 或 membershipType 是 'lifetime'，expire_date 为 null
    if (membershipType === 'premium' && days !== null && days > 0) {
      // 确保 days 是数字，防止 SQL 注入
      const daysNum = parseInt(days, 10);
      if (isNaN(daysNum) || daysNum <= 0) {
        throw new Error('Invalid days parameter');
      }
      
      // 使用数据库计算过期时间，使用 make_interval 函数确保安全
      const [result] = await pool.query(
        `INSERT INTO membership (user_id, membership_type, start_date, expire_date, status)
         VALUES ($1, $2, NOW(), NOW() + make_interval(days => $3), 'active')
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           membership_type = EXCLUDED.membership_type,
           start_date = EXCLUDED.start_date,
           expire_date = EXCLUDED.expire_date,
           status = 'active',
           updated_at = NOW()
         RETURNING *`,
        [userId, membershipType, daysNum]
      );
      return result[0];
    } else {
      // lifetime会员或days为null时，expire_date为null
      const [result] = await pool.query(
        `INSERT INTO membership (user_id, membership_type, start_date, expire_date, status)
         VALUES ($1, $2, NOW(), NULL, 'active')
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           membership_type = EXCLUDED.membership_type,
           start_date = EXCLUDED.start_date,
           expire_date = EXCLUDED.expire_date,
           status = 'active',
           updated_at = NOW()
         RETURNING *`,
        [userId, membershipType]
      );
      return result[0];
    }
  } catch (error) {
    console.error('Error creating or updating membership:', error);
    throw error;
  }
}

/**
 * 给用户赠送资源（创建免费订单）
 * @param {number} userId - 用户ID
 * @param {number} resourceId - 资源ID
 * @param {string} userEmail - 用户邮箱
 * @param {string} userName - 用户名称
 * @returns {Promise<Object>} - 创建的订单信息
 */
export async function grantResourceToUser(userId, resourceId, userEmail, userName) {
  try {
    // 生成订单ID
    const orderId = `admin_grant_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // 创建免费订单
    const [orderResult] = await pool.query(
      `INSERT INTO orders (order_id, user_id, user_email, user_name, total_price, payment_method, status)
       VALUES ($1, $2, $3, $4, 0.00, 'free', 'PAID')
       RETURNING *`,
      [orderId, userId, userEmail, userName]
    );

    // 获取资源价格（用于订单明细，虽然实际价格是0）
    const [resource] = await pool.query(
      'SELECT price FROM study_resources WHERE id = $1',
      [resourceId]
    );

    if (resource.length === 0) {
      throw new Error('Resource not found');
    }

    const resourcePrice = parseFloat(resource[0].price);

    // 创建订单明细
    await pool.query(
      `INSERT INTO order_items (order_id, study_resource_id, quantity, unit_price, total_price)
       VALUES ($1, $2, 1, $3, 0.00)`,
      [orderId, resourceId, resourcePrice]
    );

    return orderResult[0];
  } catch (error) {
    console.error('Error granting resource to user:', error);
    throw error;
  }
}
