const apiNavegador = globalThis.browser ?? globalThis.chrome;
const abrirConfiguracoes = () => apiNavegador.runtime.openOptionsPage();
document.querySelector('#abrir-configuracoes').addEventListener('click', abrirConfiguracoes);
document.querySelector('#configurar').addEventListener('click', abrirConfiguracoes);
