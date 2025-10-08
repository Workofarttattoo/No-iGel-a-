# Base44：快速上手指南

欢迎使用 Base44。本指南面向**所有人**，即使没有技术背景也能轻松阅读。它将告诉你 Base44 的作用、如何配置，以及出现问题时如何处理。

---

## 1. Base44 做什么？
- **移动端应用（iOS / Android）**：为通过年龄验证的成年人提供与 Venice.ai 人格聊天的窗口，没有广告和臃肿的过滤。
- **后端服务（Node.js）**：验证年龄、保存证件正面照片、与 Venice.ai 通信，并管理订阅与聊天记录。

两者缺一不可：后端必须运行，移动端要指向正确的地址。

---

## 2. 常见名词
| 名称 | 含义 |
|------|------|
| **Venice.ai** | 实际生成回复的 AI 平台。 |
| **Persona（人格）** | 预先配置好的角色，例如“改邪归正的黑客”。 |
| **Onboarding（注册流程）** | 拍摄证件正面、确认已满 18 岁并接受免责声明。 |
| **Paywall / Subscription（付费墙 / 订阅）** | 订阅激活后才能聊天。当前按钮只是模拟真实付费。 |
| **JWT / Token（令牌）** | 完成注册后生成的登录凭证。 |

---

## 3. 准备工作
### 3.1 必备工具
- [Node.js 20+](https://nodejs.org/)（自带 npm）
- [Expo CLI](https://docs.expo.dev/get-started/installation/)（`npm install -g expo-cli`）
- iOS 模拟器（Xcode）或 Android 模拟器（Android Studio）
- Postgres 数据库（本地或云端）
- 可选：用于存储证件图片的 S3 Bucket

### 3.2 所需密钥与配置
| 项目 | 获取方式 |
|------|----------|
| Venice.ai API Key | 登录 Venice.ai 控制台 → API Keys |
| JWT Secret | 运行 `openssl rand -base64 48` 生成随机字符串 |
| Postgres 连接串 | 数据库服务提供商，例如 `postgres://user:pass@host:5432/base44` |
| S3 Bucket 名称与区域 | 在 AWS 创建并启用加密 |
| Webhook Secret（可选） | Stripe 或 RevenueCat 后台 |

---

## 4. 部署后端
1. 编辑 `backend/.env`：
   ```env
   VENICE_API_KEY=你的真实密钥
   VENICE_PROFILE_ID=h4ck3r
   PORT=4000
   DATABASE_URL=postgres://user:pass@host:5432/base44
   JWT_SECRET=随机字符串
   AWS_REGION=us-west-2
   ID_BUCKET=base44-id-assets
   STRIPE_WEBHOOK_SECRET=可选密钥
   ```
2. 安装依赖并编译：
   ```bash
   cd backend
   npm install
   npm run build
   ```
3. 启动服务：
   ```bash
   npm run dev
   ```

> 如果出现 `listen EPERM`，说明当前环境禁止开放端口，请在自己的电脑上运行。

---

## 5. 配置移动端
1. 修改 `mobile/app.json` → `extra.apiBaseUrl`，指向后端地址（默认 `http://localhost:4000`）。
2. 安装依赖：
   ```bash
   cd mobile
   npm install
   npx tsc --noEmit
   ```
3. 启动 Expo：
   ```bash
   npm start
   ```
4. 按 `i`（iOS 模拟器）或 `a`（Android 模拟器）。在真机上，可使用 Expo Go 扫描二维码。

---

## 6. 用户操作流程
1. 首次打开应用时允许摄像头权限。
2. 拍摄证件正面并确认免责声明。
3. 在付费墙页面点击 “Activate Secure Access”（目前是演示按钮）。
4. 进入人格列表，选择需要的 persona。
5. 开始聊天，消息会实时流式返回并自动保存。
6. 想清除数据？在人格列表里点击 “Activate Panic Wipe”。

---

## 7. 日常操作
| 操作 | 命令或方法 |
|------|------------|
| 启动后端 | `cd backend && npm run dev` |
| 启动移动端 | `cd mobile && npm start` |
| 新增人格 | 编辑 `backend/src/services/personaService.ts` |
| 调整审核 | 编辑 `backend/src/utils/safety.ts` |
| 查看拦截记录 | 暂时通过后端日志查看 |
| 强制清除终端设备 | 应用内点击 “Activate Panic Wipe” |

---

## 8. 常见问题
- **后端启动失败**：检查 `.env` 是否填写正确，并确认端口未被占用。
- **移动端无法连接**：确认 `apiBaseUrl` 填写正确，且网络能访问后端。
- **上传证件失败**：确认已授权摄像头、图片小于 8MB。
- **订阅状态丢失**：后端目前用内存存储，重启后需重新点击激活按钮。
- **正常对话被拦截**：调整 `backend/src/utils/safety.ts` 中的关键词列表。

---

## 9. 上线前 checklist
1. 将内存数据改为持久化（如 Postgres 表）。
2. 把证件图片迁移到启用加密与生命周期策略的 S3 Bucket。
3. 接入真实支付（RevenueCat / Stripe），校验收据与 webhook。
4. 加入监控、告警及人工审核流程。
5. 发布隐私政策，并进行安全测试与渗透测试。

---

## 10. 求助渠道
- 提供后端与 Expo 的日志输出。
- 截图 `.env`（隐藏敏感信息）和 `app.json` 配置。
- 详细描述复现步骤和报错信息。

按照以上步骤，你就能轻松启动 Base44 并排查常见问题。祝使用顺利！
