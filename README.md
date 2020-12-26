# react-terminal1安装与使用

基于react、xterm.js、websocket开发的网页终端组件，使本地终端可以在网页运行

## installation
`npm install react-terminal1`

## Dependencies

详见 [node-pty](https://www.npmjs.com/package/node-pty) 中对开发环境的要求

![环境要求](./dependencies.jpg "可选标题")

## Usage

- 配置项：

    (string) host：hostname + port     (默认为 'localhost:3000')
    
测试运行前请先启动server

**server.js**  `node server.js`

```
const pty = require('node-pty');
const os = require('os');
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
const wsServer = require('ws').Server;

var wss = new wsServer({ port:8080 }); //server监听8080端口，端口号可自行指定

wss.on('connection', (ws) => {
    console.log('socket connection success');
    const ptyProcess = pty.spawn(shell,[], {
        name: 'xterm-256color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    });
    //接受数据
    ws.on('message', (message) => {
        ptyProcess.write(message)
    });
    //发送数据
    ptyProcess.on('data',data=>{
        ws.send(data)
    });
});

```

## API

通过指定 **onRef** 属性获取到组件实例，在组件实例上，提供了一个使终端适应容器大小的API `layout()`

    eg:
    <Terminal host="localhost:8080" onRef={(ref) => { this.terminal = ref; }} />
    
    API调用：this.terminal.layout() 返回值：void
    
    
## example

```
import React from 'react'
import Terminal from 'react-terminal1'

export default class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isShowTerminal:false,
    }
  }
  componentDidMount() {
    const _this = this;
    window.onresize = function () {
      if (_this.terminal) {
        _this.terminal.layout()
      }
    }
    document.onkeydown = function () {
      var oEvent = window.event;
      if (oEvent.keyCode === 192 && oEvent.ctrlKey) {
        if (_this.state.isShowTerminal) { //显示
          _this.setState({ isShowTerminal: false })
        } else { //关闭
          _this.setState({ isShowTerminal: true })
        }
        oEvent.preventDefault();
      }
    }
  }
  verticalResize(e, minHeight, maxHeight) {
    const _this = this;
    var bottomDiv = document.getElementById('terminal-container')
    var vResizeDiv = document.querySelector('.v-resize')
    var bottomDivHeight = bottomDiv.offsetHeight

    var startY = e.clientY
    document.onmousemove = function (e) {
      e.preventDefault()
      var distY = Math.abs(e.clientY - startY)
      if (e.clientY < startY) {
        bottomDiv.style.height = bottomDivHeight + distY + 'px'
        vResizeDiv.style.bottom = bottomDivHeight + distY + 'px'
      }
      if (e.clientY > startY) {
        bottomDiv.style.height = (bottomDivHeight - distY) + 'px'
        vResizeDiv.style.bottom = (bottomDivHeight - distY) + 'px'
      }
      // 最大高度，也可以通过css  max-height设置
      if (parseInt(bottomDiv.style.height) >= maxHeight) {
        bottomDiv.style.height = maxHeight + 'px'
        vResizeDiv.style.bottom = maxHeight + 'px'
      }
      if (parseInt(bottomDiv.style.height) <= minHeight) {
        bottomDiv.style.height = minHeight + 'px'
        vResizeDiv.style.bottom = minHeight + 'px'
      }
      if (_this.tab_control.monaco.current) {
        _this.tab_control.monaco.current.editor.layout()
      }
      if (_this.terminal) {
         _this.terminal.layout()
      }
    }
    document.onmouseup = function () {
      document.onmousemove = null
    }
  }
  closeTerminal() {
    document.getElementById('terminal-container').style.visibility = 'hidden'
    document.querySelector('.v-resize').style.visibility = 'hidden'
  }
  render() {
    return (
      <div className="App">
        <div className="right">
          <div className="v-resize"
            onMouseDown={event => { this.verticalResize(event, 200, 800) }}
            style={this.state.isShowTerminal ? { visibility: "visible" } : { visibility: "hidden" }} 
          ></div>
           <div id="terminal-container"
            style={this.state.isShowTerminal ? { visibility: "visible" } : { visibility: "hidden" }} >
              <div className="showBtn">
                  <span onClick={() => {
                      this.closeTerminal()
                  }}> 关闭终端 </span>
              </div>
              <Terminal host="localhost:8080" onRef={(ref) => { this.terminal = ref; }} />
            </div>
          </div>
      </div>
    );
  }
}
```
    

