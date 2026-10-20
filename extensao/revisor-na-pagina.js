(() => {
  const apiNavegador = globalThis.browser ?? globalThis.chrome;
  const limiteDiff = 95_000;
  const papeis = [
    ['revisor', 'Revisor de código'],
    ['seguranca', 'Especialista em segurança'],
    ['testes', 'Especialista em testes'],
    ['mantenedor', 'Pessoa mantenedora'],
    ['autor', 'Par de programação']
  ];
  let caminhoAtual = '';
  let diffAtual = '';
  let historico = [];
  let ocupado = false;
  let elementos;
  let versaoPagina = 0;

  function rotaCompativel() {
    return /^\/[^/]+\/[^/]+\/(commit|pull|compare)\//.test(location.pathname);
  }

  function urlDoDiff() {
    const partes = location.pathname.split('/').filter(Boolean);
    const dono = partes[0], repositorio = partes[1], tipo = partes[2];
    if (!dono || !repositorio) return null;
    const raiz = `/${dono}/${repositorio}`;
    if (tipo === 'pull' && /^\d+/.test(partes[3] || '')) return `${raiz}/pull/${partes[3].match(/^\d+/)[0]}.diff`;
    if (tipo === 'commit' && partes[3]) return `${raiz}/commit/${partes[3]}.diff`;
    if (tipo === 'compare' && partes[3]) return `${raiz}/compare/${partes.slice(3).join('/')}.diff`;
    return null;
  }

  async function lerDiff() {
    if (/\.diff$/.test(location.pathname)) return document.body.innerText.trim();
    const url = urlDoDiff();
    if (url) {
      try {
        const resposta = await fetch(url, { credentials: 'include', cache: 'no-store', signal: AbortSignal.timeout(20000) });
        if (resposta.ok) {
          const texto = await resposta.text();
          if (/^diff --git |^From [0-9a-f]{7,}/m.test(texto)) return texto.trim();
        }
      } catch { /* Usa o diff que o GitHub já renderizou na página. */ }
    }
    const blocos = [...document.querySelectorAll('.js-diff-progressive-container, .file-diff, .diff-table, [data-testid*="diff"]')];
    const textos = blocos.map(bloco => bloco.innerText?.trim()).filter(texto => texto && /(^|\n)[+\- ]{1}.+/m.test(texto));
    if (textos.length) return [...new Set(textos)].join('\n\n').trim();
    throw new Error('Não encontrei o diff nesta página. Abra a aba Files changed de um pull request ou uma página de commit.');
  }

  function criarPainel() {
    if (document.querySelector('#explica-pr-raiz')) return;
    const raiz = document.createElement('div');
    raiz.id = 'explica-pr-raiz';
    const sombra = raiz.attachShadow({ mode: 'open' });
    sombra.innerHTML = `
      <style>
        :host{all:initial;color:#1b2620;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:13px;line-height:1.45}*{box-sizing:border-box}.caixa{position:fixed;z-index:2147483646;right:20px;bottom:20px;width:390px;height:min(650px,calc(100vh - 40px));display:flex;flex-direction:column;background:#fff;border:1px solid #dfe6e0;border-radius:14px;box-shadow:0 16px 55px #14261d33;overflow:hidden}.cabecalho{padding:13px 14px;background:#f8faf8;border-bottom:1px solid #e6ebe7}.linha-topo{display:flex;align-items:center;justify-content:space-between;gap:8px}.marca{font-weight:750;font-size:14px;letter-spacing:-.3px}.marca span{color:#176b4b}.acoes{display:flex;gap:6px}.icone{border:1px solid #e0e6e1;border-radius:6px;background:white;color:#546159;padding:5px 8px;font-size:12px;cursor:pointer}.papel{width:100%;margin-top:10px;border:1px solid #dce4de;border-radius:6px;background:white;padding:8px 9px;color:#284336;font:600 11px system-ui,sans-serif}.contexto{padding:8px 14px;background:#f0f7f2;border-bottom:1px solid #e3eee6;color:#527260;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mensagens{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:11px;scroll-behavior:smooth}.mensagem{max-width:96%;border-radius:9px;padding:10px 11px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px;line-height:1.6}.ia{align-self:flex-start;background:#f3f5f3;color:#29372f}.pessoa{align-self:flex-end;background:#176b4b;color:white}.espera{color:#68746e;font-style:italic}.composer{border-top:1px solid #e6ebe7;padding:10px;background:#fff}.entrada{width:100%;min-height:66px;max-height:130px;resize:vertical;border:1px solid #dfe6e0;border-radius:8px;padding:9px;color:#1b2620;font:12px/1.5 system-ui,sans-serif;outline:none}.entrada:focus{border-color:#73a389;box-shadow:0 0 0 3px #176b4b13}.linha-envio{display:flex;align-items:center;justify-content:space-between;margin-top:7px;gap:8px}.dica{color:#8a948d;font-size:9px}.enviar{border:0;border-radius:6px;background:#176b4b;color:#fff;padding:8px 12px;font:650 11px system-ui,sans-serif;cursor:pointer}.enviar:disabled{opacity:.5;cursor:wait}.config{border:0;background:none;color:#176b4b;padding:0;font:600 11px system-ui,sans-serif;text-decoration:underline;cursor:pointer}.fechado{width:52px;height:52px;position:fixed;z-index:2147483646;right:20px;bottom:20px;border:0;border-radius:50%;background:#176b4b;color:#fff;font-size:19px;box-shadow:0 5px 20px #14261d40;cursor:pointer}.oculto{display:none!important}@media(max-width:520px){.caixa{right:8px;bottom:8px;width:calc(100vw - 16px);height:min(76vh,650px)}.fechado{right:12px;bottom:12px}}
      </style>
      <section class="caixa" aria-label="Conversa de revisão Explica PR">
        <header class="cabecalho"><div class="linha-topo"><div class="marca">{·} explica<span>pr</span></div><div class="acoes"><button class="icone configuracoes" title="Configurar a chave da IA">⚙</button><button class="icone recolher" title="Recolher conversa" aria-label="Recolher conversa">−</button></div></div>
          <select class="papel" aria-label="Escolher função de desenvolvimento">${papeis.map(([valor, nome]) => `<option value="${valor}">${nome}</option>`).join('')}</select>
        </header>
        <div class="contexto">Detectando as alterações deste commit…</div>
        <div class="mensagens" aria-live="polite"></div>
        <form class="composer"><textarea class="entrada" placeholder="Pergunte sobre este diff…" aria-label="Escreva uma pergunta sobre o diff"></textarea><div class="linha-envio"><span class="dica">Enter para enviar · Shift+Enter para nova linha</span><button class="enviar" type="submit">Enviar ↑</button></div></form>
      </section>
      <button class="fechado oculto" aria-label="Abrir conversa Explica PR" title="Abrir Explica PR">{·}</button>`;
    document.documentElement.appendChild(raiz);
    elementos = {
      raiz, caixa: sombra.querySelector('.caixa'), fechado: sombra.querySelector('.fechado'),
      papel: sombra.querySelector('.papel'), contexto: sombra.querySelector('.contexto'),
      mensagens: sombra.querySelector('.mensagens'), formulario: sombra.querySelector('.composer'),
      entrada: sombra.querySelector('.entrada'), enviar: sombra.querySelector('.enviar')
    };
    sombra.querySelector('.recolher').addEventListener('click', () => { elementos.caixa.classList.add('oculto'); elementos.fechado.classList.remove('oculto'); });
    elementos.fechado.addEventListener('click', () => { elementos.caixa.classList.remove('oculto'); elementos.fechado.classList.add('oculto'); });
    sombra.querySelector('.configuracoes').addEventListener('click', abrirConfiguracoes);
    elementos.papel.addEventListener('change', () => {
      apiNavegador.storage.local.set({ papelGemini: elementos.papel.value });
      if (ocupado) return;
      iniciarRevisao(true, versaoPagina);
    });
    elementos.formulario.addEventListener('submit', enviarPergunta);
    elementos.entrada.addEventListener('keydown', evento => {
      if (evento.key === 'Enter' && !evento.shiftKey) { evento.preventDefault(); elementos.formulario.requestSubmit(); }
    });
  }

  function adicionarMensagem(texto, tipo = 'ia') {
    const mensagem = document.createElement(tipo === 'config' ? 'button' : 'div');
    mensagem.className = `mensagem ${tipo}`;
    mensagem.textContent = texto;
    if (tipo === 'config') {
      mensagem.type = 'button';
      mensagem.addEventListener('click', abrirConfiguracoes);
    }
    elementos.mensagens.appendChild(mensagem);
    elementos.mensagens.scrollTop = elementos.mensagens.scrollHeight;
    return mensagem;
  }

  function abrirConfiguracoes() {
    apiNavegador.runtime.sendMessage({ tipo: 'abrir-configuracoes' });
  }

  function chamada(historicoAtual, papel) {
    return apiNavegador.runtime.sendMessage({ tipo: 'conversar', papel, historico: historicoAtual });
  }

  async function iniciarRevisao(repetir, versao = versaoPagina) {
    if (!elementos || !rotaCompativel()) return;
    ocupado = true;
    elementos.enviar.disabled = true;
    elementos.papel.disabled = true;
    elementos.mensagens.replaceChildren();
    elementos.contexto.textContent = `${document.title.replace(/\s*[|·].*$/, '')} · lendo o diff desta página`;
    try {
      const diff = repetir || !diffAtual ? await lerDiff() : diffAtual;
      if (versao !== versaoPagina) return;
      diffAtual = diff;
      if (diffAtual.length > limiteDiff) throw new Error('O diff ultrapassa 95 mil caracteres. Abra um commit menor ou um pull request dividido em partes.');
      const papel = elementos.papel.value;
      const nomePapel = papeis.find(([valor]) => valor === papel)?.[1] || 'Revisor de código';
      elementos.contexto.textContent = `${nomePapel} · ${Math.ceil(diffAtual.length / 1000)} mil caracteres analisados`;
      adicionarMensagem(`Li as alterações desta página. Vou revisar como ${nomePapel.toLocaleLowerCase()}.`, 'espera');
      historico = [{ role: 'user', texto: `Faça a revisão automática deste diff. Comece pelo resultado mais importante. Para achados, informe gravidade, arquivo e linha aproximada.\n\n<diff>\n${diffAtual}\n</diff>` }];
      const resposta = await chamada(historico, papel);
      if (versao !== versaoPagina) return;
      if (!resposta?.ok) {
        historico = [];
        if (resposta?.erro?.includes('Configure sua chave')) {
          adicionarMensagem(`${resposta.erro} Depois de salvar, recarregue esta página para iniciar a revisão.`);
          adicionarMensagem('Abrir configurações da extensão', 'config');
        } else throw new Error(resposta?.erro || 'Não foi possível iniciar a revisão.');
      } else {
        historico.push({ role: 'model', texto: resposta.texto });
        adicionarMensagem(resposta.texto);
      }
    } catch (erro) {
      if (versao !== versaoPagina) return;
      historico = [];
      adicionarMensagem(erro.message || 'Não consegui ler as alterações desta página.');
    } finally {
      if (versao === versaoPagina && elementos) {
        ocupado = false;
        elementos.enviar.disabled = false;
        elementos.papel.disabled = false;
      }
    }
  }

  async function enviarPergunta(evento) {
    evento.preventDefault();
    const pergunta = elementos.entrada.value.trim();
    if (!pergunta || ocupado) return;
    if (!diffAtual) { adicionarMensagem('Ainda estou lendo o diff. Aguarde um instante.'); return; }
    if (!historico.length || historico.at(-1)?.role !== 'model') {
      adicionarMensagem('A revisão automática não terminou. Confira sua chave da API e recarregue a página para iniciar uma nova revisão.');
      return;
    }
    elementos.entrada.value = '';
    adicionarMensagem(pergunta, 'pessoa');
    historico.push({ role: 'user', texto: pergunta });
    if (historico.length > 13) historico = [historico[0], historico[1], ...historico.slice(2).slice(-9)];
    const papel = elementos.papel.value;
    ocupado = true;
    elementos.enviar.disabled = true;
    elementos.papel.disabled = true;
    const espera = adicionarMensagem('Pensando sobre o diff e a conversa…', 'espera');
    try {
      const resposta = await chamada(historico, papel);
      espera.remove();
      if (!resposta?.ok) throw new Error(resposta?.erro || 'Não foi possível responder.');
      historico.push({ role: 'model', texto: resposta.texto });
      if (historico.length > 13) historico = [historico[0], historico[1], ...historico.slice(2).slice(-8)];
      adicionarMensagem(resposta.texto);
    } catch (erro) {
      if (historico.at(-1)?.role === 'user') historico.pop();
      espera.textContent = erro.message || 'Não foi possível responder. Tente novamente.';
    } finally {
      ocupado = false;
      elementos.enviar.disabled = false;
      elementos.papel.disabled = false;
      elementos.entrada.focus();
    }
  }

  async function acompanharPagina() {
    if (location.pathname === caminhoAtual) return;
    caminhoAtual = location.pathname;
    versaoPagina += 1;
    const versao = versaoPagina;
    diffAtual = '';
    historico = [];
    ocupado = false;
    if (!rotaCompativel()) {
      document.querySelector('#explica-pr-raiz')?.remove();
      elementos = null;
      return;
    }
    criarPainel();
    const config = await apiNavegador.storage.local.get(['papelGemini']);
    if (versao !== versaoPagina || !elementos) return;
    if (config.papelGemini && papeis.some(([valor]) => valor === config.papelGemini)) elementos.papel.value = config.papelGemini;
    await iniciarRevisao(false, versao);
  }

  for (const evento of ['turbo:load', 'turbo:render', 'pjax:end', 'popstate', 'hashchange']) {
    window.addEventListener(evento, () => setTimeout(acompanharPagina, 100));
  }
  acompanharPagina();
})();
