function restoreLastNs() {
  const saved = localStorage.getItem('lastNs');
  if (!saved) return;
  try {
    const { filePath: f, selected: s } = JSON.parse(saved);
    if (f && s) selectNs(f, s);
  } catch {}
}

window.onload = restoreLastNs;
