## 简介

本项目通过基础的HTML，CSS，JS编写任务管理页面，再通过Electron生成应用程序。

番茄钟默认25分钟一个(可自定义)，并且每个番茄钟必须绑定到一个任务上，因为如果你没有一个明确的目标，那这个番茄钟是不稳定的。当番茄钟执行完毕后，会进行消息通知，并附带音效

每个任务会记录：是否完成，执行番茄数量(衡量对任务的拆分)，创建时间

通过echart来进行简单的统计输出，这一周每天完成的番茄数量，目前可通过菜单栏进行切换页面

## 脚本

1. `yarn dev` 开发模式，会进行热更新
2. `yarn make` 打包
