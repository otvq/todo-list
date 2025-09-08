document.addEventListener('DOMContentLoaded', () => {

    // --- 帮助函数 ---
    function formatDateTime(isoStr) {
        if (!isoStr) return '';
        const date = new Date(isoStr);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }

    function formatDate(date) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    /**
     * 导师提示：这是一个新的帮助函数，用于确定一个日期所在周的开始和结束。
     * 我们定义一周从周一开始。
     * @param {string | Date} dateInput - 日期字符串或对象
     * @returns {object} 包含周开始日期、结束日期和唯一标识符的对象
     */
    function getWeekInfo(dateInput) {
        const date = new Date(dateInput);
        date.setHours(0, 0, 0, 0); // 标准化时间
        const day = date.getDay(); // Sunday: 0, Monday: 1, ..., Saturday: 6
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // 计算到周一的偏移
        const monday = new Date(date.setDate(diff));
        
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        return {
            start: monday,
            end: sunday,
            key: formatDate(monday) // 使用周一的日期作为唯一的 key
        };
    }

    // --- DOM 元素 ---
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
    
    // 导师提示：我们现在获取的是容器，而不是旧的 ul 元素
    const completedContainer = document.getElementById('completed-container');

    // 详情弹窗
    const detailModal = document.getElementById('detail-modal');
    const detailTextarea = document.getElementById('detail-textarea');
    const saveDetailBtn = document.getElementById('save-detail-btn');
    const closeDetailBtn = document.getElementById('close-detail-btn');

    // 编辑弹窗
    const editModal = document.getElementById('edit-modal');
    const editInput = document.getElementById('edit-input');
    const saveEditBtn = document.getElementById('save-edit-btn');
    const closeEditBtn = document.getElementById('close-edit-btn');
    
    // --- 状态变量 ---
    let editingIndex = null;
    let editingTitleIndex = null;
    let currentUser = null;
    let todos = [];

    // --- 登录逻辑 (未改变) ---
    function checkLoginStatus() {
        const username = localStorage.getItem('currentUser');
        if (username) {
            currentUser = username;
            loadUserView();
        } else {
            showLoginView();
        }
    }

    function hashPassword(password) {
        return password.split('').reduce((acc, char) => {
            let hash = ((acc << 5) - acc) + char.charCodeAt(0);
            return hash & hash;
        }, 0).toString();
    }

    function saveUser(username, passwordHash) {
        const users = JSON.parse(localStorage.getItem('users')) || {};
        users[username] = passwordHash;
        localStorage.setItem('users', JSON.stringify(users));
    }

    function validateUser(username, password) {
        const users = JSON.parse(localStorage.getItem('users')) || {};
        const storedHash = users[username];
        if (!storedHash) return null;
        return storedHash === hashPassword(password);
    }

    function handleLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        if (!username || !password) {
            alert('请输入用户名和密码！');
            return;
        }
        const isValid = validateUser(username, password);
        if (isValid === true) {
            currentUser = username;
            localStorage.setItem('currentUser', username);
            loadUserView();
        } else if (isValid === null) {
            if (confirm('该用户不存在，是否创建新用户？')) {
                saveUser(username, hashPassword(password));
                currentUser = username;
                localStorage.setItem('currentUser', username);
                loadUserView();
            }
        } else {
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

    /**
     * 导师提示：创建单个任务li元素的代码被提取到了这里，以便复用。
     * 这样 renderTodos 函数就能更专注于布局和分组逻辑。
     * @param {object} todo - 任务对象
     * @param {number} index - 任务在主 `todos` 数组中的索引
     * @returns {HTMLLIElement} - 构建好的 li 元素
     */
    function createTodoElement(todo, index) {
        const li = document.createElement('li');
        if (todo.completed) li.classList.add('completed');

        const textSpan = document.createElement('span');
        textSpan.textContent = todo.text;
        li.appendChild(textSpan);

        if (todo.details) {
            const detailsPreview = document.createElement('div');
            detailsPreview.className = 'details-preview';
            detailsPreview.textContent = '详情: ' + todo.details.slice(0, 20) + (todo.details.length > 20 ? '...' : '');
            li.appendChild(detailsPreview);
        }

        const timeInfo = document.createElement('div');
        timeInfo.className = 'time-info';
        const createdStr = `创建: ${formatDateTime(todo.createdAt)}`;
        let completedStr = '';
        if (todo.completed && todo.completedAt) {
            completedStr = `，完成: ${formatDateTime(todo.completedAt)}`;
        }
        timeInfo.textContent = createdStr + completedStr;
        li.appendChild(timeInfo);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('actions');

        const completeBtn = document.createElement('button');
        completeBtn.classList.add('complete-btn');
        completeBtn.innerHTML = todo.completed ? '&#x21A9;' : '&#x2714;';
        completeBtn.title = todo.completed ? '撤销' : '完成';
        completeBtn.onclick = () => toggleTodoStatus(index);

        const detailBtn = document.createElement('button');
        detailBtn.classList.add('detail-btn');
        detailBtn.innerHTML = '&#x1F4DD;';
        detailBtn.title = '编辑详情';
        detailBtn.onclick = () => showDetailsModal(index);

        const editBtn = document.createElement('button');
        editBtn.classList.add('edit-btn');
        editBtn.innerHTML = '&#x270E;';
        editBtn.title = '修改任务';
        editBtn.onclick = () => showEditModal(index);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = '删除';
        deleteBtn.onclick = () => deleteTodo(index);

        actionsDiv.appendChild(completeBtn);
        actionsDiv.appendChild(detailBtn);
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        li.appendChild(actionsDiv);

        return li;
    }

    /**
     * 导师提示：这是重构后的核心渲染函数。
     */
    function renderTodos() {
        todoList.innerHTML = '';
        completedContainer.innerHTML = '';

        const pendingTodos = [];
        const completedTodos = [];

        todos.forEach((todo, index) => {
            if (todo.completed) {
                completedTodos.push({ ...todo, originalIndex: index });
            } else {
                pendingTodos.push({ ...todo, originalIndex: index });
            }
        });

        // 渲染待办事项
        pendingTodos.forEach(item => {
            const li = createTodoElement(item, item.originalIndex);
            todoList.appendChild(li);
        });

        // 渲染已完成事项（按周分组）
        if (completedTodos.length > 0) {
            // 按完成时间倒序排列
            completedTodos.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

            const weeklyGroups = {};
            completedTodos.forEach(item => {
                const week = getWeekInfo(item.completedAt);
                if (!weeklyGroups[week.key]) {
                    weeklyGroups[week.key] = {
                        info: week,
                        tasks: []
                    };
                }
                weeklyGroups[week.key].tasks.push(item);
            });
            
            // 按周的开始日期倒序排列，确保最新的周显示在最上面
            const sortedGroupKeys = Object.keys(weeklyGroups).sort((a,b) => new Date(b) - new Date(a));

            sortedGroupKeys.forEach(key => {
                const group = weeklyGroups[key];
                
                // 创建周标题
                const header = document.createElement('h3');
                header.className = 'week-header';
                const startStr = formatDate(group.info.start).substring(5); // M-D
                const endStr = formatDate(group.info.end).substring(5);   // M-D
                header.textContent = `完成于 ${startStr} 至 ${endStr}`;
                completedContainer.appendChild(header);

                // 创建该周的任务列表
                const weekUl = document.createElement('ul');
                group.tasks.forEach(item => {
                    const li = createTodoElement(item, item.originalIndex);
                    weekUl.appendChild(li);
                });
                completedContainer.appendChild(weekUl);
            });
        }
    }

    function addTodo(event) {
        event.preventDefault();
        const text = todoInput.value.trim();
        if (text) {
            todos.push({
                text: text,
                details: '',
                completed: false,
                createdAt: new Date().toISOString(),
                completedAt: null
            });
            saveTodos();
            renderTodos();
            todoInput.value = '';
        }
    }

    function toggleTodoStatus(index) {
        const todo = todos[index];
        todo.completed = !todo.completed;
        todo.completedAt = todo.completed ? new Date().toISOString() : null;
        saveTodos();
        renderTodos();
    }

    function deleteTodo(index) {
        todos.splice(index, 1);
        saveTodos();
        renderTodos();
    }

    // --- 详情弹窗 (未改变) ---
    function showDetailsModal(index) {
        editingIndex = index;
        detailTextarea.value = todos[index].details || '';
        detailModal.style.display = 'flex';
    }

    function closeDetailsModal() {
        detailModal.style.display = 'none';
        editingIndex = null;
    }

    saveDetailBtn.addEventListener('click', () => {
        if (editingIndex !== null) {
            todos[editingIndex].details = detailTextarea.value.trim();
            saveTodos();
            renderTodos();
            closeDetailsModal();
        }
    });

    closeDetailBtn.addEventListener('click', closeDetailsModal);
    detailModal.addEventListener('click', (e) => { if (e.target === detailModal) closeDetailsModal(); });

    // --- 编辑弹窗 (未改变) ---
    function showEditModal(index) {
        editingTitleIndex = index;
        editInput.value = todos[index].text;
        editModal.style.display = 'flex';
    }

    function closeEditModal() {
        editModal.style.display = 'none';
        editingTitleIndex = null;
    }

    saveEditBtn.addEventListener('click', () => {
        if (editingTitleIndex !== null) {
            const newText = editInput.value.trim();
            if (newText) {
                todos[editingTitleIndex].text = newText;
                saveTodos();
                renderTodos();
                closeEditModal();
            }
        }
    });

    closeEditBtn.addEventListener('click', closeEditModal);
    editModal.addEventListener('click', (e) => { if (e.target === editModal) closeEditModal(); });

    // --- 事件监听 ---
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    addTodoForm.addEventListener('submit', addTodo);

    // --- 初始化 ---
    checkLoginStatus();
});
