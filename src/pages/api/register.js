import bcrypt from "bcryptjs";
import { pool } from "../../lib/db"; // 引入数据库连接池

const register = async (req, res) => {
  if (req.method === "POST") {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try{
        //check if username exists
        const [usernameCheck] = await pool.query(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );

        if (usernameCheck.length > 0) {
            return res.status(400).json({ message: "Username already exists. Try another." });
        }

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
        const insertQuery = "INSERT INTO users (username, password, email) VALUES (?, ?, ?)";
        const insertValues = [username, hashedPassword, email];
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
