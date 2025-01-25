const navBar = document.getElementById("nav-bar");
const webview = document.getElementById("webview");

// Timer to hide the navigation bar
let hideNavBarTimeout;

// Show the navigation bar on hover
navBar.addEventListener("mouseenter", () => {
  navBar.style.opacity = "1";
  clearTimeout(hideNavBarTimeout);
});

// Hide the navigation bar after 3 seconds
navBar.addEventListener("mouseleave", () => {
  hideNavBarTimeout = setTimeout(() => {
    navBar.style.opacity = "0";
  }, 2 * 1000);
});

// Navigation button actions
document.getElementById("back-button").addEventListener("click", () => {
  if (webview.canGoBack()) {
    webview.goBack();
  }
});

document.getElementById("home-button").addEventListener("click", () => {
  webview.loadURL("https://youtube.com/tv");
});

document.getElementById("forward-button").addEventListener("click", () => {
  if (webview.canGoForward()) {
    webview.goForward();
  }
});
