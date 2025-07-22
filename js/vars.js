// Variabili globali condivise tra i file JS

let filePath = null;            // path al kubeconfig selezionato
let selected = null;            // namespace selezionato
let namespaces = [];            // lista di namespaces letti da JSON
let ctxPod = null;              // pod selezionato nel context menu

// Elementi DOM comuni
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
