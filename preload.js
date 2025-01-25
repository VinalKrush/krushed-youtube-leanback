const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  sendUpdateResponse: (response) =>
    ipcRenderer.send("update-response", response),
});
