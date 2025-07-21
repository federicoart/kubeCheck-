const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();
const port = 4000;

app.use(cors());

app.get('/run', (req, res) => {
  let cmd = decodeURIComponent(req.query.cmd || '');
  cmd = cmd.replace(/\\/g, '/').replace(/^'+|'+$/g, '');
  console.log('[ESEGUO]', cmd);

  exec(cmd, { shell: 'powershell.exe' }, (error, stdout, stderr) => {
    if (error) return res.send(`❌ ERRORE:\n${stderr || error.message}`);
    return res.send(stdout);
  });
});

app.get('/pod/restarts', (req, res) => {
  const ns = decodeURIComponent(req.query.ns || '');
  if (!ns) return res.send("❌ Namespace non specificato.");

  const cmd = `kubectl get pods -n ${ns} -o json | jq '[.items[] | 
    select(.status.containerStatuses != null) | 
    {pod: .metadata.name, 
     restarts: [.status.containerStatuses[] | select(.restartCount > 0) | {
       name, count: .restartCount, 
       lastExit: .lastState.terminated.finishedAt, 
       reason: .lastState.terminated.reason
     }]}]'`;

  exec(cmd, { shell: 'bash' }, (err, stdout, stderr) => {
    if (err) return res.send(`❌ ERRORE:\n${stderr || err.message}`);
    return res.send(stdout);
  });
});

app.get('/pod/describe', (req, res) => {
  const pod = decodeURIComponent(req.query.pod || '');
  const ns  = decodeURIComponent(req.query.ns || '');
  if (!pod || !ns) return res.send("❌ Specificare pod e namespace.");
  const cmd = `kubectl describe pod ${pod} -n ${ns}`;

  exec(cmd, { shell: 'bash' }, (err, stdout, stderr) => {
    if (err) return res.send(`❌ ERRORE:\n${stderr || err.message}`);
    return res.send(stdout);
  });
});

app.get('/pod/logsprevious', (req, res) => {
  const pod = decodeURIComponent(req.query.pod || '');
  const ns  = decodeURIComponent(req.query.ns || '');
  if (!pod || !ns) return res.send("❌ Specificare pod e namespace.");
  const cmd = `kubectl logs ${pod} --previous -n ${ns}`;

  exec(cmd, { shell: 'bash' }, (err, stdout, stderr) => {
    if (err) return res.send(`❌ ERRORE:\n${stderr || err.message}`);
    return res.send(stdout);
  });
});

app.get('/jobs/list', (req, res) => {
  const ns = decodeURIComponent(req.query.ns || '');
  const cmd = ns ? `kubectl get jobs -n ${ns}` : `kubectl get jobs --all-namespaces`;

  exec(cmd, { shell: 'bash' }, (err, stdout, stderr) => {
    if (err) return res.send(`❌ ERRORE:\n${stderr || err.message}`);
    return res.send(stdout);
  });
});

app.get('/jobs/describe', (req, res) => {
  const job = decodeURIComponent(req.query.job || '');
  const ns  = decodeURIComponent(req.query.ns || '');
  if (!job || !ns) return res.send("❌ Specificare job e namespace.");
  const cmd = `kubectl describe job ${job} -n ${ns}`;

  exec(cmd, { shell: 'bash' }, (err, stdout, stderr) => {
    if (err) return res.send(`❌ ERRORE:\n${stderr || err.message}`);
    return res.send(stdout);
  });
});

app.listen(port, () => {
  console.log(`🟢 Backend attivo su http://localhost:${port}`);
});
