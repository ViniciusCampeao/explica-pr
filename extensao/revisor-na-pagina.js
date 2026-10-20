(() => {
  const apiNavegador = globalThis.browser ?? globalThis.chrome;
  const limiteDiff = 95_000;
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
        :host{all:initial;color:#ddd;font:13px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace}*{box-sizing:border-box}.caixa{position:fixed;z-index:2147483646;right:12px;bottom:12px;width:460px;height:min(680px,calc(100vh - 24px));display:flex;flex-direction:column;background:#111;border:1px solid #555;border-radius:0;box-shadow:none;overflow:hidden}.cabecalho{padding:9px 11px;background:#111;border-bottom:1px solid #555}.linha-topo{display:flex;align-items:center;justify-content:space-between;gap:8px}.marca{font-weight:700;font-size:13px}.marca span{color:#9ad9ac}.acoes{display:flex;gap:5px}.icone{border:1px solid #666;border-radius:0;background:#111;color:#ddd;padding:4px 8px;font:13px ui-monospace,monospace;cursor:pointer}.funcao{padding-top:7px;color:#9ad9ac}.contexto{padding:7px 11px;background:#171717;border-bottom:1px solid #444;color:#aaa;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mensagens{flex:1;overflow-y:auto;padding:11px;display:flex;flex-direction:column;gap:10px}.mensagem{max-width:100%;border-radius:0;padding:7px 9px;white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace}.ia{align-self:stretch;border-left:2px solid #777;background:#171717;color:#ddd}.pessoa{align-self:flex-end;max-width:85%;background:#252525;color:#9ad9ac}.espera{color:#aaa}.config{display:block;width:100%;text-align:left;border:1px solid #666;border-radius:0;background:#111;color:#9ad9ac;font:inherit;cursor:pointer}.composer{border-top:1px solid #555;padding:9px;background:#111}.entrada{width:100%;min-height:72px;max-height:140px;resize:vertical;border:1px solid #666;border-radius:0;background:#090909;padding:9px;color:#ddd;font:12px/1.5 ui-monospace,monospace;outline:none}.entrada:focus{border-color:#aaa}.linha-envio{display:flex;align-items:center;justify-content:space-between;margin-top:7px;gap:8px}.dica{color:#999;font-size:10px}.enviar{border:1px solid #777;border-radius:0;background:#222;color:#ddd;padding:6px 10px;font:12px ui-monospace,monospace;cursor:pointer}.enviar:disabled{color:#888;cursor:wait}.fechado{position:fixed;z-index:2147483646;right:12px;bottom:12px;padding:8px 10px;border:1px solid #666;border-radius:0;background:#111;color:#9ad9ac;font:12px ui-monospace,monospace;cursor:pointer}.oculto{display:none!important}@media(max-width:520px){.caixa{right:4px;bottom:4px;width:calc(100vw - 8px);height:min(76vh,680px)}.fechado{right:8px;bottom:8px}}
      </style>
      <section class="caixa" aria-label="Conversa de revisão Explica PR">
        <header class="cabecalho"><div class="linha-topo"><div class="marca">{·} explica<span>pr</span></div><div class="acoes"><button class="icone configuracoes" title="Configurar a chave da IA">⚙</button><button class="icone recolher" title="Recolher conversa" aria-label="Recolher conversa">−</button></div></div>
          <div class="funcao">agente: revisor de código</div>
        </header>
        <div class="contexto">$ aguardando foco da revisão</div>
        <div class="mensagens" aria-live="polite"></div>
        <form class="composer"><textarea class="entrada" placeholder="O que você quer que eu analise neste diff?" aria-label="Diga o que quer analisar"></textarea><div class="linha-envio"><span class="dica">Ex.: autenticação, erros ou desempenho</span><button class="enviar" type="submit">Analisar ↵</button></div></form>
      </section>
      <button class="fechado oculto" aria-label="Abrir conversa Explica PR" title="Abrir Explica PR">{·}</button>`;
    document.documentElement.appendChild(raiz);
    elementos = {
      raiz, caixa: sombra.querySelector('.caixa'), fechado: sombra.querySelector('.fechado'),
      contexto: sombra.querySelector('.contexto'),
      mensagens: sombra.querySelector('.mensagens'), formulario: sombra.querySelector('.composer'),
      entrada: sombra.querySelector('.entrada'), enviar: sombra.querySelector('.enviar')
    };
    sombra.querySelector('.recolher').addEventListener('click', () => { elementos.caixa.classList.add('oculto'); elementos.fechado.classList.remove('oculto'); });
    elementos.fechado.addEventListener('click', () => { elementos.caixa.classList.remove('oculto'); elementos.fechado.classList.add('oculto'); });
    sombra.querySelector('.configuracoes').addEventListener('click', abrirConfiguracoes);
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

  function chamada(historicoAtual) {
    return apiNavegador.runtime.sendMessage({ tipo: 'conversar', historico: historicoAtual });
  }

  async function iniciarRevisao(versao = versaoPagina) {
    if (!elementos || !rotaCompativel()) return;
    ocupado = true;
    elementos.enviar.disabled = true;
    elementos.mensagens.replaceChildren();
    elementos.contexto.textContent = `$ analisa ${location.pathname.split('/').filter(Boolean).slice(0, 4).join('/')}`;
    try {
      const diff = diffAtual || await lerDiff();
      if (versao !== versaoPagina) return;
      diffAtual = diff;
      if (diffAtual.length > limiteDiff) throw new Error('O diff ultrapassa 95 mil caracteres. Abra um commit menor ou um pull request dividido em partes.');
      elementos.contexto.textContent = '$ diff pronto · aguardando seu foco';
      adicionarMensagem('O que você quer que eu confira neste diff? Diga o ponto específico; vou me limitar a ele.');
    } catch (erro) {
      if (versao !== versaoPagina) return;
      historico = [];
      elementos.contexto.textContent = '$ erro';
      adicionarMensagem(erro.message || 'Não consegui ler as alterações desta página.');
    } finally {
      if (versao === versaoPagina && elementos) {
        ocupado = false;
        elementos.enviar.disabled = false;
      }
    }
  }

  async function enviarPergunta(evento) {
    evento.preventDefault();
    const pergunta = elementos.entrada.value.trim();
    if (!pergunta || ocupado) return;
    if (!diffAtual) { adicionarMensagem('Ainda estou lendo o diff. Aguarde um instante.'); return; }
    elementos.entrada.value = '';
    adicionarMensagem(pergunta, 'pessoa');
    const primeiraAnalise = historico.length === 0;
    if (primeiraAnalise) {
      historico = [{ role: 'user', texto: `Analise somente este foco: ${pergunta}. Não liste problemas de outras áreas.\n\n<diff>\n${diffAtual}\n</diff>` }];
    } else {
      historico.push({ role: 'user', texto: pergunta });
      if (historico.length > 13) historico = [historico[0], historico[1], ...historico.slice(2).slice(-9)];
    }
    ocupado = true;
    elementos.enviar.disabled = true;
    elementos.contexto.textContent = primeiraAnalise ? `$ analisando: ${pergunta.slice(0, 48)}` : '$ consultando o revisor';
    const espera = adicionarMensagem('aguarde…', 'espera');
    try {
      const resposta = await chamada(historico);
      espera.remove();
      if (!resposta?.ok) {
        if (resposta?.erro?.includes('Configure sua chave')) {
          elementos.contexto.textContent = '$ falta configurar a chave';
          adicionarMensagem(`${resposta.erro} Depois de salvar, tente novamente.`);
          adicionarMensagem('Abrir configurações da extensão', 'config');
          historico = [];
          return;
        }
        throw new Error(resposta?.erro || 'Não foi possível responder.');
      }
      historico.push({ role: 'model', texto: resposta.texto });
      if (historico.length > 13) historico = [historico[0], historico[1], ...historico.slice(2).slice(-8)];
      adicionarMensagem(resposta.texto);
      elementos.contexto.textContent = '$ pronto';
    } catch (erro) {
      if (historico.at(-1)?.role === 'user') historico.pop();
      espera.textContent = erro.message || 'Não foi possível responder. Tente novamente.';
      elementos.contexto.textContent = '$ erro';
    } finally {
      ocupado = false;
      elementos.enviar.disabled = false;
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
    if (versao !== versaoPagina || !elementos) return;
    await iniciarRevisao(versao);
  }

  for (const evento of ['turbo:load', 'turbo:render', 'pjax:end', 'popstate', 'hashchange']) {
    window.addEventListener(evento, () => setTimeout(acompanharPagina, 100));
  }
  acompanharPagina();
})();
