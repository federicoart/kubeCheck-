let selectedNamespace = '';

window.api.loadJSON().then(data => {
  const container = document.getElementById('namespaceList');
  data.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'mb-2';

    const title = document.createElement('div');
    title.className = 'fw-bold small';
    title.innerHTML = `${entry.file} <small>(${entry.namespaces.length} ns)</small>`;

    const btn = document.createElement('button');
    btn.textContent = '📂';
    btn.className = 'btn btn-sm btn-outline-light ms-2';
    btn.onclick = () => window.api.openKubeconfig(entry.file);

    const nsList = document.createElement('ul');
    entry.namespaces.forEach(ns => {
      const li = document.createElement('li');
      li.textContent = ns;
      li.className = 'namespace list-group-item list-group-item-action';
      li.onclick = () => {
        selectedNamespace = ns;
        document.getElementById('selectedNamespace').textContent = `Namespace: ${ns}`;
      };
      nsList.appendChild(li);
    });

    title.appendChild(btn);
    div.appendChild(title);
    div.appendChild(nsList);
    container.appendChild(div);
  });
});

function exportJSON() {
  window.api.loadJSON().then(data => {
    window.api.saveJSON(data).then(p => alert('Esportato JSON:\n' + p));
  });
}

function exportCSV() {
  window.api.loadJSON().then(data => {
    window.api.saveCSV(data).then(p => alert('Esportato CSV:\n' + p));
  });
}

function checkRestarts() {
  if (!selectedNamespace) return alert('Seleziona un namespace');
  fetch(`http://localhost:4000/pod/restarts?ns=${selectedNamespace}`)
    .then(r => r.text()).then(showOutput);
}

function listJobs() {
  if (!selectedNamespace) return alert('Seleziona un namespace');
  fetch(`http://localhost:4000/jobs/list?ns=${selectedNamespace}`)
    .then(r => r.text()).then(showOutput);
}

function loadResource() {
  const res = document.getElementById('resourceSelector').value;
  if (!res || !selectedNamespace) return;
  execRaw(`kubectl get ${res} -n ${selectedNamespace}`);
}

function execRaw(cmd) {
  fetch(`http://localhost:4000/run?cmd=${encodeURIComponent(cmd)}`)
    .then(r => r.text()).then(t => {
      window.api.saveHistory(cmd);
      showOutput(t);
      updateHistory();
    });
}

function runFromHistory(sel) {
  if (sel.value) execRaw(sel.value);
}

function updateHistory() {
  window.api.getHistory().then(h => {
    const sel = document.getElementById('historySelector');
    sel.innerHTML = '<option value="">-- Storico Comandi --</option>';
    h.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      sel.appendChild(opt);
    });
  });
}

function showOutput(txt) {
  const out = document.getElementById('output');
  out.innerHTML = txt
    .replaceAll('❌', '<span style=\"color:red\">❌</span>')
    .replaceAll('✅', '<span style=\"color:lightgreen\">✅</span>')
    .replaceAll('\\n', '<br>');
}

updateHistory();
