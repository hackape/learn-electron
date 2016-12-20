const { app, BrowserWindow, Menu, shell } = require('electron');

let menu;
let template;
let mainWindow;
let menuContext = { app, shell }

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support'); // eslint-disable-line
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')(); // eslint-disable-line global-require
  const path = require('path'); // eslint-disable-line
  const p = path.join(__dirname, '..', 'app', 'node_modules'); // eslint-disable-line
  require('module').globalPaths.push(p); // eslint-disable-line
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

const openWindow = () => {
  if (mainWindow) return mainWindow
  let windowInstance = new BrowserWindow({
    show: false,
    width: 1280,
    height: 800
  });

  windowInstance.loadURL(`file://${__dirname}/app.html`);

  windowInstance.webContents.on('did-finish-load', () => {
    windowInstance.show();
    windowInstance.focus();
  });

  windowInstance.on('closed', () => {
    mainWindow = null;
  });

  return windowInstance
}

app.on('activate', () => {
  menuContext.mainWindow = mainWindow = openWindow()
})

app.on('ready', () => {
  menuContext.mainWindow = mainWindow = openWindow()
  template = require('./menu')(menuContext);
  menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});
