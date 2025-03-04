import bcrypt from "bcryptjs";
import { pool } from "../../lib/db"; // 引入数据库连接池

const register = async (req, res) => {
  console.log("Register API hit");  // ✅ 这行放在 `if (req.method === "POST")` 之前

  if (req.method === "POST") {
    console.log("Request Body:", req.body);
    const { email, password, verificationCode } = req.body;

    if (!email || !password || !verificationCode) {
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
            return res.status(400).json({ message: "Email already registered. Please log in" });
        }

        // 将密码哈希加密
        const hashedPassword = await bcrypt.hash(password, 10);

        // 检查验证码是否匹配
        const cleanVerificationCode = String(verificationCode).trim();
        const [verificationCheck] = await pool.query(
          "SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > NOW()",
          [email, cleanVerificationCode]
        );

        if (verificationCheck.length === 0) {
          console.log("Verification query result:", verificationCheck);
          return res.status(400).json({ message: "Invalid or expired verification code." });
        }
        console.log("Verification Check:", verificationCheck);


        // 将数据插入到数据库
        const insertQuery = "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)";
        const insertValues = [email, hashedPassword, "member"];
        try {
          console.log("Executing query:", insertQuery, insertValues);
          const [result] = await pool.query(insertQuery, insertValues);
      
          if (result.affectedRows === 0) {
              console.error("Insert failed: No rows affected.");
              return res.status(500).json({ message: "User registration failed. No rows inserted." });
          }
      
          console.log("Insert Result:", result);
      } catch (error) {
          console.error("Error inserting user:", error);
          return res.status(500).json({ message: "Database insertion error.", error: error.message });
      }

        // 注册成功后，删除验证码
        const deleteResult = await pool.query("DELETE FROM verification_codes WHERE email = ?", [email]);
        console.log("Delete Result:", deleteResult);

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
