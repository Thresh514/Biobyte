import bcrypt from 'bcryptjs';

// 假设密码是明文的，我们需要在注册时加密
export const users = [
    { username: "user1", password: bcrypt.hashSync("password123", 10) },
    { username: "user2", password: bcrypt.hashSync("password456", 10) },
];