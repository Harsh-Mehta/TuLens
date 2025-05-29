document.addEventListener("DOMContentLoaded", () => {
  // Start button → lens.html
  const startBtn = document.getElementById("start-btn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      window.location.href = "lens2.html";
    });
  }
});
