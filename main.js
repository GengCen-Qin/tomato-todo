const { app, BrowserWindow, Menu, globalShortcut } = require('electron')

let win = null
// 使用remote模块
require('@electron/remote/main').initialize()
// 创建窗口
function createWindow() {
  // 创建窗口(下面的配置在上面讲过了,这里就删掉了,只留下三个)
  win = new BrowserWindow({
    width: 800,
    height: 600, //长宽
    autoHideMenuBar: true, //只保留标题，不保留其他的选项卡部分,也是隐藏菜单栏意思
    webPreferences: {
      nodeIntegration: true,  // 配置这三个选项就可以实现在渲染进程使用nodejs的api调用
      contextIsolation: false,
      enableRemoteModule: true
    }
  })

  // 创建菜单
  const menuTemplate = [
    {
      label: '页面',
      submenu: [
        {
          label: '任务页',
          type: 'radio',
          click: () => {
            win.loadFile('./pages/index.html'); // 路由到任务页
          },
        },
        {
          label: '统计页',
          type: 'radio',
          click: () => {
            win.loadFile('./pages/echart.html'); // 路由到统计页
          },
        },
      ],
    },
  ];
  // 2.依据上述的数据创建一个menu
  let menu = Menu.buildFromTemplate(menuTemplate)
  // 3.将上述菜单添加至app身上
  Menu.setApplicationMenu(menu)

  // 使用remote模块
  require("@electron/remote/main").enable(win.webContents)

  win.on('close', () => {
    // 从性能考虑,应该释放窗体这个变量,删除窗体引用
    win = null
  })
  win.loadFile('./pages/index.html') // loadFile就是加载本地页面的,loadURL加载的是在线链接
}



// 当app准备好就执行创建一个窗口
app.on('ready', () => {
  createWindow()
  // 监听应用被激活
  app.on('activate', () => {
    // 当应用激活后,窗口数量为0时,重新创建一个窗口(mac使用,在windows和Linux窗口为0直接退出了)
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  globalShortcut.register(process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I', () => {
    win.webContents.openDevTools();
  })
})
/// 监听所有窗口都被关闭事件
app.on('window-all-closed', () => {
  // 不是mac系统就执行退出
  if (process.platform !== 'darwin') app.quit()
})
