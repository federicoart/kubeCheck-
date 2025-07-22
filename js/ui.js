const sidebar = document.getElementById('sidebar');
const resizer = document.getElementById('resizer');
const monitorPan = document.getElementById('monitorPanel');

function toggleSidebar() {
  sidebar.classList.toggle('collapsed');
}

let resizing = false;
resizer.addEventListener('mousedown', e => {
  if (sidebar.classList.contains('collapsed')) return;
  resizing = true;
  document.body.style.cursor = 'col-resize';
});
window.addEventListener('mousemove', e => {
  if (!resizing) return;
  const w = Math.min(Math.max(e.clientX, 160), 420);
  sidebar.style.width = w + 'px';
});
window.addEventListener('mouseup', () => {
  if (resizing) {
    resizing = false;
    document.body.style.cursor = 'default';
  }
});

function toggleMonitor() {
  monitorPan.style.display = monitorPan.style.display === 'none' ? 'block' : 'none';
}

function openLink(url) {
  window.open(url, '_blank');
}
