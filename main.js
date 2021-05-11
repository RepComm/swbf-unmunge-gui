
const { app, BrowserWindow, ipcMain } = require('electron');

const path = require('path');

const { dialog } = require('electron');

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
})

function selectFiles () {
  dialog.showOpenDialog({
    properties: [
      "openFile",
      "multiSelections"
    ]
  }).then((value=>{
    // value.filePaths
    let jsonString = JSON.stringify({
      status: "success",
      type: "select-files-response",
      result: {
        filePaths: value.filePaths
      }
    });
    win.webContents.send("main", jsonString);
  }));
}

function unknownAction (type) {
  let jsonString = JSON.stringify({
    status: "failure",
    type: type,
    message: `Unknown action: '${type}'`
  });
  win.webContents.send("main", jsonString);
}

function badJson (msg) {
  let jsonString = JSON.stringify({
    type: "bad-action",
    status: "failure",
    message: `Couldn't parse json from: '${msg}'`
  });
  win.webContents.send("main", jsonString);
}

//Receive commands from web page here
ipcMain.on("main", (event, args) => {
  let msg;
  try {
    msg = JSON.parse(args);
  } catch (ex) {
    badJson(args);
  }

  switch (msg.type) {
    case "select-files":
      selectFiles();
      break;
    default:
      unknownAction(msg.type);
      break;
  }
});