'use strict';

const { app, BrowserWindow } = require('electron')
const fs = require('fs')
//require('electron-reload')(__dirname);

let janela
let impressoras

function salvaImpressoras() {
    impressoras = new BrowserWindow({
        show: false
    });
    impressoras = impressoras.webContents.getPrinters();
    fs.writeFileSync(__dirname + '/files/impressoras.json', JSON.stringify(impressoras), function (erro) {
        console.log(erro);
    });
    impressoras = null;
}

function criarJanela() {

    salvaImpressoras();

    janela = new BrowserWindow({
        width: 683,
        height: 700,
        icon:__dirname+"/img/logo_cliente.png",
        webPreferences: {
            nodeIntegration: true
        }
    });
    janela.loadFile('index.html')
    //janela.webContents.openDevTools();



}

app.on('ready', criarJanela)


app.on('activate', () => {
    if (janela == null) {
        criarJanela();
    }
});


app.on('window-all-closed', async () => {
    process.exit();
    process.kill()
    app.quit();
});

app.on('before-quit', async () => {
    app.removeAllListeners('close');
});

app.on('closed', async () => {
    process.exit();
    process.kill()
    app.quit();
});
