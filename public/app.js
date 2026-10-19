const campo = document.querySelector('#diff');
const contador = document.querySelector('#contador');
const botao = document.querySelector('#analisar');
const resultado = document.querySelector('#resultado');
const saida = document.querySelector('#texto');
let formato = 'engenharia';

campo.addEventListener('input', () => { contador.textContent = `${campo.value.length.toLocaleString('pt-BR')} caracteres`; });
document.querySelectorAll('.opcao').forEach(opcao => opcao.addEventListener('click', () => {
  document.querySelectorAll('.opcao').forEach(item => item.classList.remove('selecionada'));
  opcao.classList.add('selecionada'); formato = opcao.dataset.formato;
}));
document.querySelector('#exemplo').addEventListener('click', () => {
  campo.value = `diff --git a/src/limite.js b/src/limite.js\nindex 1ab3cde..4fd9012 100644\n--- a/src/limite.js\n+++ b/src/limite.js\n@@ -1,5 +1,8 @@\n export function calcularTotal(itens) {\n-  return itens.reduce((soma, item) => soma + item.preco, 0);\n+  return itens.reduce((soma, item) => {\n+    const quantidade = item.quantidade ?? 1;\n+    return soma + item.preco * quantidade;\n+  }, 0);\n }`;
  campo.dispatchEvent(new Event('input'));
});
botao.addEventListener('click', async () => {
  botao.disabled = true; botao.querySelector('span').textContent = 'Analisando…';
  resultado.hidden = false; saida.textContent = 'Lendo as alterações e preparando a explicação…';
  resultado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  try {
    const resposta = await fetch('/api/explicar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ diff: campo.value, formato }) });
    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.erro || 'Não foi possível analisar o diff.');
    saida.textContent = dados.texto;
  } catch (erro) { saida.textContent = `Não foi possível gerar o resumo.\n\n${erro.message}`; }
  finally { botao.disabled = false; botao.querySelector('span').textContent = 'Explicar este diff'; }
});
document.querySelector('#copiar').addEventListener('click', async () => {
  await navigator.clipboard.writeText(saida.textContent);
  const botaoCopiar = document.querySelector('#copiar');
  botaoCopiar.textContent = 'Copiado!'; setTimeout(() => { botaoCopiar.textContent = 'Copiar resumo'; }, 1600);
});
