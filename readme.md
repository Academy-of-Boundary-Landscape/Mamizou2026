# 2026 二岩猯藏接力展示网站

一个用于展示「二岩猯藏角色日 24h 接力」作品的前端站点。 
**主站链接**: https://mamizou2026.secret-sealing.club/
主要功能：作品展示、时间轴浏览、作者跳转与活动信息归档。

过年期间闲的没事快速滑铲的，希望能让大家开心。
第一次试图用这个风格的设计，如果想要修改内容细节或者有改进建议欢迎随时提出来！

我们的其它网站：
[堇子日接力]https://sumireko2026.secret-sealing.club/
[社团官网]https://abl.secret-sealing.club/
[蓬莱日接力]https://hourai2025.secret-sealing.club/

## 关于网站部署

我们的网站因为是纯静态的，不需要写后端，所以它被挂到了github pages上面，为了让图片资源加载更快我还配置了一下CDN.

## 快速开始

```bash
cd frontend
npm install
npm run dev
```

默认本地地址：`http://localhost:5173`

## 常用命令

```bash
cd frontend
npm run dev      # 开发模式
npm run build    # 生产构建（含类型检查）
npm run preview  # 预览构建结果
```

## 数据与资源维护

- 作品数据：`frontend/src/data/works.json`
- 站点元信息：`frontend/src/data/site.meta.json`
- 文案内容：`frontend/public/content/*.txt`
- 封面/头像/海报等：`frontend/public/covers`、`frontend/public/avatars`、`frontend/public/posters`

## 项目结构（随便写的)

```text
frontend/
	src/
		pages/         # 页面
		components/    # 组件
		data/          # JSON 数据
		router/        # 路由
	public/          # 静态资源
```

## 联系我们

作者: [Renko6626](https://github.com/Renko6626) qq:1471850534
同人社团: [境界景观学会](https://abl.secret-sealing.club)


