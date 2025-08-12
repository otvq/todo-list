document.addEventListener('DOMContentLoaded', () => {
    // 时间格式化工具
    function formatDateTime(isoStr) {
        if (!isoStr) return '';
        const date = new Date(isoStr);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const mi = String(date.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    }

    // 获取所有需要的DOM元素
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const logoutBtn = document.getElementById('logout-btn');
    
    const welcomeMessage = document.getElementById('welcome-message');
    const addTodoForm = document.getElementById('add-todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const completedList = document.getElementById('completed-list');

    let currentUser = null;
    let todos = [];

    // --- 登录/登出逻辑 ---

    function checkLoginStatus() {
        const username = localStorage.getItem('currentUser');
        if (username) {
            currentUser = username;
            loadUserView();
        } else {
            showLoginView();
        }
    }

    // 哈希函数 - 简单加密密码
    function hashPassword(password) {
        // 这是一个简单的哈希实现，实际应用中应使用更安全的方法
        return password.split('').reduce((acc, char) => {
            let hash = ((acc << 5) - acc) + char.charCodeAt(0);
            return hash & hash; // 转换为32位整数
        }, 0).toString();
    }

    // 保存用户数据
    function saveUser(username, passwordHash) {
        const users = JSON.parse(localStorage.getItem('users')) || {};
        users[username] = passwordHash;
        localStorage.setItem('users', JSON.stringify(users));
    }

    // 验证用户密码
    function validateUser(username, password) {
        const users = JSON.parse(localStorage.getItem('users')) || {};
        const storedHash = users[username];
        if (!storedHash) return null; // 用户不存在
        return storedHash === hashPassword(password);
    }

    function handleLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            alert('请输入用户名和密码！');
            return;
        }

        // 验证用户
        const isValid = validateUser(username, password);

        if (isValid === true) {
            // 密码正确，登录
            currentUser = username;
            localStorage.setItem('currentUser', username);
            loadUserView();
        } else if (isValid === null) {
            // 用户不存在，创建新用户
            const confirmCreate = confirm('该用户不存在，是否创建新用户？');
            if (confirmCreate) {
                saveUser(username, hashPassword(password));
                currentUser = username;
                localStorage.setItem('currentUser', username);
                loadUserView();
            }
        } else {
            // 密码错误
            alert('密码错误，请重试！');
        }
    }

    function handleLogout() {
        localStorage.removeItem('currentUser');
        currentUser = null;
        todos = [];
        showLoginView();
    }

    function showLoginView() {
        loginView.style.display = 'block';
        appView.style.display = 'none';
        usernameInput.value = '';
    }

    function loadUserView() {
        loginView.style.display = 'none';
        appView.style.display = 'block';
        welcomeMessage.textContent = `欢迎, ${currentUser}!`;
        loadTodos();
    }
    
    // --- Todo 逻辑 ---

    function loadTodos() {
        const userTodos = localStorage.getItem(`todos_${currentUser}`);
        todos = userTodos ? JSON.parse(userTodos) : [];
        renderTodos();
    }

    function saveTodos() {
        localStorage.setItem(`todos_${currentUser}`, JSON.stringify(todos));
    }

    // 渲染待办事项到页面
    function renderTodos() {
        todoList.innerHTML = '';
        completedList.innerHTML = '';

        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            if (todo.completed) {
                li.classList.add('completed');
            }

            // 添加主任务文本
            const textSpan = document.createElement('span');
            textSpan.textContent = todo.text;
            li.appendChild(textSpan);

            // 添加时间信息
            const timeInfo = document.createElement('div');
            timeInfo.className = 'time-info';
            timeInfo.style.fontSize = '12px';
            timeInfo.style.color = '#888';
            timeInfo.style.marginTop = '6px';
            timeInfo.style.textAlign = 'left';
            const createdStr = `创建: ${formatDateTime(todo.createdAt)}`;
            let completedStr = '';
            if (todo.completed && todo.completedAt) {
                completedStr = `，完成: ${formatDateTime(todo.completedAt)}`;
            }
            timeInfo.textContent = createdStr + completedStr;
            li.appendChild(timeInfo);

            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('actions');

            // 完成/撤销按钮
            const completeBtn = document.createElement('button');
            completeBtn.classList.add('complete-btn');
            completeBtn.innerHTML = todo.completed ? '&#x21A9;' : '&#x2714;';
            completeBtn.title = todo.completed ? '撤销' : '完成';
            completeBtn.onclick = () => toggleTodoStatus(index);
            
            // 删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.innerHTML = '&times;';
            deleteBtn.title = '删除';
            deleteBtn.onclick = () => deleteTodo(index);

            actionsDiv.appendChild(completeBtn);
            actionsDiv.appendChild(deleteBtn);
            li.appendChild(actionsDiv);

            if (todo.completed) {
                completedList.appendChild(li);
            } else {
                todoList.appendChild(li);
            }
        });
    }

    // 添加新的待办事项
    function addTodo(event) {
        event.preventDefault(); // 阻止表单默认的提交行为
        const text = todoInput.value.trim();
        if (text) {
            todos.push({
                text: text,
                completed: false,
                createdAt: new Date().toISOString(),
                completedAt: null
            });
            saveTodos();
            renderTodos();
            todoInput.value = '';
        }
    }

    // 切换待办事项的状态（完成/待办）
    function toggleTodoStatus(index) {
        const todo = todos[index];
        todo.completed = !todo.completed;
        if (todo.completed) {
            todo.completedAt = new Date().toISOString();
        } else {
            todo.completedAt = null;
        }
        saveTodos();
        renderTodos();
    }

    // 删除一个待办事项
    function deleteTodo(index) {
        todos.splice(index, 1);
        saveTodos();
        renderTodos();
    }

    // --- 事件监听 ---
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    addTodoForm.addEventListener('submit', addTodo);

    // --- 初始化 ---
    checkLoginStatus();

    // 显示所有用户列表
    function showAllUsers() {
        // 只有在登录界面才显示用户列表
        if (loginView.style.display !== 'block') {
            alert('请先返回到登录界面，再使用alt+F9查看用户列表');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || {};
        const userList = Object.keys(users);

        if (userList.length === 0) {
            alert('暂无用户数据');
            return;
        }

        let userListStr = '已注册用户列表：\n';
        userList.forEach((username, index) => {
            userListStr += `${index + 1}. ${username}\n`;
        });

        alert(userListStr);
    }

    // 添加快捷键事件监听
    document.addEventListener('keydown', (event) => {
        // 检查是否同时按下了alt和F9
        if (event.altKey && event.key === 'F9') {
            event.preventDefault(); // 阻止默认行为
            showAllUsers();
        }
    });
});

