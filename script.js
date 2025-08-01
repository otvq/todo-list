document.addEventListener('DOMContentLoaded', () => {
    // 获取所有需要的DOM元素
    const loginView = document.getElementById('login-view');
    const appView = document.getElementById('app-view');
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username-input');
    const logoutBtn = document.getElementById('logout-btn');
    
    const welcomeMessage = document.getElementById('welcome-message');
    const addTodoForm = document.getElementById('add-todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const completedList = document.getElementById('completed-list');

    let currentUser = null;
    let todos = [];

    // --- 登录/登出逻辑 ---

    // 页面加载时检查是否已经 "登录"
    function checkLoginStatus() {
        const username = localStorage.getItem('currentUser');
        if (username) {
            currentUser = username;
            loadUserView();
        } else {
            showLoginView();
        }
    }

    function handleLogin() {
        const username = usernameInput.value.trim();
        if (username) {
            currentUser = username;
            localStorage.setItem('currentUser', username);
            loadUserView();
        } else {
            alert('请输入用户名！');
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

    // 从 localStorage 加载指定用户的待办事项
    function loadTodos() {
        const userTodos = localStorage.getItem(`todos_${currentUser}`);
        todos = userTodos ? JSON.parse(userTodos) : [];
        renderTodos();
    }

    // 将当前待办事项保存到 localStorage
    function saveTodos() {
        localStorage.setItem(`todos_${currentUser}`, JSON.stringify(todos));
    }

    // 渲染待办事项到页面
    function renderTodos() {
        todoList.innerHTML = '';
        completedList.innerHTML = '';

        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.textContent = todo.text;
            if (todo.completed) {
                li.classList.add('completed');
            }

            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('actions');

            // 完成/撤销按钮
            const completeBtn = document.createElement('button');
            completeBtn.classList.add('complete-btn');
            completeBtn.innerHTML = todo.completed ? '&#x21A9;' : '&#x2714;'; // 撤销图标 vs 对号图标
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
            todos.push({ text: text, completed: false });
            saveTodos();
            renderTodos();
            todoInput.value = '';
        }
    }

    // 切换待办事项的状态（完成/待办）
    function toggleTodoStatus(index) {
        todos[index].completed = !todos[index].completed;
        saveTodos();
        renderTodos();
    }

    // 删除一个待办事项
    function deleteTodo(index) {
        // 从数组中移除指定索引的元素
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
});