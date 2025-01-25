const { app, BrowserWindow, session } = require("electron");
const path = require("path");
let debugMode = false;

//Controller Mappings
// const keyMapping = {
//   face_1: "Enter",
//   face_2: "Escape",
//   dpad_up: "ArrowUp",
//   dpad_right: "ArrowRight",
//   dpad_down: "ArrowDown",
//   dpad_left: "ArrowLeft",
// };

// Create Main Window
let mainWindow;

app.on("ready", () => {
  const partition = "persist:youtube_tv"; // Session Name
  const customSession = session.fromPartition(partition);

  customSession.webRequest.onBeforeSendHeaders(
    { urls: ["https://*.youtube.com/*"] },
    (details, callback) => {
      const headers = details.requestHeaders;

      headers["User-Agent"] =
        "Mozilla/5.0 (Linux; Android 10; BRAVIA 4K VH2 Build/QTG3.200305.006.S292; wv)"; // Set User-Agent Header To Android TV Device

      callback({ requestHeaders: headers });
    }
  );

  if (debugMode) {
    mainWindow = new BrowserWindow({
      width: 3840,
      height: 2160,
      fullscreen: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        session: customSession,
        nodeIntegration: false,
        contextIsolation: true,
        webviewTag: true,
      },
      frame: true,
      backgroundColor: "#000000",
    });
  } else {
    mainWindow = new BrowserWindow({
      width: 3840,
      height: 2160,
      fullscreen: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        session: customSession,
        nodeIntegration: false,
        contextIsolation: true,
        webviewTag: true,
      },
      frame: false,
      backgroundColor: "#000000",
    });
  }

  consoleLog("Created Main Window");

  // Load YouTube TV
  mainWindow.loadURL("https://youtube.com/tv");
  consoleLog("Loaded YouTube TV");

  //Hide Cursor When Video Play
  mainWindow.webContents.on("media-started-playing", () => {
    mainWindow.webContents.executeJavaScript(`
      document.body.style.cursor = 'none';
    `);
  });

  //Show Cursor When Video Pause
  mainWindow.webContents.on("media-paused", () => {
    mainWindow.webContents.executeJavaScript(`
      document.body.style.cursor = 'default';
      `);
  });

  // Handle Window Closes
  mainWindow.on("closed", () => {
    consoleLog("Window Closed");
    mainWindow = null;
    app.quit();
    return;
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    return;
  }
});

app.on("activate", () => {
  if (!mainWindow) {
    createWindow();
    app.emit("ready");
  }
});

function consoleLog(input) {
  console.log(input);
}
