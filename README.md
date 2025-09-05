# 简洁版 Todo List 应用

这是一个使用纯 HTML、CSS 和 JavaScript 构建的简单待办事项（Todo List）Web 应用。它完全运行在浏览器端，无需后端服务器，并使用浏览器的 `localStorage` 来持久化存储数据。

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

**[查看在线演示 &raquo;](https://otvq.github.io/todo-list/)**

<img width="1338" height="531" alt="image" src="https://github.com/user-attachments/assets/1fb8e478-9146-4785-a791-bff378d5f6ba" />

---

## ✨ 主要功能

* **模拟登录**: 使用用户名来区分不同用户的待办事项列表（数据存储在各自的浏览器中）。
* **添加待办**: 可以在输入框中快速添加新的待办事项。
* **标记完成/待办**: 点击任务即可将其标记为“已完成”或切换回“待办”状态。
* **分离列表**: “待办事项”和“已完成”分别在两个列表中清晰展示。
* **删除任务**: 可以从列表中永久删除任何任务。
* **本地持久化**: 所有数据都保存在浏览器的 `localStorage` 中，关闭或刷新页面后数据不会丢失。
* **纯静态部署**: 无需任何后端，可以直接托管在 GitHub Pages 或任何静态网站托管服务上。

---

## 🚀 技术栈

* **HTML5**: 负责网页的基本结构。
* **CSS3**: 负责应用的样式和美化。
* **JavaScript (ES6+)**: 负责所有的交互逻辑、DOM 操作和数据存储。

---

## 🛠️ 如何在本地运行

如果你想在本地进行开发或调试，请遵循以下步骤：

1.  **克隆仓库**
    ```bash
    git clone [https://github.com/](https://github.com/)[你的GitHub用户名]/[你的仓库名].git
    ```

2.  **进入项目目录**
    ```bash
    cd [你的仓库名]
    ```

3.  **启动本地服务器**

    * **方法一：使用 VS Code 的 `Live Server` 插件 (推荐)**
        1.  在 VS Code 中打开项目文件夹。
        2.  在 `index.html` 文件上右键，选择 `Open with Live Server`。

    * **方法二：使用 Python**
        ```bash
        # Python 3
        python -m http.server
        # Python 2
        python -m SimpleHTTPServer
        ```
        然后在浏览器中打开 `http://localhost:8000`。

4.  **开始使用！**

---

## 部署

该项目已通过 **GitHub Pages** 进行部署。部署步骤如下：

1.  将项目代码推送到 GitHub 仓库的 `main` 分支。
2.  在仓库的 `Settings` -> `Pages` 页面。
3.  选择 `Deploy from a branch` 作为源。
4.  选择 `main` 分支和 `/(root)` 目录，然后保存。
5.  等待几分钟，网站即可通过提供的 URL 访问。

---

## 许可证

该项目使用 MIT 许可证。详情请见 [LICENSE](LICENSE) 文件。
