const ctxMenu = document.getElementById('contextMenu');
let ctxPod = null;

function showCtxMenu(x, y) {
  ctxMenu.style.display = 'block';
  ctxMenu.style.left = `${x}px`;
  ctxMenu.style.top = `${y}px`;
}

function contextAction(act) {
  const base = `kubectl --kubeconfig="${filePath}" -n ${selected}`;
  const pod = ctxPod || prompt('Nome pod:');
  if (!pod) return;
  const m = {
    describe: `${base} describe pod ${pod}`,
    logs:     `${base} logs ${pod}`,
    exec:     `${base} exec -it ${pod} -- sh`,
    curl:     `${base} exec -it ${pod} -- curl -I http://localhost:8080`
  };
  runCommand(m[act]);
  ctxMenu.style.display = 'none';
}

document.addEventListener('click', () => ctxMenu.style.display = 'none');
