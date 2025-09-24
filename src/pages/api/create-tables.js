import { pool } from "../../lib/db";

export default async function handler(req, res) {
  // 只允许POST请求执行初始化
  if (req.method !== "POST") {
    return res.status(405).json({ message: "方法不允许" });
  }

  try {
    // 创建users表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ users表创建成功");

    // 创建访客用户
    await pool.query(`
      INSERT IGNORE INTO users (id, name, email, created_at) 
      VALUES (1, 'Guest User', 'guest@example.com', NOW())
    `);
    console.log("✅ 访客用户创建成功");

    // 创建study_resources表（如果尚不存在）
    await pool.query(`
      CREATE TABLE IF NOT EXISTS study_resources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        file_path VARCHAR(255),
        type ENUM('notes', 'paper', 'video', 'book') NOT NULL,
        level ENUM('AS', 'A2', 'Both') NOT NULL DEFAULT 'Both',
        chapter VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ study_resources表创建成功");

    // 创建user_study_resources表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_study_resources (
        user_id INT NOT NULL,
        study_resource_id INT NOT NULL,
        purchase_date DATETIME NOT NULL,
        order_id VARCHAR(50) NULL,
        status ENUM('PENDING', 'PAID') DEFAULT 'PAID',
        transaction_id VARCHAR(50) NULL,
        PRIMARY KEY (user_id, study_resource_id),
        INDEX idx_order_id (order_id),
        INDEX idx_transaction_id (transaction_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (study_resource_id) REFERENCES study_resources(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ user_study_resources表创建成功");

    // 暂时注释掉highlights表创建
    // await pool.query(`
    //   CREATE TABLE IF NOT EXISTS highlights (
    //     id INT AUTO_INCREMENT PRIMARY KEY,
    //     section_id VARCHAR(50),
    //     item_id VARCHAR(50),
    //     user_id INT NOT NULL,
    //     serialized_data TEXT,
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    //     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    //     INDEX idx_user_section (user_id, section_id),
    //     INDEX idx_user_item (user_id, item_id)
    //   )
    // `);
    // console.log("✅ highlights表创建成功");

    // 创建annotations表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS annotations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        text TEXT NOT NULL,
        start_offset INT NOT NULL,
        end_offset INT NOT NULL,
        annotation TEXT NOT NULL,
        unit_id VARCHAR(50),
        section_id VARCHAR(50),
        item_id VARCHAR(50),
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_unit (user_id, unit_id),
        INDEX idx_user_section (user_id, section_id),
        INDEX idx_user_item (user_id, item_id)
      )
    `);
    console.log("✅ annotations表创建成功");

    // 尝试从resources表迁移数据（如果存在）
    try {
      // 检查resources表是否存在
      const [tables] = await pool.query(`
        SHOW TABLES LIKE 'resources';
      `);
      
      if (tables.length > 0) {
        const [resourcesExist] = await pool.query(`
          SELECT COUNT(*) as count FROM resources
        `);
        
        const [studyResourcesCount] = await pool.query(`
          SELECT COUNT(*) as count FROM study_resources
        `);
        
        if (resourcesExist[0].count > 0 && studyResourcesCount[0].count === 0) {
          // 迁移数据
          await pool.query(`
            INSERT INTO study_resources (title, description, price, file_path, type, level, chapter)
            SELECT title, description, price, file_path, type, level, chapter FROM resources
          `);
          console.log("✅ 从resources表迁移数据成功");
        }
      } else {
        console.log("ℹ️ resources表不存在，跳过数据迁移");
      }
    } catch (migrationError) {
      console.error("⚠️ 迁移数据时出错:", migrationError);
      // 继续执行，不中断流程
    }

    return res.status(200).json({
      success: true,
      message: "数据库表创建成功"
    });
  } catch (error) {
    console.error("❌ 创建表时出错:", error);
    return res.status(500).json({
      success: false,
      message: "创建表时出错",
      error: error.message
    });
  }
} 