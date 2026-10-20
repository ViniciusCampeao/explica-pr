# Explica PR

Extensão de navegador que transforma um diff em uma explicação em português para engenharia, produto ou liderança. O resumo cobre o que mudou, por que importa, pontos de atenção e como testar.

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
5. Abra a extensão e acesse as configurações para salvar sua chave da API.

### Firefox

1. Baixe ou clone este repositório.
2. Abra `about:debugging#/runtime/this-firefox`.
3. Escolha **Carregar extensão temporária…** e selecione `extensao/manifest.json`.
4. Abra as configurações da extensão para salvar sua chave da API.

A instalação temporária do Firefox pode ser removida quando o navegador fechar. A distribuição permanente exige empacotamento e publicação pela loja do navegador.

## Gerar o pacote para baixar

Execute `python3 scripts/gerar-pacote.py`. O arquivo `distribuicao/explica-pr-extensao.zip` contém os arquivos da extensão prontos para extrair e carregar no navegador. A página estática em `distribuicao/` pode ser servida por qualquer host estático.

## Configurar a IA

1. Crie uma chave no [Google AI Studio](https://aistudio.google.com/apikey).
2. Abra as configurações da extensão e cole a chave.
3. Escolha o modelo Gemini disponível na sua conta.
4. Cole o diff de um pull request e selecione o público do resumo.

O Google pode oferecer uma faixa gratuita da API, mas modelos, cotas, disponibilidade, região e condições mudam. Consulte a [lista oficial de modelos](https://ai.google.dev/gemini-api/docs/models) e os [preços e limites](https://ai.google.dev/gemini-api/docs/pricing) antes de usar.

## Privacidade e chave da API

A chave é guardada no armazenamento local da extensão neste navegador. O diff e a chave são enviados diretamente à API do Google Gemini. Esta extensão não tem servidor próprio e não armazena diffs. Não cole senhas, tokens, dados pessoais ou código confidencial. Consulte os termos do provedor antes de enviar código privado e remova sua chave antes de compartilhar o perfil do navegador.

## Limites

- A explicação depende da disponibilidade e das cotas do serviço do Google.
- A IA pode cometer erros; revise o resumo antes de tomar decisões ou compartilhá-lo.
- Referências a arquivos e linhas podem ficar imprecisas em diffs grandes.
- Esta versão recebe o diff colado pela pessoa usuária; não lê automaticamente o conteúdo das páginas abertas.

## Contribuir

Sugestões e contribuições são bem-vindas. Mantenha a interface e a documentação em português do Brasil. Antes de enviar alterações, retire chaves, tokens, dados pessoais e conteúdo confidencial.

## Licença

Licença MIT. Consulte [LICENSE](LICENSE).
