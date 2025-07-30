const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC do pobierania fiszek
ipcMain.handle('get-flashcards', async () => {
  const data = fs.readFileSync(path.join(__dirname, 'flashcards.json'), 'utf-8');
  return JSON.parse(data);
});

// IPC do dodawania fiszek
ipcMain.handle('add-flashcard', async (event, flashcard) => {
  try {
    const filePath = path.join(__dirname, 'flashcards.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const cards = JSON.parse(data);
    cards.push(flashcard);
    fs.writeFileSync(filePath, JSON.stringify(cards, null, 2), 'utf-8');
    return { success: true };
  } catch (e) {
    return { success: false };
  }
});

// IPC do usuwania fiszek
ipcMain.handle('delete-flashcard', async (event, index) => {
  try {
    const filePath = path.join(__dirname, 'flashcards.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const cards = JSON.parse(data);
    cards.splice(index, 1);
    fs.writeFileSync(filePath, JSON.stringify(cards, null, 2), 'utf-8');
    return { success: true };
  } catch (e) {
    return { success: false };
  }
});

// IPC do importowania fiszek
ipcMain.handle('import-flashcards', async (event, imported) => {
  try {
    const filePath = path.join(__dirname, 'flashcards.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    let cards = JSON.parse(data);
    // Dodaj tylko te, których nie ma już w pliku (po question+answer+category+difficulty)
    const exists = (f) => cards.some(c => c.question === f.question && c.answer === f.answer && c.category === f.category && c.difficulty === f.difficulty);
    let added = 0;
    for (const f of imported) {
      if (!exists(f)) {
        cards.push(f);
        added++;
      }
    }
    fs.writeFileSync(filePath, JSON.stringify(cards, null, 2), 'utf-8');
    return { success: true, added };
  } catch (e) {
    return { success: false };
  }
});
