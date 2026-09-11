async function loadShared(selector, file) {
  const target = document.querySelector(selector);
  if (!target) return;
  try {
    const response = await fetch(file, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Failed to load ${file}`);
    target.innerHTML = await response.text();
    const year = target.querySelector("[data-current-year]");
    if (year) year.textContent = new Date().getFullYear();
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadShared("#site-header", "/shared/header.html");
  loadShared("#site-footer", "/shared/footer.html");
});
