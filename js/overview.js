const overview = document.getElementById('overviewRow');

function loadOverview() {
  const base = `kubectl --kubeconfig="${filePath}" -n ${selected}`;
  const map = {
    Pods: 'get pods -o json',
    Services: 'get svc',
    Deployments: 'get deployments',
    StatefulSets: 'get statefulsets',
    Jobs: 'get jobs'
  };

  overview.innerHTML = '';
  Object.entries(map).forEach(([label, sub]) => {
    const cmd = `${base} ${sub}`;
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';

    const card = document.createElement('div');
    card.className = 'card p-2 h-100';

    const h = document.createElement('h6');
    h.textContent = label;

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

    const body = document.createElement('div');
    body.className = 'output-content';
    body.style.whiteSpace = 'pre-wrap';

    card.append(h, icons, body);
    col.appendChild(card);
    overview.appendChild(col);

    refreshCard(refreshBtn, cmd, label);
  });
}

function refreshCard(icon, cmd, label) {
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
          row.onclick = () => ctxPod = p.metadata.name;
          row.addEventListener('contextmenu', e => {
            e.preventDefault();
            ctxPod = p.metadata.name;
            showCtxMenu(e.pageX, e.pageY);
          });
          target.appendChild(row);
        });
        if (!target.innerHTML) target.textContent = 'Nessun pod';
      })
      .catch(() => target.textContent = '❌ Errore');
  } else {
    fetch(`http://localhost:4000/run?cmd=${encodeURIComponent(cmd)}`)
      .then(r => r.text())
      .then(t => target.textContent = t || 'Nessun risultato')
      .catch(() => target.textContent = '❌ Errore');
  }
}
