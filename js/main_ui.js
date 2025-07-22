const nsList      = document.getElementById('namespaceList');
const selNsLbl    = document.getElementById('selectedNamespace');
const searchBox   = document.getElementById('searchBox');
const cmdBtns     = document.getElementById('commandButtons');
const overview    = document.getElementById('overviewRow');
const outputBox   = document.getElementById('output');
const customCmd   = document.getElementById('customCmd');
const commandMenu = document.getElementById('commandMenu');
const ctxMenu     = document.getElementById('contextMenu');

let namespaces = [], selected = null, filePath = null, ctxPod = null;

// Mostra overlay con animazione loader
function showLoader() {
  const overlay = document.getElementById('loaderOverlay');
  if (overlay) overlay.style.display = 'flex';
}

// Nasconde overlay
function hideLoader() {
  const overlay = document.getElementById('loaderOverlay');
  if (overlay) overlay.style.display = 'none';
}

// Carica namespace e aggiunge comportamento alla search box
fetch('kube_namespaces_only.json').then(r => r.json()).then(data => {
  namespaces = data;

  searchBox.addEventListener('input', () => {
    const q = searchBox.value.trim().toLowerCase();
    nsList.innerHTML = '';
    if (q.length < 2) return;

    namespaces.forEach(entry => {
      entry.namespaces
        .filter(ns => ns.toLowerCase().includes(q))
        .forEach(ns => {
          const btn = document.createElement('button');
          btn.className = 'list-group-item list-group-item-action bg-dark text-white namespace';
          btn.textContent = ns;
          btn.onclick = () => {
            // Anima selezione
            btn.textContent = `🔍 Analisi ${ns}...`;
            btn.disabled = true;
            btn.classList.add('analyzing');

            // Pulisce UI
            searchBox.value = '';
            nsList.innerHTML = '';
            showLoader();

            // Dopo 1s avvia selezione vera e propria
            setTimeout(() => {
              selectNs(entry.file, ns);
              hideLoader();
            }, 1000);
          };
          nsList.appendChild(btn);
        });
    });
  });
});

// Funzione selezione namespace
function selectNs(file, ns) {
  filePath = file;
  selected = ns;
  selNsLbl.textContent = `Namespace selezionato: ${ns}`;
  document.querySelectorAll('.namespace').forEach(el => el.classList.remove('active'));
  [...nsList.children].forEach(el => {
    if (el.textContent === ns) el.classList.add('active');
  });
  localStorage.setItem('lastNs', JSON.stringify({ filePath, selected }));
  renderCmdButtons();
  loadOverview();
  renderCmdMenu();
}

// Ricarica ultimo namespace usato
function restoreLastNs() {
  const saved = localStorage.getItem('lastNs');
  if (!saved) return;
  try {
    const { filePath: f, selected: s } = JSON.parse(saved);
    if (f && s) selectNs(f, s);
  } catch {}
}
window.onload = restoreLastNs;
