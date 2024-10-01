const { app, BrowserWindow } = require('electron')

// 当app准备好就执行创建一个窗口
app.on('ready', () => {
  // 创建窗口(下面的配置在上面讲过了,这里就删掉了,只留下三个)
  let win = new BrowserWindow({
    width: 800,
    height: 600, //长宽
    autoHideMenuBar: true, //只保留标题，不保留其他的选项卡部分,也是隐藏菜单栏意思
  })

  win.on('close', () => {
    // 从性能考虑,应该释放窗体这个变量,删除窗体引用
    win = null
  })

  win.loadFile('./pages/index.html') // loadFile就是加载本地页面的,loadURL加载的是在线链接
})
