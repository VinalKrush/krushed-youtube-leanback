const { app, BrowserWindow, session, shell } = require("electron");
const path = require("path");
const https = require("https");
const fs = require("fs");
const wait = require("wait");
const ini = require("ini");
const config = ini.parse(fs.readFileSync("./config.ini", "utf-8"));

// Create Windows
let mainWindow, updateWindow;

// Fetch Latest Version
let packageVersionURL =
  "https://raw.githubusercontent.com/VinalKrush/krushed-youtube-leanback/main/package.json";
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
              consoleLog(
                `Local Version: ${localVersion} | Remote Version: ${remoteVersion}`
              );
              if (localVersion === remoteVersion) {
                resolve({ updateAvailable: false });
              } else if (localVersion > remoteVersion) {
                console.warn(
                  "_________________________________________________________WARNING: Local Version Is Higher Then Remote Version.\nThis May Be a Untested Build.\nProceed With Caution.\n_________________________________________________________"
                );
                resolve({ updateAvailable: false });
              } else if (localVersion < remoteVersion) {
                resolve({ updateAvailable: true, remoteVersion });
              }
            } catch (err) {
              console.error("Failed To Read Update Info", data);
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
  const partition = "persist:youtube_tv"; // Session Name
  const customSession = session.fromPartition(partition);

  function createMainWindow() {
    if (config.debugMode) {
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
        width: config.width,
        height: config.height,
        fullscreen: true,
        webPreferences: {
          session: customSession,
          nodeIntegration: false,
          contextIsolation: true,
          webviewTag: true,
        },
        frame: false,
        backgroundColor: "#000000",
      });
    }
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

    consoleLog("Created Main Window");

    // Load YouTube TV
    mainWindow.loadURL("https://youtube.com/tv");
    consoleLog("Loading YouTube On TV, This May Take A Moment...");

    mainWindow.webContents.on("did-finish-load", () => {
      consoleLog("YouTube On TV Loaded");
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
      consoleLog("Window Closed");
      mainWindow = null;
      app.quit();
      return;
    });
  }

  if (config.updateNotifier) {
    try {
      const { updateAvailable } = await checkForUpdates();
      if (updateAvailable) {
        consoleLog("Update Available!");
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
      console.error("Error checking for updates:\n", error);
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

function consoleLog(input) {
  console.log(input);
}
