// overview.js - versione ottimizzata e modulare
// Costruisce la panoramica delle risorse Kubernetes con UX moderna, caricamento parallelo e output interattivo

const overview = document.getElementById('overviewRow');

// Mappa delle risorse da mostrare: label -> comando kubectl
const RESOURCE_MAP = {
  Pods: 'get pods -o json',
  Services: 'get svc',
  Deployments: 'get deployments',
  StatefulSets: 'get statefulsets',
  Jobs: 'get jobs'
};

/**
 * Costruisce e mostra tutte le card overview per le risorse Kubernetes.
 * - Caricamento parallelo delle risorse
 * - Loader globale gestito via callback
 * - Drag & drop riattivato dopo ogni rigenerazione
 * - Output interattivo per Pods
 */
function loadOverview() {
  const base = `kubectl --kubeconfig="${filePath}" -n ${selected}`;
  overview.innerHTML = '';
  const labels = Object.keys(RESOURCE_MAP);
  let completed = 0;

  labels.forEach(label => {
    const cmd = `${base} ${RESOURCE_MAP[label]}`;
    // Colonna responsive (opzionale, se usi Bootstrap)
    const col = document.createElement('div');
    col.className = 'overview-col';
    // Card principale
    const card = document.createElement('div');
    card.className = 'overview-card card p-2 h-100';
    // Titolo
    const h = document.createElement('h6');
    h.textContent = label;
    // Icone azioni
    const icons = document.createElement('div');
    icons.className = 'card-icons';
    const copyBtn = document.createElement('i');
    copyBtn.textContent = '📋';
    copyBtn.title = 'Copia comando';
    copyBtn.onclick = () => copyCmd(cmd);
    const refreshBtn = document.createElement('i');
    refreshBtn.textContent = '🔁';
    refreshBtn.title = 'Ricarica';
    refreshBtn.onclick = () => refreshCard(refreshBtn, cmd, label);
    icons.append(copyBtn, refreshBtn);
    // Output area
    const body = document.createElement('div');
    body.className = 'output-content';
    body.style.whiteSpace = 'pre-wrap';
    // Assembla card
    card.append(h, icons, body);
    col.appendChild(card);
    overview.appendChild(col);
    // Carica dati risorsa
    refreshCard(refreshBtn, cmd, label, () => {
      completed++;
      if (completed === labels.length) hideLoader();
    });
  });
  // Drag & drop sempre riattivato
  if (window.enableOverviewDragDrop) window.enableOverviewDragDrop('#overviewRow', '.overview-card');
}

/**
 * Esegue il comando kubectl e aggiorna la card con il risultato.
 * - Per Pods: output interattivo, menu contestuale, stato colorato
 * - Per altre risorse: output testuale
 * - Callback chiamata a fine caricamento
 */
function refreshCard(icon, cmd, label, done) {
  const target = icon.closest('.card').querySelector('.output-content');
  target.textContent = 'Caricamento…';
  if (label === 'Pods') {
    fetch(`http://localhost:4000/run?cmd=${encodeURIComponent(cmd)}`)
      .then(r => r.json())
      .then(j => {
        target.innerHTML = '';
        (j.items || []).forEach(p => {
          const row = document.createElement('div');
          const st = p.status.phase;
          row.textContent = `${p.metadata.name} [${st}]`;
          row.style.cursor = 'context-menu';
          // Stato colorato
          row.style.color = (st === 'Running' || st === 'Succeeded') ? '#43b02a' : (st === 'Pending' ? '#ff9752ff' : '#d32f2f');
          // Selezione pod
          row.onclick = () => ctxPod = p.metadata.name;
          // Menu contestuale
          row.addEventListener('contextmenu', e => {
            e.preventDefault();
            ctxPod = p.metadata.name;
            showCtxMenu(e.pageX, e.pageY);
          });
          target.appendChild(row);
        });
        if (!target.innerHTML) target.textContent = 'Nessun pod';
        if (typeof done === 'function') done();
      })
      .catch(() => {
        target.textContent = '❌ Errore';
        if (typeof done === 'function') done();
      });
  } else {
    fetch(`http://localhost:4000/run?cmd=${encodeURIComponent(cmd)}`)
      .then(r => r.text())
      .then(t => {
        target.textContent = t || 'Nessun risultato';
        if (typeof done === 'function') done();
      })
      .catch(() => {
        target.textContent = '❌ Errore';
        if (typeof done === 'function') done();
      });
  }
}
