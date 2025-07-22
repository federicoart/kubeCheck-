const outputBox = document.getElementById('output');

function copyCmd(cmd) {
  navigator.clipboard.writeText(cmd);
  alert('Comando copiato!');
}

function copyOutput() {
  const text = [...outputBox.querySelectorAll('div')].map(el => el.textContent).join('\n');
  navigator.clipboard.writeText(text);
  alert('Output copiato!');
}

function runCommand(cmd) {
  outputBox.innerHTML = `<div style="color:#aaa;">▶ ${cmd}</div><div>Caricamento…</div>`;
  fetch(`http://localhost:4000/run?cmd=${encodeURIComponent(cmd)}`)
    .then(r => r.text())
    .then(txt => {
      outputBox.innerHTML = '<button class="btn btn-sm btn-outline-light copy-btn" onclick="copyOutput()">📋 Copia Output</button>';
      txt.split('\n').forEach(l => {
        const d = document.createElement('div');
        d.textContent = l;
        const L = l.toLowerCase();
        if (/error|failed|crashloop|exception|timeout/.test(L)) {
          d.style.color = '#ff6b6b'; d.style.fontWeight = 'bold';
        } else if (/warning|deprecated/.test(L)) {
          d.style.color = '#fbbf24';
        } else if (/running|started|success/.test(L)) {
          d.style.color = '#4ade80';
        } else {
          d.style.color = '#e5e7eb';
        }
        outputBox.appendChild(d);
      });
    })
    .catch(e => {
      outputBox.innerHTML = `<div style="color:#ff6b6b;">❌ ERRORE:<br>${e}</div>`;
    });
}
