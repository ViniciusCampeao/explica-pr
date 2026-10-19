const apiNavegador = globalThis.browser ?? globalThis.chrome;
const campoChave = document.querySelector('#chave');
const campoModelo = document.querySelector('#modelo');
const estado = document.querySelector('#estado');

apiNavegador.storage.local.get(['chaveGemini', 'modeloGemini']).then(config => {
  campoChave.value = config.chaveGemini || '';
  if (config.modeloGemini) campoModelo.value = config.modeloGemini;
});

document.querySelector('#mostrar-chave').addEventListener('click', evento => {
  const mostrar = campoChave.type === 'password';
  campoChave.type = mostrar ? 'text' : 'password';
  evento.currentTarget.textContent = mostrar ? 'Ocultar' : 'Mostrar';
});

document.querySelector('#salvar').addEventListener('click', async () => {
  const chave = campoChave.value.trim();
  if (!chave) {
    await apiNavegador.storage.local.remove('chaveGemini');
    estado.textContent = 'Chave removida. Cole uma chave para usar a análise.';
    return;
  }
  await apiNavegador.storage.local.set({ chaveGemini: chave, modeloGemini: campoModelo.value });
  estado.textContent = 'Configuração salva neste navegador.';
});
