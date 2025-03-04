# Biobyte
## 更新部署流程：
```bash
cd /var/www/biobyte        # 进入项目目录
git pull origin main       # 拉取最新代码（或手动上传新代码）
npm install               # 安装新依赖（如果有）
npm run build             # 重新构建 Next.js
pm2 restart biobyte       # 重新启动 pm2
pm2 save                  # 保存 pm2 状态
pm2 startup
nginx -t && systemctl restart nginx  # 确保 Nginx 运行正常
```
`"start": "next start -H 0.0.0.0 -p 3100",`在`var/www/biobyte/package.json`中加上。
