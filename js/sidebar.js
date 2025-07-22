const nsList = document.getElementById('namespaceList');
const selNsLbl = document.getElementById('selectedNamespace');
const searchBox = document.getElementById('searchBox');
let namespaces = [];

fetch('kube_namespaces_only.json')
  .then(r => r.json())
  .then(d => {
    namespaces = d;
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
              showLoader();
              searchBox.value = '';
              nsList.innerHTML = '';
              setTimeout(() => {
                selectNs(entry.file, ns);
                hideLoader();
              }, 1000); // oppure appena finisce il caricamento se vuoi
            };

            nsList.appendChild(btn);
          });
      });
    });
  });
function showLoader() {
  const el = document.getElementById('loaderOverlay');
  if (el) el.style.display = 'flex';
}

function hideLoader() {
  const el = document.getElementById('loaderOverlay');
  if (el) el.style.display = 'none';
}

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
