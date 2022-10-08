const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;
//Create the Main Window
createMainWindow = () => {
        mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: isDev ? 600 : 400,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    //Open DevTools if in Dev Environment
    if (isDev){
        mainWindow.webContents.openDevTools();
    }
    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

//Create About Window
createAboutWindow = () => {
    const aboutWindow = new BrowserWindow({
        title: 'About Image Resizer',
        width: 400,
        height: 300
    });

    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}
//When the app is ready, it is going to createMainWindow run that function and loads the index.html file
app.whenReady().then(() => {
    createMainWindow();

    //Implement Menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    //Remove mainWindow from memory
    mainWindow.on('closed', () => mainWindow = null);
    //App is Ready
    app.on('activate', () => {  
        if (BrowserWindow.getAllWindows().length === 0) {
          createMainWindow()
        }
      })
});

//Menu Template
const menu = [
    ...(isMac ? [{
        labe: app.name,
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
    }] : []),
    {
        //Shortcut => role: 'fileMenu'
        label: 'File',
        submenu: [
            {
                label: 'Quit',
                click: () => app.quit(),
                accelerator: 'Ctlr+W'   
            }
        ]
    },
    ...(!isMac ? [{
        label: 'Help',
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]
    }] : [])
];

//Respond to ipcRenderer Resize
ipcMain.on('image:resize', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageresizer');
    resizeImage(options);
});

async function resizeImage({imgPath, width, height, dest}) {
    try{
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height
        });

        //Create File Name
        const filename = path.basename(imgPath);

        //Create Destination folder
        if (!fs.existsSync(dest))
        fs.mkdirSync(dest);
        
        //Write file to destination
        fs.writeFileSync(path.join(dest, filename), newPath);
        //Send Success to Render
        mainWindow.webContents.send('image:done');
        //Open Destination Folder
        shell.openPath(dest);
    } catch(error){
        console.log(error);
    }
};

app.on('window-all-closed', () => {
    if (!isMac) app.quit();
  });