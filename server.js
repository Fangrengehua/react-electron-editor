const pty = require('node-pty');
const os = require('os');
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
const wsServer = require('ws').Server;

var wss = new wsServer({ port:8080 });
//server
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
        //console.log(message)
        ptyProcess.write(message)
    });
    //发送数据
    ptyProcess.on('data',data=>{
        //process.stdout.write(data);
        ws.send(data)
    });
});
