# 库存管理系统

这是一个基于Node.js的简单库存管理系统，包含前端页面和后端API。

## 功能特性

- 用户管理
- 库存管理
- 进货记录
- 销货记录

## 技术栈

- Node.js
- 原生HTTP模块
- 前端：HTML, CSS, JavaScript

## 本地运行

1. 克隆项目到本地
2. 运行 `node server.js`
3. 访问 `http://localhost:8083`

## 部署到Fly.io

1. 安装Fly.io CLI：`npm install -g flyctl`
2. 登录Fly.io：`flyctl auth login`
3. 初始化项目：`flyctl launch`
4. 部署应用：`flyctl deploy`
5. 查看应用状态：`flyctl status`

## 数据存储

数据存储在 `data/` 目录下的txt文件中，包括：
- users.txt - 用户信息
- inventory.txt - 库存信息
- purchases.txt - 进货记录
- sales.txt - 销货记录

## 注意事项

- 本项目使用本地文件存储数据，在云服务上部署时，数据可能会在服务重启时丢失
- 建议在生产环境中使用数据库存储数据
