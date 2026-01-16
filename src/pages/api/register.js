import bcrypt from "bcryptjs";
import { 
  getUserByEmail, 
  createUser, 
  getVerificationCode, 
  verifyCode, 
  deleteVerificationCode 
} from "../../lib/db-helpers";

const register = async (req, res) => {
  console.log("Register API hit");  // ✅ 这行放在 `if (req.method === "POST")` 之前

  if (req.method === "POST") {
    console.log("Request Body:", req.body);
    const { email, password, verificationCode } = req.body;

    if (!email || !password || !verificationCode) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try{
        // 检查邮箱是否已经存在
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered. Please log in" });
        }

        // 将密码哈希加密
        const hashedPassword = await bcrypt.hash(password, 10);

        // 检查验证码是否存在
        const cleanVerificationCode = String(verificationCode).trim();
        const verificationCheck = await getVerificationCode(email);

        if (!verificationCheck) {
          console.log("No verification code found for email:", email);
          return res.status(400).json({ message: "Please request a verification code first." });
        }

        // 验证验证码（包括正确性和过期时间）
        const isValidCode = await verifyCode(email, cleanVerificationCode);
        if (!isValidCode) {
          console.log("Invalid or expired verification code for email:", email);
          return res.status(400).json({ message: "Incorrect or expired verification code." });
        }

        // 创建用户
        try {
          console.log("Creating user:", email);
          const result = await createUser({
            email,
            password_hash: hashedPassword,
            role: "member"
          });
          console.log("User created successfully:", result.id);
      } catch (error) {
          console.error("Error creating user:", error);
          return res.status(500).json({ message: "Database insertion error.", error: error.message });
      }

        // 注册成功后，删除验证码
        await deleteVerificationCode(email);
        console.log("Verification code deleted for:", email);

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
