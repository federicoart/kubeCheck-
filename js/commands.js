const cmdBtns = document.getElementById('commandButtons');
const commandMenu = document.getElementById('commandMenu');

function renderCmdButtons() {
  const base = `kubectl --kubeconfig="${filePath}" -n ${selected}`;
  const defs = [
    ['📊 Monitoring Tools', toggleMonitor],
    ['🔄 Aggiorna Overview', loadOverview],
    ['Describe Pods', () => runCommand(`${base} describe pods`)],
    ['CrashLoop Check', () => runCommand(`${base} get pods | findstr CrashLoopBackOff`)],
    ['Events', () => runCommand(`${base} get events --sort-by=.metadata.creationTimestamp`)],
    ['Logs', () => {
      const pod = prompt('Nome pod:');
      if (pod) runCommand(`${base} logs ${pod}`);
    }]
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

function renderCmdMenu() {
  commandMenu.innerHTML = '';
  const base = `kubectl --kubeconfig="${filePath}" -n ${selected}`;
  const extra = [
    ['Top Pods', `${base} top pods`],
    ['PVC', `${base} get pvc`],
    ['RBAC Roles', `${base} get roles`],
    ['CRD', `${base} get crd`],
    ['Endpoints', `${base} get endpoints`],
    ['ConfigMaps', `${base} get configmaps`]
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
