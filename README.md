# Explica PR

Extensão de navegador para revisar código no GitHub. Ao abrir um commit, pull request ou comparação, o painel lê o diff e pergunta o que você quer conferir. Só envia o diff ao serviço de IA escolhido depois que você descreve o foco.

## Como pedir a revisão

Há um único agente: **Revisor de código**. Diga, por exemplo, “confira a autenticação” ou “procure problemas no tratamento de erros”. Ele se limita ao foco pedido e você pode continuar a conversa sobre o mesmo diff.

A extensão só injeta o painel em páginas de commit, pull request e comparação do `github.com`. Não lê outras abas, não acompanha histórico e não altera código ou comentários no GitHub.

## Navegadores

- **Chromium:** Chrome, Edge, Brave e outros navegadores compatíveis com extensões Manifest V3.
- **Firefox:** inclui identificador e compatibilidade com Manifest V3; carregue a extensão temporariamente para experimentar.
- Safari não está configurado nesta versão.

## Instalar para desenvolvimento

### Chrome, Edge ou Brave

1. Baixe ou clone este repositório.
2. Abra a página de extensões do navegador (`chrome://extensions`, `edge://extensions` ou `brave://extensions`).
3. Ative o **Modo do desenvolvedor**.
4. Escolha **Carregar sem compactação** e selecione a pasta `extensao`.
5. Abra as configurações da extensão e escolha Gemini ou uma API compatível com OpenAI. Em um commit ou pull request, escreva no painel o que quer analisar.

### Firefox

1. Baixe ou clone este repositório.
2. Abra `about:debugging#/runtime/this-firefox`.
3. Escolha **Carregar extensão temporária…** e selecione `extensao/manifest.json`.
4. Abra as configurações da extensão e escolha Gemini ou uma API compatível com OpenAI. Em um commit ou pull request, escreva no painel o que quer analisar.

A instalação temporária do Firefox pode ser removida quando o navegador fechar. A distribuição permanente exige empacotamento e publicação pela loja do navegador.

## Gerar o pacote para baixar

Execute `python3 scripts/gerar-pacote.py`. O arquivo `distribuicao/explica-pr-extensao.zip` contém os arquivos da extensão prontos para extrair e carregar no navegador. A página estática em `distribuicao/` pode ser servida por qualquer host estático.

## Configurar o serviço de IA

Nas configurações, escolha uma das opções:

- **Google Gemini:** crie uma chave no [Google AI Studio](https://aistudio.google.com/apikey) e escolha um modelo disponível para ela.
- **API compatível com OpenAI:** informe o endereço base, o identificador do modelo e uma chave emitida pelo serviço escolhido. O endereço normalmente termina na versão da API, como `/v1`; a extensão acrescenta `/chat/completions`. Chaves e modelos dependem do serviço. Uma chave Gemini não funciona em outro provedor, nem o contrário.

Ao salvar uma API compatível, o navegador pede permissão para o domínio informado. A extensão só faz chamadas para esse domínio. Use HTTPS; HTTP é aceito apenas para `localhost` e `127.0.0.1`.

Depois, abra um commit, pull request ou comparação no GitHub e diga o que quer que o revisor procure.

O Google pode oferecer uma faixa gratuita da API, mas modelos, cotas, disponibilidade, região e condições mudam. Consulte a [lista oficial de modelos](https://ai.google.dev/gemini-api/docs/models) e os [preços e limites](https://ai.google.dev/gemini-api/docs/pricing) antes de usar.

## Privacidade e chave da API

A chave fica no armazenamento local da extensão neste navegador. A extensão lê o diff de páginas de commit, pull request e comparação do GitHub, mas só envia o diff e as mensagens ao serviço escolhido depois que você informa o que quer analisar. A chave acompanha a chamada para autenticação. O restante da página não é enviado. A extensão não tem servidor próprio e não guarda diffs nem conversas. Cada análise pode consumir sua cota ou gerar cobrança conforme as regras do provedor. Evite enviar senhas, tokens, dados pessoais ou código confidencial.

## Atualizações

Um publicador na VPS acompanha a branch `main` e atualiza a página e o ZIP em até cerca de um minuto depois de cada mudança. Se instalou a extensão pelo modo de desenvolvedor, o navegador não substitui os arquivos sozinho: baixe o ZIP novo, atualize a pasta e recarregue a extensão em `chrome://extensions` ou `about:debugging`. Atualizações automáticas do navegador exigem distribuição pela loja correspondente: [Chrome Web Store](https://developer.chrome.com/docs/extensions/develop/concepts/extensions-update-lifecycle) ou [Firefox Add-ons](https://extensionworkshop.com/documentation/manage/updating-your-extension/).

## Limites

- A análise depende da disponibilidade, compatibilidade e das cotas do serviço escolhido. “Compatível com OpenAI” não garante suporte a todos os modelos, parâmetros ou formatos de cada provedor.
- O revisor pode errar; confira os achados antes de agir sobre eles.
- Referências a arquivos e linhas podem ficar imprecisas em diffs grandes.
- O painel só funciona em páginas de commit, pull request e comparação hospedadas em `github.com`.
- A extensão apresenta achados e sugestões; não aprova, comenta nem altera o pull request.

## Contribuir

Sugestões e contribuições são bem-vindas. Mantenha a interface e a documentação em português do Brasil. Antes de enviar alterações, retire chaves, tokens, dados pessoais e conteúdo confidencial.

## Licença

Licença MIT. Consulte [LICENSE](LICENSE).
