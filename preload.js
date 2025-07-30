const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getFlashcards: () => ipcRenderer.invoke('get-flashcards'),
  addFlashcard: (flashcard) => ipcRenderer.invoke('add-flashcard', flashcard),
  deleteFlashcard: (index) => ipcRenderer.invoke('delete-flashcard', index),
  importFlashcards: (flashcards) => ipcRenderer.invoke('import-flashcards', flashcards)
});