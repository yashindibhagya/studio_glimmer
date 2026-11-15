// Applies the saved theme before the page paints. Light is the default.
try {
  if (localStorage.getItem("sg-theme") === "dark") document.documentElement.dataset.theme = "dark";
} catch (e) {}
