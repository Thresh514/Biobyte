import bcrypt from "bcryptjs";
import { pool } from "../../lib/db"; // 引入数据库连接池

const register = async (req, res) => {
  if (req.method === "POST") {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try{

        const [dbCheck] = await pool.query("SELECT DATABASE();");
        console.log("当前连接的数据库是:", dbCheck);

        // 检查邮箱是否已经存在
        const [emailCheck] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (emailCheck.length > 0) {
            return res.status(400).json({ message: "Email already registered. Please log in." });
        }

        // 将密码哈希加密
        const hashedPassword = await bcrypt.hash(password, 10);

        // 将数据插入到数据库
        const insertQuery = "INSERT INTO users (password_hash, email) VALUES (?, ?)";
        const insertValues = [hashedPassword, email];
        await pool.query(insertQuery, insertValues);

        return res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error." });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed." });
  }
};

export default register;
