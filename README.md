# Virtual People Animation Test Part for QmingEdu

一个本地 `VRM + FBX` 动作预览项目，用来快速检查数字人模型在大量动作素材上的播放效果。

这个仓库当前包含：

- 1 个 VRM 数字人模型
- 4 组 FBX 动作素材
- 1 个本地网页预览器
- 1 个轻量 Node 静态服务

## 功能

- 加载 `QmingVirtualPeopleTestVersion1.0.vrm`
- 扫描 `1/2/3/4` 目录下全部 `FBX` 动作
- 在浏览器中切换、搜索、筛选和播放动作
- 支持上一条 / 下一条 / 暂停 / 循环 / 速度调整
- 针对动作做基础的脚底落地和位置归中修正

## 启动方式

先安装依赖：

```bash
npm install
```

启动本地预览：

```bash
npm start
```

启动后打开：

```text
http://127.0.0.1:4173/
```

## 快捷键

- `←` / `→`：切换动作
- `空格`：暂停 / 继续
- `L`：循环开关

## 目录结构

```text
.
├─ 1/                         # 第 1 组 FBX 动作
├─ 2/                         # 第 2 组 FBX 动作
├─ 3/                         # 第 3 组 FBX 动作
├─ 4/                         # 第 4 组 FBX 动作
├─ QmingVirtualPeopleTestVersion1.0.vrm
├─ index.html                 # 预览页
├─ server.js                  # 本地服务
├─ package.json
└─ package-lock.json
```

## 技术栈

- [three.js](https://threejs.org/)
- [@pixiv/three-vrm](https://github.com/pixiv/three-vrm)
- 原生 HTML / CSS / JavaScript
- Node.js 本地静态服务

## 当前预览逻辑说明

预览页目前会做这些处理：

- 把 VRM 模型加载到网页场景中
- 读取 FBX 动作并尝试映射到 VRM humanoid 骨骼
- 在播放前做基础 root motion 归零
- 对每条动作做一次脚底最低点采样，尽量减少悬空、穿地和整体偏移

## 已知限制

- 部分 FBX 动作如果骨骼命名不标准，可能无法完全正确映射
- 少量动作的脚步落地仍可能不够理想
- 当前是预览工具，不是最终的动画清洗或导出流水线
- 仓库内素材较大，首次 clone / push 可能较慢

## 后续可继续补的方向

- 更严格的脚底贴地策略
- 动作分类标签和收藏功能
- 预览截图导出
- 批量动作质量检查
- 动作修正参数开关

## License

当前仓库未单独声明素材授权范围。使用前请确认：

- VRM 模型的使用权限
- 动作素材的来源与授权
- 是否允许再分发
