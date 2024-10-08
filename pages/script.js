console.log('page render');

const remote = require('@electron/remote')
const dialog = remote.dialog

const {v4: uuidv4} = require('uuid')

const form = document.getElementById('form')
const input = document.getElementById('input')
const title = document.getElementById('titles')
const todosToday = document.getElementById('todosToday')
const todosBefore = document.getElementById('todosBefore')
const myAudio = document.getElementById('myAudio')
const showCompleted = document.getElementById('showCompleted')
const myModal = document.getElementById('myModal')
const editForm = document.getElementById('editForm')
const editTitle = document.getElementById('editTitle')
const editNote = document.getElementById('editNote')
const saveBtn = document.getElementById('saveBtn')
const cancelBtn = document.getElementById('cancelBtn')

let currentEditTodoId = null

showCompletedTodos()

showCompleted.addEventListener('change', (e) => {
  showCompletedTodos()
})

function showCompletedTodos(todoEl = null) {
  let todos = document.querySelectorAll('li')

  if (todoEl != null) {
    todos = [todoEl]
  }

  todos.forEach(todo => {
    if (showCompleted.checked) {
      todo.style.display = 'flex'
    } else {
      if (todo.classList.contains('completed')) {
        todo.style.display = 'none'
      } else {
        todo.style.display = 'flex'
      }
    }
  })
}

// 上一次的定时器
let lastInterval = null

// 序列化后的todos

const todos = getTodos()

function getTodos() {
  // TODO: 允许使用文件系统存储
  return JSON.parse(localStorage.getItem('todos'))
}

function getTodosById(id) {
  let todos = getTodos()
  return todos.find(item => item.id == id)
}

// 如果有todos，就添加到页面上
if (todos) {
  todos.forEach(todo => addTodo(todo))
}

// 提交表单
form.addEventListener('submit', (e) => {
  e.preventDefault()
  addTodo()
})

// 添加todo
function addTodo(todo) {
  let todoText = input.value
  let num = 0
  let todoDate = new Date()
  let completed = false
  let note = ''
  // 设置唯一ID
  let id = uuidv4();

  if (todo) {
    todoText = todo.text
    num = todo.num
    completed = todo.completed === 'true' ? true : false
    todoDate = new Date(todo.date)
    note = todo.note || ''
    id = todo.id || uuidv4()
  }

  if (todoText) {
    const todoEl = document.createElement('li')
    const todoSpan = document.createElement('span')
    const todoBtn = document.createElement('button')

    const todoComplete = document.createElement('input')
    todoComplete.type = 'checkbox'
    todoComplete.checked = completed

    todoBtn.innerText = '小番茄'

    todoSpan.innerText = `${todoText}(${num})`;
    todoSpan.dataset.num = num
    todoSpan.dataset.date = todoDate
    todoSpan.dataset.completed = completed
    todoSpan.dataset.note = note
    todoSpan.dataset.id = id
    todoSpan.dataset.text = todoText

    todoEl.appendChild(todoComplete)
    todoEl.appendChild(todoSpan)
    todoEl.appendChild(todoBtn)

    todoSpan.addEventListener('click', (e) => {
      myModal.style.display = 'block';
      currentEditTodoId = id
      console.log('当前展示ID: ', id);

      tmp_node = getTodosById(id)
      editTitle.value = tmp_node.text
      editNote.value = tmp_node.note
    })

    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault()
      myModal.style.display = 'none';
      editTitle.value = ''
      editNote.value = ''
      currentEditTodoId = null
    })

    saveBtn.addEventListener('click', function (e) {
      e.preventDefault()

      let todos = getTodos()
      current = todos.find(element => element.id == currentEditTodoId)
      current.text = editTitle.value
      current.note = editNote.value
      setTodos(todos)

      // 刷新页面
      location.reload()
    })

    // 番茄钟点击事件
    todoBtn.addEventListener('click', (event) => {
      // 阻止事件冒泡
      event.stopPropagation()
      form.style.display = 'none';
      title.innerText = '25:00';
      startCountdown(title, 25 * 60, todoSpan);
    })

    // 设置完成样式
    if (todo && completed) {
      todoEl.classList.add('completed')
    }

    todoComplete.addEventListener(
      'change', (e) => {
        todoSpan.dataset.completed = e.target.checked
        todoEl.classList.toggle('completed')
        showCompletedTodos(todoEl)
        updateLS()
      }
    )

    // 任务右击删除
    todoEl.addEventListener('contextmenu', (e) => {
      e.preventDefault()

      dialog.showMessageBox({ // 弹出对话框
        type: 'info',
        title: '提示',
        message: '您确认删除该任务吗',
        buttons: ['确定', '取消']
      }).then(result => {
        // 返回值是上面的buttons的下标,代表点击了哪个按钮,根据按钮的下标做相应的操作
        if (result.response == 0) {
          todoEl.remove()
          updateLS()
        }
      })
    })

    // 区分历史任务
    if (todoDate.toDateString() === new Date().toDateString()) {
      todosToday.appendChild(todoEl);
    } else {
      todosBefore.appendChild(todoEl);
    }

    // 输入框清空
    input.value = ''

    // 更新本地存储
    updateLS()
  }
}

// 开启定时器
function startCountdown(element, seconds, todoSpan) {
  if (lastInterval) {
    clearInterval(lastInterval)
  }

  var intervalId = setInterval(function () {
    seconds -= 1200;
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;
    element.textContent = minutes + ':' + (remainingSeconds < 10 ? '0' : '') + remainingSeconds;
    if (seconds <= 0) {
      clearInterval(intervalId);
      document.getElementById('form').style.display = 'block';
      element.innerText = 'todos';
      myAudio.play();
      todoSpan.dataset.num = parseInt(todoSpan.dataset.num) + 1
      todoSpan.innerText = `${todoSpan.innerText.split('(')[0]}(${todoSpan.dataset.num})`
      updateLS()
      new window.Notification('时间到', {
        body: '您的番茄钟时间到了！',
      });
    }
  }, 1000);

  lastInterval = intervalId
}

// 更新本地存储
function updateLS() {
  let todosEl = document.querySelectorAll('span')
  console.log('updat data: ', todosEl)
  const todos = []

  todosEl.forEach(todoEl => {
    todos.push({
      text: todoEl.dataset.text,
      completed: todoEl.dataset.completed,
      num: todoEl.dataset.num,
      date: todoEl.dataset.date,
      note: todoEl.dataset.note,
      id: todoEl.dataset.id
    })
  })
  setTodos(todos)
}

function setTodos(todos) {
  console.log('set-todos: ', todos);
  localStorage.setItem('todos', JSON.stringify(todos))
}
