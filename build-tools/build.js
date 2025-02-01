const builder = require("electron-packager");
const path = require("path");
const pJSON = require("../package.json");
const wait = require("wait");
const { exec } = require("child_process");
const { stdout, stderr } = require("process");

async function BuilderAgent() {
  console.log(
    `NOTE: Output will be ${path.join(
      __dirname,
      "..",
      "..",
      "KYL_Builds",
      `${pJSON.version}`
    )}`
  );

  await wait(5 * 1000);

  // Linux Package Configuration
  const linuxConfig = {
    dir: ".", // Current directory
    out: path.join(__dirname, "..", "..", "KYL_Builds", `${pJSON.version}`), // Output directory
    overwrite: true,
    platform: "linux", // Change as needed: win32, darwin, linux
    arch: "x64", // Architecture: x64, ia32, arm64, etc.
    icon: path.join(__dirname, "..", "media", "KYL.ico"), // Optional: Path to icon file
    appVersion: pJSON.version, // Use version from package.json
    name: `${pJSON.name}-${pJSON.version}-portable`, // Include version in the name
    ignore: ["build.js"], // Ignore Built Files
  };

  // Windows 64 Bit Package Configuration
  const win32_x64Config = {
    dir: ".", // Current directory
    out: path.join(__dirname, "..", "..", "KYL_Builds", `${pJSON.version}`), // Output directory
    overwrite: true,
    platform: "win32", // Change as needed: win32, darwin, linux
    arch: "x64", // Architecture: x64, ia32, arm64, etc.
    icon: path.join(__dirname, "..", "media", "KYL.ico"), // Optional: Path to icon file
    appVersion: pJSON.version, // Use version from package.json
    name: `${pJSON.name}-${pJSON.version}-portable`, // Include version in the name
    ignore: ["build.js"], // Ignore Built Files
  };

  // Windows Arm Package Configuration
  const win32_arm64Config = {
    dir: ".", // Current directory
    out: path.join(__dirname, "..", "..", "KYL_Builds", `${pJSON.version}`), // Output directory
    overwrite: true,
    platform: "win32", // Change as needed: win32, darwin, linux
    arch: "arm64", // Architecture: x64, ia32, arm64, etc.
    icon: path.join(__dirname, "..", "media", "KYL.ico"), // Optional: Path to icon file
    appVersion: pJSON.version, // Use version from package.json
    name: `${pJSON.name}-${pJSON.version}-portable`, // Include version in the name
    ignore: ["build.js"], // Ignore Built Files
  };

  // Windows 32 Bit Package Configuration
  const win32_ia32Config = {
    dir: ".", // Current directory
    out: path.join(__dirname, "..", "..", "KYL_Builds", `${pJSON.version}`), // Output directory
    overwrite: true,
    platform: "win32", // Change as needed: win32, darwin, linux
    arch: "ia32", // Architecture: x64, ia32, arm64, etc.
    icon: path.join(__dirname, "..", "media", "KYL.ico"), // Optional: Path to icon file
    appVersion: pJSON.version, // Use version from package.json
    name: `${pJSON.name}-${pJSON.version}-portable`, // Include version in the name
    ignore: ["build.js"], // Ignore Built Files
  };

  // Windows Installer Builds
  const win32_x64InstallerConfig = {
    dir: ".", // Current directory
    out: path.join(__dirname, "..", "..", "KYL_Builds", `${pJSON.version}`), // Output directory
    overwrite: true,
    platform: "win32", // Change as needed: win32, darwin, linux
    arch: "x64", // Architecture: x64, ia32, arm64, etc.
    icon: path.join(__dirname, "..", "media", "KYL.ico"), // Optional: Path to icon file
    appVersion: pJSON.version, // Use version from package.json
    name: `${pJSON.name}`, // Include version in the name
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

      console.log("Archiving Builds. This may take a moment...");

      try {
        // Attempt Archiving Builds
        exec(
          `7z a "${path.join(
            __dirname,
            "..",
            "..",
            "KYL_Builds",
            `${pJSON.version}`,
            `krushed-youtube-leanback-${pJSON.version}-portable-linux-x64.7z`
          )}" "${path.join(
            __dirname,
            "..",
            "..",
            "KYL_Builds",
            `${pJSON.version}`,
            `krushed-youtube-leanback-${pJSON.version}-portable-linux-x64`
          )}"`,
          (error, stdout, stderr) => {
            if (error) {
              console.error(`Error During Archiving...`, error);
              return;
            }
            if (stderr) {
              console.error(`Stderr:`, stderr);
              return;
            }
          }
        );

        exec(
          `7z a "${path.join(
            __dirname,
            "..",
            "..",
            "KYL_Builds",
            `${pJSON.version}`,
            `krushed-youtube-leanback-${pJSON.version}-portable-win32-x64.7z`
          )}" "${path.join(
            __dirname,
            "..",
            "..",
            "KYL_Builds",
            `${pJSON.version}`,
            `krushed-youtube-leanback-${pJSON.version}-portable-win32-x64`
          )}"`,
          (error, stdout, stderr) => {
            if (error) {
              console.error(`Error During Archiving...`, error);
              return;
            }
            if (stderr) {
              console.error(`Stderr:`, stderr);
              return;
            }
          }
        );

        exec(
          `7z a "${path.join(
            __dirname,
            "..",
            "..",
            "KYL_Builds",
            `${pJSON.version}`,
            `krushed-youtube-leanback-${pJSON.version}-portable-win32-arm64.7z`
          )}" "${path.join(
            __dirname,
            "..",
            "..",
            "KYL_Builds",
            `${pJSON.version}`,
            `krushed-youtube-leanback-${pJSON.version}-portable-win32-arm64`
          )}"`,
          (error, stdout, stderr) => {
            if (error) {
              console.error(`Error During Archiving...`, error);
              return;
            }
            if (stderr) {
              console.error(`Stderr:`, stderr);
              return;
            }
          }
        );

        exec(
          `7z a "${path.join(
            __dirname,
            "..",
            "..",
            "KYL_Builds",
            `${pJSON.version}`,
            `krushed-youtube-leanback-${pJSON.version}-portable-win32-ia32.7z`
          )}" "${path.join(
            __dirname,
            "..",
            "..",
            "KYL_Builds",
            `${pJSON.version}`,
            `krushed-youtube-leanback-${pJSON.version}-portable-win32-ia32`
          )}"`,
          (error, stdout, stderr) => {
            if (error) {
              console.error(`Error During Archiving...`, error);
              return;
            }
            if (stderr) {
              console.error(`Stderr:`, stderr);
              return;
            }
          }
        );
      } catch (error) {
        console.error("Error Archiving Builds...", error);
        return;
      }
    } catch (err) {
      console.error(`Error During Building...`, err);
    }
  }

  build();
}

BuilderAgent();
