const remote = require('@electron/remote')
const dialog = remote.dialog

const form = document.getElementById('form')
const input = document.getElementById('input')
const title = document.getElementById('titles')
const todosUL = document.getElementById('todos')
const myAudio = document.getElementById('myAudio')
const showCompleted = document.getElementById('showCompleted')

showCompletedTodos()

showCompleted.addEventListener('change', (e) => {
  showCompletedTodos()
})

function showCompletedTodos(todoEl = null) {
  let todos = document.querySelectorAll('li')

  if (todoEl != null) {
    console.log('设置信息: ', todoEl)
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
const todos = JSON.parse(localStorage.getItem('todos'))

// 如果有todos，就添加到页面上
if (todos) {
  todos.forEach(todo => addTodo(todo))
}

// 提交表单
form.addEventListener('submit', (e) => {
  e.preventDefault()
  addTodo()
})

function addTodo(todo) {
  let todoText = input.value
  let num = 0
  if (todo) {
    todoText = todo.text.split('(')[0]
    num = todo.num
  }

  if (todoText) {
    const todoEl = document.createElement('li')
    const todoSpan = document.createElement('span')
    const todoBtn = document.createElement('button')

    todoBtn.innerText = '小番茄'

    todoEl.appendChild(todoSpan)
    todoEl.appendChild(todoBtn)

    todoBtn.addEventListener('click', (event) => {
      // 阻止事件冒泡
      event.stopPropagation()
      form.style.display = 'none';
      title.innerText = '25:00';
      startCountdown(title, 25 * 60, todoSpan);
    })

    if (todo && todo.completed) {
      todoEl.classList.add('completed')
    }

    todoSpan.innerText = `${todoText}(${num})`;
    todoSpan.dataset.num = num

    todoEl.addEventListener('click', () => {
      todoEl.classList.toggle('completed')
      showCompletedTodos(todoEl)
      updateLS()
    })

    todoEl.addEventListener('contextmenu', (e) => {
      e.preventDefault()

      dialog.showMessageBox({ // 弹出对话框
        type: 'info',
        title: '提示',
        message: '您确认删除该任务吗',
        buttons: ['确定', '取消']
      }).then(result => {
        console.log(result.response)
        // 返回值是上面的buttons的下标,代表点击了哪个按钮,根据按钮的下标做相应的操作
        if (result.response == 0) {
          todoEl.remove()
          updateLS()
        }
      })
    })

    todosUL.appendChild(todoEl)

    input.value = ''

    updateLS()
  }
}

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

function updateLS() {
  todosEl = document.querySelectorAll('span')
  const todos = []

  todosEl.forEach(todoEl => {
    console.log('todoEl: ', todoEl)
    console.log('todoEl.innerText: ', todoEl.innerText)
    console.log('todoEl.num: ', todoEl.dataset.num)
    todos.push({
      text: todoEl.innerText,
      completed: todoEl.classList.contains('completed'),
      num: todoEl.dataset.num
    })
  })

  localStorage.setItem('todos', JSON.stringify(todos))
}
