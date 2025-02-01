const {
  app,
  BrowserWindow,
  session,
  shell,
  dialog,
  globalShortcut,
  ipcRenderer,
} = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const https = require("https");
const fs = require("fs");
const wait = require("wait");
const config = require("./config.json");

// Create Windows
let mainWindow, updateWindow, splashWindow;

// Pip Mode Stuff
let isPipMode = false;
const PIP_WIDTH = 640;
const PIP_HEIGHT = 338;

// Check For Internet Connection To Avoid Errors
function checkInternetConnection() {
  return new Promise((resolve) => {
    https
      .get("https://www.youtube.com", (res) => {
        resolve(true);
      })
      .on("error", () => {
        resolve(false);
      });
  });
}

// Fetch Latest Version
let packageVersionURL;
if (config.System.selectedUpdateChannel === "stable") {
  packageVersionURL = config.System.updateChannels.stable;
} else {
  packageVersionURL = config.System.updateChannels.canary;
  applicationLog(
    "\n___________________________________________\nWARNING: Canary Version Detected. This Is Most Likely UNTESTED And May Break.\n___________________________________________"
  );
}
let localVersion = require("./package.json").version;

async function checkForUpdates() {
  try {
    return new Promise((resolve, reject) => {
      https
        .get(packageVersionURL, (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              const remoteVersion = JSON.parse(data).version;
              applicationLog(
                `Local Version: ${localVersion} | Remote Version: ${remoteVersion}`
              );
              if (localVersion === remoteVersion) {
                resolve({ updateAvailable: false });
              } else if (localVersion > remoteVersion) {
                applicationLog(
                  "\n_________________________________________________________\nWARNING: Local Version Is Higher Then Remote Version.\nThis May Be a Untested Build.\nProceed With Caution.\n_________________________________________________________"
                );
                resolve({ updateAvailable: false });
              } else if (localVersion < remoteVersion) {
                resolve({ updateAvailable: true, remoteVersion });
              }
            } catch (err) {
              applicationLog("Failed To Read Update Info", data);
              reject(new Error("Invalid JSON response from update server"));
            }
          });
        })
        .on("error", (err) => reject(err));
    });
  } catch (error) {}
}

// Create the update window
function createUpdateWindow() {
  updateWindow = new BrowserWindow({
    width: 800,
    height: 400,
    backgroundColor: "#000",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false,
    movable: false,
    resizable: false,
  });

  // Load update prompt UI
  updateWindow.loadURL(
    "data:text/html;charset=utf-8," +
      encodeURIComponent(`
    <body style="background-color: black; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; font-family: Arial, sans-serif;">
      <h1>UPDATE NOTIFICATION</h1>
      <p>An Update Is Ready To Be Downloaded From The GitHub</p>
      <p>This Window Will Close In A Few Seconds</p>
    </body>
  `)
  );
}

app.on("ready", async () => {
  // Create the splash screen
  splashWindow = new BrowserWindow({
    width: 250,
    height: 250,
    backgroundColor: "#000000",
    frame: false,
    movable: false,
    resizable: false,
    alwaysOnTop: true,
  });
  splashWindow.center();

  splashWindow.loadFile("splash.html");
  applicationLog("Created splash screen");
  const partition = "persist:youtube_tv"; // Session Name
  const customSession = session.fromPartition(partition);

  function createMainWindow() {
    if (config.Debugging.debugMode) {
      mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        fullscreen: false,
        webPreferences: {
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
        width: config.Resolution.width,
        height: config.Resolution.height,
        fullscreen: true,
        webPreferences: {
          session: customSession,
          nodeIntegration: false,
          contextIsolation: true,
          webviewTag: true,
        },
        frame: true,
        backgroundColor: "#000000",
      });
    }
    mainWindow.hide();
  }

  function startApp() {
    createMainWindow();
    customSession.webRequest.onBeforeSendHeaders(
      { urls: ["https://*.youtube.com/*"] },
      (details, callback) => {
        const headers = details.requestHeaders;

        headers["User-Agent"] =
          "Mozilla/5.0 (Linux; Android 10; BRAVIA 4K VH2 Build/QTG3.200305.006.S292; wv)"; // Set User-Agent Header To Android TV Device

        callback({ requestHeaders: headers });
      }
    );

    applicationLog("Created Main Window");

    // Load YouTube TV
    mainWindow.loadURL("https://youtube.com/tv");
    applicationLog("Loading YouTube On TV, This May Take A Moment...");

    // Register Global Shortcut For Pip Mode
    globalShortcut.register("Ctrl+Shift+P", () => {
      if (!mainWindow) {
        applicationLog("Error: Main Window Not Found, Can't set Pip mode.");
        dialog.showErrorBox(
          "Error: Main Window Not Found",
          "Can't set Pip mode."
        );
        return;
      }
      applicationLog("mainWindow type:", mainWindow.constructor.name);
      applicationLog("Available methods", Object.keys(mainWindow.__proto__));

      if (isPipMode) {
        // Toggle Back To Fullscreen
        mainWindow.setFullScreen(true);
        mainWindow.setAlwaysOnTop(false);
        isPipMode = false;
      } else {
        // Toggle To Pip Mode
        mainWindow.setFullScreen(false);
        mainWindow.setAlwaysOnTop(true);
        mainWindow.setSize(PIP_WIDTH, PIP_HEIGHT);
        mainWindow.center();
        isPipMode = true;
      }
    });

    mainWindow.webContents.on("did-finish-load", () => {
      splashWindow.hide();
      applicationLog("YouTube On TV Loaded");
      mainWindow.show();
      splashWindow.close();
    });

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
      applicationLog("Window Closed");
      mainWindow = null;
      app.quit();
      return;
    });
  }

  // Check if connected to internet
  const isConnected = await checkInternetConnection();
  if (!isConnected) {
    dialog.showErrorBox(
      "Couldn't Connect To YouTube",
      "Please Check Your Internet Connection"
    );
    app.quit();
    return;
  }

  if (config.System.updateNotifier) {
    try {
      const { updateAvailable } = await checkForUpdates();
      if (updateAvailable) {
        applicationLog("Update Available!");
        createUpdateWindow();
        await wait(5 * 1000);
        shell.openExternal(
          "https://github.com/VinalKrush/krushed-youtube-leanback/releases"
        ); // Opens in the user's default browser
        await wait(5 * 1000);
        if (updateWindow) updateWindow.close();
        startApp();
      } else {
        startApp();
      }
    } catch (error) {
      applicationLog("Error checking for updates:\n", error);
      startApp();
    }
  } else {
    startApp();
  }
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

// Logging Function
function applicationLog(input) {
  console.log(input);
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${input}\n`;
  const logFile = path.join(__dirname, "logs/krushed-youtube-leanback.log");

  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error("Error writing to log file", err);
    }
  });
}
