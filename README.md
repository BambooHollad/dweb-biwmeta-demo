## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

## manifest.json文件说明
该文件是项目在应用的配置文件，字段固定，展示资源根据项目需要调整
需要注意的是 "id"字段 (id).dweb 需要保持跟 "home" 和 "homepage_url"一直：https://www.(id)

## plaoc.json
该文件是dweb加载项目资源的配置文件，不同项目由于打包后目录结构不同以及资源位置不同，不能通用，需要根据项目进行配置

## 打包dweb格式

确认 @plaoc/cli 跟 @plaoc/plugins 项目内的是同一个版本，目前最新都是1.0.5，以npm上为准

安装打包插件（如果已经安装就忽略）
```sh
npm i -g @plaoc/cli@[跟项目内的 "@plaoc/plugins" 同一个版本号]
```

编译打包项目

```sh 正式
npm run build
```

```sh 测试
npm run build:dev 
```

将编译好的项目打包成dweb应用格式
```sh 
npm run bundle
```

打包结束会在bundle/dweb下生成2个文件，将2个文件交付给商城管理员即可上架



