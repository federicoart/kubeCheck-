// main_ui.js

const nsList     = document.getElementById('namespaceList');
const selNsLbl   = document.getElementById('selectedNamespace');
const searchBox  = document.getElementById('searchBox');
const cmdBtns    = document.getElementById('commandButtons');
const overview   = document.getElementById('overviewRow');
const outputBox  = document.getElementById('output');
const customCmd  = document.getElementById('customCmd');
const sidebar    = document.getElementById('sidebar');
const resizer    = document.getElementById('resizer');
const monitorPan = document.getElementById('monitorPanel');
const ctxMenu    = document.getElementById('contextMenu');
const commandMenu = document.getElementById('commandMenu');

let namespaces = [], selected = null, filePath = null, ctxPod = null;

function toggleSidebar(){ sidebar.classList.toggle('collapsed'); }
let resizing = false;
resizer.addEventListener('mousedown', e => {
  if (sidebar.classList.contains('collapsed')) return;
  resizing = true; document.body.style.cursor = 'col-resize';
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

function toggleMonitor(){ monitorPan.style.display = monitorPan.style.display === 'none' ? 'block' : 'none'; }
function openLink(url){ window.open(url, '_blank'); }

fetch('kube_namespaces_only.json').then(r => r.json()).then(d => {
  namespaces = d;
  searchBox.addEventListener('input', () => {
    const q = searchBox.value.trim().toLowerCase();
    nsList.innerHTML = '';
    if (q.length < 2) return;
    namespaces.forEach(entry => {
      entry.namespaces.filter(ns => ns.toLowerCase().includes(q)).forEach(ns => {
        const btn = document.createElement('button');
        btn.className = 'list-group-item list-group-item-action bg-dark text-white namespace';
        btn.textContent = ns;
        btn.onclick = () => selectNs(entry.file, ns);
        nsList.appendChild(btn);
      });
    });
  });
});

function selectNs(file, ns){
  filePath = file; selected = ns;
  selNsLbl.textContent = `Namespace selezionato: ${ns}`;
  document.querySelectorAll('.namespace').forEach(el => el.classList.remove('active'));
  [...nsList.children].forEach(el => { if (el.textContent === ns) el.classList.add('active'); });
  localStorage.setItem('lastNs', JSON.stringify({ filePath, selected }));
  renderCmdButtons(); loadOverview(); renderCmdMenu();
}

function restoreLastNs(){
  const saved = localStorage.getItem('lastNs');
  if (!saved) return;
  try {
    const { filePath: f, selected: s } = JSON.parse(saved);
    if (f && s) selectNs(f, s);
  } catch {}
}
window.onload = restoreLastNs;

function renderCmdButtons(){
  const base = `kubectl --kubeconfig="${filePath}" -n ${selected}`;
  const defs = [
    ['📊 Monitoring Tools', toggleMonitor],
    ['🔄 Aggiorna Overview', loadOverview],
    ['Describe Pods',      () => runCommand(`${base} describe pods`)],
    ['CrashLoop Check',    () => runCommand(`${base} get pods | findstr CrashLoopBackOff`)],
    ['Events',             () => runCommand(`${base} get events --sort-by=.metadata.creationTimestamp`)],
    ['Logs',               () => { const pod = prompt('Nome pod:'); pod && runCommand(`${base} logs ${pod}`); } ]
  ];
  cmdBtns.innerHTML = '';
  defs.forEach(([label, fn]) => {
    const b = document.createElement('button');
    b.className = 'btn btn-sm btn-outline-light';
    b.textContent = label;
    b.onclick = fn;
    cmdBtns.appendChild(b);
  });
}

function renderCmdMenu(){
  commandMenu.innerHTML = '';
  const base = `kubectl --kubeconfig="${filePath}" -n ${selected}`;
  const extra = [
    ['Top Pods',      `${base} top pods`],
    ['PVC',           `${base} get pvc`],
    ['RBAC Roles',    `${base} get roles`],
    ['CRD',           `${base} get crd`],
    ['Endpoints',     `${base} get endpoints`],
    ['ConfigMaps',    `${base} get configmaps`]
  ];
  extra.forEach(([label, cmd]) => {
    const item = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'dropdown-item';
    btn.textContent = label;
    btn.onclick = () => runCommand(cmd);
    item.appendChild(btn);
    commandMenu.appendChild(item);
  });
}

function loadOverview(){
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
    const h = document.createElement('h6'); h.textContent = label;
    const icons = document.createElement('div'); icons.className = 'card-icons';
    const copyBtn = document.createElement('i');
    copyBtn.textContent = '📋'; copyBtn.title = 'Copia comando';
    copyBtn.onclick = () => copyCmd(cmd);
    const refreshBtn = document.createElement('i');
    refreshBtn.textContent = '🔁'; refreshBtn.title = 'Ricarica';
    refreshBtn.onclick = () => refreshCard(refreshBtn, cmd, label);
    icons.append(copyBtn, refreshBtn);
    const body = document.createElement('div');
    body.className = 'output-content'; body.style.whiteSpace = 'pre-wrap';
    card.append(h, icons, body); col.appendChild(card); overview.appendChild(col);
    refreshCard(refreshBtn, cmd, label);
  });
}

function refreshCard(icon, cmd, label){
  const target = icon.closest('.card').querySelector('.output-content');
  target.textContent = 'Caricamento…';
  if (label === 'Pods') {
    fetch(`http://localhost:4000/run?cmd=${encodeURIComponent(cmd)}`).then(r => r.json()).then(j => {
      target.innerHTML = '';
      (j.items || []).forEach(p => {
        const row = document.createElement('div');
        const st = p.status.phase;
        row.textContent = `${p.metadata.name} [${st}]`;
        row.style.cursor = 'context-menu';
        row.onclick = () => ctxPod = p.metadata.name;
        row.addEventListener('contextmenu', e => {
          e.preventDefault(); ctxPod = p.metadata.name; showCtxMenu(e.pageX, e.pageY);
        });
        target.appendChild(row);
      });
      if (!target.innerHTML) target.textContent = 'Nessun pod';
    }).catch(() => target.textContent = '❌ Errore');
  } else {
    fetch(`http://localhost:4000/run?cmd=${encodeURIComponent(cmd)}`).then(r => r.text()).then(t => {
      target.textContent = t || 'Nessun risultato';
    }).catch(() => target.textContent = '❌ Errore');
  }
}

function copyCmd(cmd){ navigator.clipboard.writeText(cmd); alert('Comando copiato!'); }
function copyOutput(){
  const text = [...outputBox.querySelectorAll('div')].map(el => el.textContent).join('\n');
  navigator.clipboard.writeText(text); alert('Output copiato!');
}
function runCommand(cmd){
  outputBox.innerHTML = `<div style="color:#aaa;">▶ ${cmd}</div><div>Caricamento…</div>`;
  fetch(`http://localhost:4000/run?cmd=${encodeURIComponent(cmd)}`).then(r => r.text()).then(txt => {
    outputBox.innerHTML = '<button class="btn btn-sm btn-outline-light copy-btn" onclick="copyOutput()">📋 Copia Output</button>';
    txt.split('\n').forEach(l => {
      const d = document.createElement('div'); d.textContent = l;
      const L = l.toLowerCase();
      if (/error|failed|crashloop|exception|timeout/.test(L)) { d.style.color = '#ff6b6b'; d.style.fontWeight = 'bold'; }
      else if (/warning|deprecated/.test(L)) { d.style.color = '#fbbf24'; }
      else if (/running|started|success/.test(L)) { d.style.color = '#4ade80'; }
      else { d.style.color = '#e5e7eb'; }
      outputBox.appendChild(d);
    });
  }).catch(e => outputBox.innerHTML = `<div style="color:#ff6b6b;">❌ ERRORE:<br>${e}</div>`);
}
function runCustomCommand(){ const c = customCmd.value.trim(); if (c) runCommand(c); }
function saveOutput(){
  const blob = new Blob([outputBox.textContent], { type: 'text/plain' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `output-${selected || 'global'}-${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
  a.click(); URL.revokeObjectURL(a.href);
}

function showCtxMenu(x, y){ ctxMenu.style.display = 'block'; ctxMenu.style.left = `${x}px`; ctxMenu.style.top = `${y}px`; }
function contextAction(act){
  const base = `kubectl --kubeconfig="${filePath}" -n ${selected}`;
  const pod = ctxPod || prompt('Nome pod:'); if (!pod) return;
  const m = {
    describe: `${base} describe pod ${pod}`,
    logs:     `${base} logs ${pod}`,
    exec:     `${base} exec -it ${pod} -- sh`,
    curl:     `${base} exec -it ${pod} -- curl -I http://localhost:8080`
  };
  runCommand(m[act]); ctxMenu.style.display = 'none';
}
document.addEventListener('click', () => ctxMenu.style.display = 'none');
