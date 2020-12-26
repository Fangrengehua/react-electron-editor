//client
import React from 'react'
import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { AttachAddon } from 'xterm-addon-attach'

export default class XTerm extends React.PureComponent {
  // socket = null;
  // term = null;
  constructor(props) {
    super(props);
    this.terminal = React.createRef()
    this.props.onRef && this.props.onRef(this)
    this.layout.bind(this)
  }
  componentDidMount() {
    //建立socket连接 
    this.initWebSocket()
  }
  initWebSocket() {
    let proto = window.location.protocol === "http:" ? "ws://" : "wss://"
    var socket = this.socket = new WebSocket(proto + this.props.host);
    this.socketOnOpen();
    this.socketOnError();
    return socket;
  }
  initTerm() {
    const term = this.term = new Terminal({
      fontSize: 14,
      cursorBlink: true,
    });
    const attachAddon = new AttachAddon(this.socket);
    const fitAddon = this.fitAddon = new FitAddon();
    term.loadAddon(attachAddon);
    term.loadAddon(fitAddon);
    term.open(this.terminal.current);
    fitAddon.fit();
    term.focus();
    return this.term;
  }
  layout() {
    this.fitAddon.fit()
  }
  socketOnOpen() {
    this.socket.onopen = () => {
      console.log("Success connecting!");
      //socket连接成功后初始化终端编辑器
      this.initTerm()
    }
  }
  socketOnClose() {
    this.socket.onclose = () => {
      console.log('close socket')
    }
  }
  socketOnError() {
    this.socket.onerror = () => {
      console.log('socket 连接失败')
    }
  }
  componentWillUnmount() {
    this.socketOnClose();
    this.term.dispose()
  }
  render() {
    return (
      <div id="terminal" ref={this.terminal}></div>
    )
  }
}