
const { app, BrowserWindow, ipcMain } = require('electron');

const path = require('path');

const { dialog } = require('electron');

const spawn = require('child_process').spawn;
const readline = require('readline');

let win;

function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

//Receive commands from web page here
ipcMain.handle("main", async (event, msg) => {
  let result = null;
  let json;
  try {
    json = JSON.parse(msg);
  } catch {
    return result;
  }

  //Handle the message
  let jsonString;

  switch (json.type) {
    case "select-files":
      let openResult0 = await dialog.showOpenDialog({
        properties: [
          "openFile",
          "multiSelections"
        ]
      });
      jsonString = JSON.stringify({
        status: "success",
        type: "select-files-response",
        result: {
          filePaths: openResult0.filePaths
        }
      });
      return jsonString;
      break;
    case "select-file-swbfunmunge":
      let openResult1 = await dialog.showOpenDialog({
        properties: [
          "openFile"
        ],
        title: "Locate swbf-unmunge"
      });
      jsonString = JSON.stringify({
        status: "success",
        type: "select-file-swbfunmunge-response",
        result: {
          filePaths: openResult1.filePaths
        }
      });
      return jsonString;
    case "unmunge":
      let unmungePath = json.unmunge.path || ".\\swbf-unmunge.exe";
      let unmungeArgs = json.unmunge.args;

      const unmunge = spawn(unmungePath, unmungeArgs.split(" "));

      const rl = readline.createInterface({
        input: unmunge.stdout,
        // output: unmunge.stdout,
        terminal: false
      });

      rl.on('line', (line)=> {
        // let str = data.toString("utf8");
        // win.webContents.send("main-log", str);
        win.webContents.send("main-log", line);
      });

      // unmunge.stdout.on('data', (data) => {
      //   let str = data.toString("utf8");
      //   win.webContents.send("main-log", str);
      // });

      // unmunge.stderr.on('data', (data) => {
      //   let str = data.toString("utf8");
      //   win.webContents.send("main-log", str);
      // });

      unmunge.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
      });
      return JSON.stringify({});
      break;
    default:
      jsonString = JSON.stringify({
        status: "failure",
        type: msg.type,
        message: `Unknown action: '${type}'`
      });
      return jsonString;
      break;
  }
});