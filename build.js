const builder = require("electron-packager");
const path = require("path");
const pJSON = require("./package.json");

// Linux Package Configuration
const linuxConfig = {
  dir: ".", // Current directory
  out: path.join(__dirname, "..", "KYL_Builds", `${pJSON.version}`, "linux"), // Output directory
  overwrite: true,
  platform: "linux", // Change as needed: win32, darwin, linux
  arch: "x64", // Architecture: x64, ia32, arm64, etc.
  icon: path.join(__dirname, "media", "KYL.ico"), // Optional: Path to icon file
  appVersion: pJSON.version, // Use version from package.json
  name: `${pJSON.name}-${pJSON.version}-linux-portable`, // Include version in the name
  ignore: ["build.js"], // Ignore Built Files
};

// Windows 64 Bit Package Configuration
const win32_x64Config = {
  dir: ".", // Current directory
  out: path.join(__dirname, "..", "KYL_Builds", `${pJSON.version}`, "win"), // Output directory
  overwrite: true,
  platform: "win32", // Change as needed: win32, darwin, linux
  arch: "x64", // Architecture: x64, ia32, arm64, etc.
  icon: path.join(__dirname, "media", "KYL.ico"), // Optional: Path to icon file
  appVersion: pJSON.version, // Use version from package.json
  name: `${pJSON.name}-${pJSON.version}-win32-x64-portable`, // Include version in the name
  ignore: ["build.js"], // Ignore Built Files
};

// Windows Arm Package Configuration
const win32_arm64Config = {
  dir: ".", // Current directory
  out: path.join(__dirname, "..", "KYL_Builds", `${pJSON.version}`, "win"), // Output directory
  overwrite: true,
  platform: "win32", // Change as needed: win32, darwin, linux
  arch: "arm64", // Architecture: x64, ia32, arm64, etc.
  icon: path.join(__dirname, "media", "KYL.ico"), // Optional: Path to icon file
  appVersion: pJSON.version, // Use version from package.json
  name: `${pJSON.name}-${pJSON.version}-win32-arm64-portable`, // Include version in the name
  ignore: ["build.js"], // Ignore Built Files
};

// Windows 32 Bit Package Configuration
const win32_ia32Config = {
  dir: ".", // Current directory
  out: path.join(__dirname, "..", "KYL_Builds", `${pJSON.version}`, "win"), // Output directory
  overwrite: true,
  platform: "win32", // Change as needed: win32, darwin, linux
  arch: "ia32", // Architecture: x64, ia32, arm64, etc.
  icon: path.join(__dirname, "media", "KYL.ico"), // Optional: Path to icon file
  appVersion: pJSON.version, // Use version from package.json
  name: `${pJSON.name}-${pJSON.version}-win32-ia32-portable`, // Include version in the name
  ignore: ["build.js"], // Ignore Built Files
};

// Windows Installer Builds
const win32_x64InstallerConfig = {
  dir: ".", // Current directory
  out: path.join(
    __dirname,
    "..",
    "KYL_Builds",
    `${pJSON.version}`,
    "win-installer"
  ), // Output directory
  overwrite: true,
  platform: "win32", // Change as needed: win32, darwin, linux
  arch: "x64", // Architecture: x64, ia32, arm64, etc.
  icon: path.join(__dirname, "media", "KYL.ico"), // Optional: Path to icon file
  appVersion: pJSON.version, // Use version from package.json
  name: `${pJSON.name}-${pJSON.version}`, // Include version in the name
  appName: `${pJSON.name}`, // Application name
  ignore: ["build.js"], // Ignore Built Files
};

async function build() {
  try {
    const linuxBuild = await builder(linuxConfig);
    console.log(`Linux Build: ${linuxBuild}`);
    const win32_x64Build = await builder(win32_x64Config);
    console.log(`Windows 64 Bit Build: ${win32_x64Build}`);
    const win32_arm64Build = await builder(win32_arm64Config);
    console.log(`Windows Arm Build: ${win32_arm64Build}`);
    const win32_ia32Build = await builder(win32_ia32Config);
    console.log(`Windows 32 Bit Build: ${win32_ia32Build}`);
    const win32_x64InstallerBuild = await builder(win32_x64InstallerConfig);
    console.log(`Windows Installer Build: ${win32_x64InstallerBuild}`);
  } catch (err) {
    console.error(`Error During Building...`, err);
  }
}

build();
