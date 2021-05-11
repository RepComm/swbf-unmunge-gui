
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

//Receive commands from web page here
ipcMain.on("toMain", (event, args) => {
  
  // win.webContents.send("fromMain", "main response");

  // win.webContents.send("fromMain", `main response, event: ${event}, args: ${args}`);

  dialog.showOpenDialog({
    properties: [
      "openFile",
      "multiSelections"
    ]
  }).then((value=>{
    // value.filePaths
    win.webContents.send("fromMain", value.filePaths.join(", "));
  }));

});