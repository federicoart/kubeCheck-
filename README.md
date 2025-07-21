# 🔍 KubeCheck

**KubeCheck** è un'interfaccia web leggera, interattiva e modulare per esplorare e ispezionare i cluster Kubernetes. Pensata per sysadmin, devops e sviluppatori, consente di eseguire rapidamente comandi utili su namespace e pod, visualizzare metriche, fare troubleshooting, e molto altro.

---

## 🚀 Funzionalità principali

- ✅ Ricerca namespace veloce e asincrona
- ✅ Visualizzazione Pods, Services, Deployments, StatefulSets, Jobs, Nodes
- ✅ Contesto cliccabile su ogni Pod (logs, describe, exec, curl check)
- ✅ Pulsanti rapidi per:
  - Visualizzare eventi
  - Controllare crashloop
  - Leggere log
  - Salvare e copiare output
- ✅ Comando personalizzato con output colorato e leggibile
- ✅ Modalità monitoring per accesso rapido a Grafana e Kibana
- ✅ Sidebar ridimensionabile e reattiva
- ✅ UI moderna con animazioni tech, salvataggio ultimi namespace visitati
- ✅ Menù a tendina con comandi avanzati divisi per categoria
- ✅ Evidenziazione automatica errori/warning/successo nell’output

---

## 🖼️ Screenshot

![UI Screenshot](screenshot.png) <!-- se vuoi puoi aggiungere questo file -->

---

## 📂 Struttura del progetto


KubeCheck/
├── index.html              # Interfaccia utente principale
├── main_ui.js              # Logica JS dell’interfaccia
├── server.js               # Backend Node.js per l’esecuzione dei comandi
├── genera_kubeconfig_json.sh # Script per generare il file kube_namespaces_only.json
├── kube_namespaces_only.json # File con mapping kubeconfig/namespaces
├── preload.js              # Supporto per Electron
├── package.json            # Configurazione NPM
├── style.css               # Stili aggiuntivi (opzionale)
└── README.md
⚙️ Requisiti
Node.js 18+

kubectl configurato sul sistema

Un set di file kubeconfig nella directory ./kubeconfigs/

Accesso in rete al cluster Kubernetes (via VPN o diretto)

(Opzionale) Electron se vuoi usarlo come app desktop

🛠️ Installazione
bash
Copia
Modifica
# Clona il progetto
git clone 
cd kubecheck

# Installa le dipendenze
npm install

# Genera il file con i namespace
chmod +x genera_kubeconfig_json.sh
./genera_kubeconfig_json.sh

# Avvia il backend
node server.js

# Apri index.html nel browser o lancia con Electron
🧪 Esecuzione con Electron (opzionale)
bash
Copia
Modifica
npm install --save-dev electron
npx electron .
🧩 Come funziona
Lo script genera_kubeconfig_json.sh analizza i file kubeconfig presenti nella cartella ./kubeconfigs e genera un file JSON con mappatura file -> namespace.

L'interfaccia HTML legge questo file e mostra una searchbox per filtrare i namespace.

Quando selezioni un namespace, vengono mostrati pulsanti di comando e overview per pod, servizi ecc.

I comandi vengono eseguiti tramite chiamate HTTP al backend (server.js) che usa child_process.exec per eseguire kubectl.

📋 TODO e migliorie future
 Autenticazione via token o basic auth per accesso web

 Compatibilità con contesti multipli via kubectl config use-context

 Esportazione YAML delle risorse cliccate

 Integrazione con Prometheus o API custom

 Light/Dark theme toggle

 UI responsive anche da mobile

👤 Autore
Federico Artizzu

Se vuoi contribuire o proporre modifiche, apri una issue o manda una pull request. Ogni miglioramento è il benvenuto!

📜 Licenza
Questo progetto è rilasciato sotto licenza MIT.

