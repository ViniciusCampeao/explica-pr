# Explica PR

Uma ferramenta open source que transforma um diff de código em uma explicação clara para engenharia, produto ou liderança. O resumo traz o que mudou, por que importa, pontos de atenção e sugestões de teste.

## Começar

Requisitos: Node.js 20 ou mais recente e uma chave da API Gemini.

1. Clone este repositório e entre na pasta.
2. Copie `.env.exemplo` para `.env`.
3. Crie uma chave no [Google AI Studio](https://aistudio.google.com/apikey) e coloque-a em `GEMINI_API_KEY` no arquivo `.env`.
4. Execute `npm start` e abra [http://localhost:3000](http://localhost:3000).

A ferramenta tenta usar `gemini-3.8-flash` e, se o modelo não estiver disponível na sua conta, `gemini-3.5-flash`. O acesso gratuito depende do modelo, região, limites e condições vigentes do Google. Confira a [página oficial de preços](https://ai.google.dev/gemini-api/docs/pricing) e a [lista de modelos](https://ai.google.dev/gemini-api/docs/models).

## Privacidade

A chave fica no servidor e não é enviada ao navegador. O diff colado é enviado à API do Google Gemini para gerar o resumo. Não cole senhas, tokens, informações pessoais ou código confidencial. Revise a política e os termos do provedor antes de enviar código privado. Esta versão não guarda os diffs em banco de dados.

## Limites

- A análise depende do provedor e da disponibilidade da API.
- As explicações podem conter erros; revise antes de tomar decisões ou compartilhar.
- O modelo pode não citar linhas com precisão em diffs grandes.
- A demo local não tem autenticação nem limitação de requisições por pessoa. Não a publique em produção sem adicionar proteções contra abuso e custos inesperados.

## Contribuir

Abra uma issue com uma sugestão ou envie um pull request. Mantenha textos, interface e documentação em português do Brasil. Antes de contribuir, retire chaves, tokens, dados pessoais e conteúdo confidencial.

## Licença

Licença MIT. Consulte [LICENSE](LICENSE).
