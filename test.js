import bcrypt from 'bcryptjs';

const userPasswordHash = "$2a$10$Q58mZir4f0/wMO2aSB6eWuhNymxeFtqqDpA29NZAEpOOtwas2fNKC"; // 数据库中的哈希密码
const inputPassword = "11"; // 用户尝试登录时输入的密码

const isMatch = bcrypt.compareSync(inputPassword, userPasswordHash);
console.log("Password Match:", isMatch);