# 亲戚计算器

按顺序选择亲属关系，查询“我称呼对方”或“对方称呼我”。基于 React、TypeScript、Vite 和 MIT 许可的 relationship.js，纯静态前端，无后端和在线计算服务。

## 在线使用

网站地址：[https://33skrr.github.io/RelativeCalculator/](https://33skrr.github.io/RelativeCalculator/)。手机或电脑浏览器都可访问，无需安装，也无需运行本地服务。

GitHub Pages 通过 `.github/workflows/deploy-pages.yml` 自动部署。每次推送到 `main`，GitHub Actions 会安装依赖、运行测试、构建并发布 `dist`；测试或构建失败时不会发布新版本。也可在 Actions 页面手动运行 “Deploy to GitHub Pages”。仓库 Settings → Pages 的部署来源使用 GitHub Actions。

## 本地运行

使用 Node.js 24.14+（或满足 Vite 8 要求的版本）。

```sh
npm ci
npm run dev
```

打开终端打印的本地地址，默认 http://127.0.0.1:5173。

```sh
npm test               # 计算引擎、状态和界面测试
npm run typecheck      # TypeScript 检查
npm run build          # 生成 dist 静态文件
npx playwright install chromium
npm run test:browser   # 对生产构建进行浏览器测试；需先 build
npm run preview        # 本地预览生产构建
```

浏览器测试包含键盘操作、320/390/1440 宽度和短屏布局，截图输出到 `artifacts/`，失败跟踪输出到 `test-results/`。

测试默认使用 Playwright Chromium；Windows 未下载测试浏览器时，可自动使用默认安装位置的 Chrome。也可通过 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指定本机浏览器路径。

## 操作

- 默认男生。**男生禁用“老公”、可选“老婆”；女生禁用“老婆”、可选“老公”**。只关联顶部性别，不随关系链末端人物改变。
- 点击亲属按键追加关系，按等号计算。空关系计算为“自己”。
- “切换”保留原关系链，切换称呼方向；已计算时立即更新答案。
- 更改性别保留输入和方向，已计算时更新答案。
- “回退”删除最后一步；追加或回退会清除旧答案。
- “重置”清空输入和结果，恢复“我称呼对方”，保留性别。

例如“爸爸 → 哥哥 → ＝”得到“伯父”，男生切换后得到“侄子”，女生反向得到“侄女”。

## 计算边界

缺少长幼信息时保留多个称呼，例如“表姐 / 表妹”。计算库使用常见中文亲属称谓，地区叫法可能不同；无法识别的关系链会显示提示，不猜测答案。界面的配偶禁用规则按项目要求实现，允许输入的链仍可能不符合计算库的亲属模型。

移动端采用截图式布局，桌面居中显示。未包含祝福语、AI 计算、关系查询等扩展功能。

第三方许可见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。
