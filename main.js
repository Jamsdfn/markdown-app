const { BrowserWindow, ipcMain } = require('electron')
const { app } = require('electron')
const path = require('path')

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
        title: 'Editor',
        // webPreferences: {
        //     nodeIntegration: true
        //     // preload: path.resolve(__dirname, '../utils/contextBridge.js')
        // },
        icon: path.resolve(__dirname, './public/logo192.png')
    })

    if (isDevelopment) {
        mainWindow.loadURL('http://localhost:3000/')
    } else {
        const entryPath = path.resolve(__dirname, '../../build/index.html')
        mainWindow.loadFile(entryPath)
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })
    mainWindow.webContents.openDevTools()
}

app.on('ready', () => {
    createMainWindow()
})
