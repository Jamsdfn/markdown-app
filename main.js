const { BrowserWindow, ipcMain } = require('electron')
const { app, dialog } = require('electron')
const path = require('path')
const remote = require('@electron/remote/main')
const ElectronStore = require('electron-store');

const isDevelopment = process.env.NODE_ENV === 'development'
let mainWindow = null

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1160,
        height: 752,
        minHeight: 632,
        minWidth: 960,
        show: false,
        // frame: false,
        title: 'Markdown Editor',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
            // preload: path.resolve(__dirname, '../utils/contextBridge.js')
        },
        icon: path.join(__dirname, './assets/appdmg.png')
    })

    if (isDevelopment) {
        mainWindow.loadURL('http://localhost:3000/')
    } else {
        const entryPath = path.join(__dirname, './build/index.html')
        mainWindow.loadFile(entryPath)
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })
    remote.initialize()
    remote.enable(mainWindow.webContents)
    if (isDevelopment) mainWindow.webContents.openDevTools()
}

app.on('ready', () => {
    createMainWindow()
    ElectronStore.initRenderer()
    ipcMain.handle('choose-file', async (event, args) => {
        const res = await dialog.showOpenDialog(args)
        return res
    })
})
