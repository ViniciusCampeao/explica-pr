const apiNavegador = globalThis.browser ?? globalThis.chrome;
const provedor = document.querySelector('#provedor');
const camposGemini = document.querySelector('#campos-gemini');
const camposCompativel = document.querySelector('#campos-compativel');
const estado = document.querySelector('#estado');

apiNavegador.storage.local.get(['provedorIA', 'urlBaseIA', 'modeloIA', 'chaveIA', 'chaveGemini', 'modeloGemini']).then(config => {
  provedor.value = config.provedorIA || 'gemini';
  document.querySelector('#chave').value = config.chaveGemini || (config.provedorIA === 'gemini' ? config.chaveIA : '') || '';
  document.querySelector('#modelo').value = config.modeloGemini || (config.provedorIA === 'gemini' ? config.modeloIA : '') || 'gemini-3.8-flash';
  document.querySelector('#url-api').value = config.urlBaseIA || '';
  document.querySelector('#modelo-compativel').value = config.provedorIA === 'compativel' ? config.modeloIA || '' : '';
  document.querySelector('#chave-compativel').value = config.provedorIA === 'compativel' ? config.chaveIA || '' : '';
  atualizarCampos();
});

function atualizarCampos() {
  camposGemini.hidden = provedor.value !== 'gemini';
  camposCompativel.hidden = provedor.value !== 'compativel';
}

provedor.addEventListener('change', atualizarCampos);

for (const [id, campoId] of [['mostrar-chave', 'chave'], ['mostrar-chave-compativel', 'chave-compativel']]) {
  document.querySelector(`#${id}`).addEventListener('click', evento => {
    const campo = document.querySelector(`#${campoId}`);
    const mostrar = campo.type === 'password';
    campo.type = mostrar ? 'text' : 'password';
    evento.currentTarget.textContent = mostrar ? 'Ocultar' : 'Mostrar';
  });
}

function origemPermitida(url) {
  const endereco = new URL(url);
  if (endereco.protocol !== 'https:' && !(endereco.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(endereco.hostname))) {
    throw new Error('Use HTTPS. HTTP só é aceito para serviços locais neste computador.');
  }
  if (endereco.username || endereco.password || endereco.search || endereco.hash) throw new Error('O endereço base não pode conter usuário, senha, parâmetros ou fragmento.');
  return `${endereco.origin}/*`;
}

document.querySelector('#salvar').addEventListener('click', async () => {
  try {
    if (provedor.value === 'gemini') {
      const chave = document.querySelector('#chave').value.trim();
      if (!chave) {
        await apiNavegador.storage.local.remove(['chaveGemini', 'chaveIA']);
        estado.textContent = 'Chave removida. Cole uma chave para usar a análise.';
        return;
      }
      await apiNavegador.storage.local.set({ provedorIA: 'gemini', chaveGemini: chave, modeloGemini: document.querySelector('#modelo').value });
      estado.textContent = 'Configuração do Gemini salva neste navegador.';
      return;
    }

    const urlBase = document.querySelector('#url-api').value.trim().replace(/\/+$/, '');
    const modelo = document.querySelector('#modelo-compativel').value.trim();
    const chave = document.querySelector('#chave-compativel').value.trim();
    if (!urlBase || !modelo || !chave) throw new Error('Preencha o endereço base, o modelo e a chave fornecidos pelo serviço.');
    const origem = origemPermitida(urlBase);
    const autorizado = await apiNavegador.permissions.request({ origins: [origem] });
    if (!autorizado) throw new Error('O navegador não concedeu acesso ao domínio da API.');
    await apiNavegador.storage.local.set({ provedorIA: 'compativel', urlBaseIA: urlBase, modeloIA: modelo, chaveIA: chave });
    estado.textContent = 'Configuração salva. O domínio informado recebeu permissão para as chamadas da extensão.';
  } catch (erro) {
    estado.textContent = erro.message || 'Não foi possível salvar a configuração.';
  }
});
