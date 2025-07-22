const customCmd = document.getElementById('customCmd');

function runCustomCommand() {
  const c = customCmd.value.trim();
  if (c) runCommand(c);
}

function saveOutput() {
  const blob = new Blob([outputBox.textContent], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `output-${selected || 'global'}-${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
  a.click();
  URL.revokeObjectURL(a.href);
}
