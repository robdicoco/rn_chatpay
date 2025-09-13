# 📋 Checklist de Entrega Final — ChatPay Go Xion

## 1. Descrição do Projeto

ChatPay Go Xion é um aplicativo mobile de chat financeiro que integra pagamentos, com autenticação via blockchain XION e provas ZK (Zero-Knowledge) usando o Reclaim Protocol. O app permite que usuários conectem suas carteiras, participem de programas de incentivo (ex: para estudantes Web3 ou desenvolvedores globais), e realizem transações seguras, rápidas e privadas.  

---

## 2. Tech Stack

- **Linguagens:** TypeScript, JavaScript
- **Frameworks:** React Native (Expo)
- **Gerenciamento de Estado:** Zustand
- **Blockchain:** XION (CosmWasm), Abstraxion SDK
- **Provas ZK:** Reclaim Protocol (zkTLS, RUM, zkFetch)
- **UI/UX:** Design System próprio, Expo Router, LinearGradient, Lucide Icons
- **Testes:** Jest, React Native Testing Library
- **Outros:** AsyncStorage, Expo WebBrowser, CosmJS, Deep Linking

---

## 3. Checklist de Entrega

| Requisito                                                                 | Status/Observação                                                                                   |
|---------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| Projeto funcional com ferramentas exigidas                                 | ✅ React Native + Expo + XION + Reclaim + Zustand implementados                                     |
| Descrição do projeto (100-300 palavras)                                    | ✅ Incluída acima                                                                                   |
| Tech Stack detalhado                                                       | ✅ Incluído acima                                                                                   |
| Vídeo de demonstração (<3min, mostrando app funcionando no dispositivo)    | ❌ Precisa gravar, subir no YouTube/Vimeo e incluir link                                            |
| Link público do repositório                                                | ❌ Precisa garantir que o repo está público e incluir link                                          |
| Licença Open Source                                                        | ❌ Adicionar arquivo LICENSE (ex: MIT)                                                              |
| Link de demo/protótipo funcional (hosted app)                             | ❌ Precisa subir APK ou link de demo/testnet                                                        |
| Screenshot da UI ou diagrama de arquitetura                                | ❌ Adicionar imagem no README ou pasta /assets                                                      |
| Instruções de instalação (README)                                          | ❌ Garantir que README tem passo a passo para rodar localmente, dependências, .env, build, etc      |
| Explicação de como o projeto resolve o Problem Statement                   | ❌ Adicionar seção no README explicando como o app resolve o desafio proposto                       |
| Link para demo funcional no Testnet da XION                                | ❌ Garantir que o app está rodando na testnet e incluir link/acesso                                 |
| Pitch Deck/Apresentação (opcional)                                         | ❓ Se possível, criar slides ou vídeo curto explicando o projeto                                    |
| Lista de APIs/Serviços externos usados                                     | ✅ Reclaim, XION, CosmJS, etc.                                                                      |
| Roadmap pós-hackathon (opcional)                                           | ❓ Adicionar roadmap futuro no README ou documento separado                                          |

---

## 4. Feature ZK: Aprovação em Programa de Incentivo (Conta GitHub)

**Objetivo:**  
Permitir que o usuário participe de um programa de incentivo (ex: “Desenvolvedores Globais”) e seja aprovado automaticamente via prova ZK, sem expor dados sensíveis.

**Critério utilizado:**  
- **Prova de posse de conta no GitHub**  
  - Utiliza o provider “GitHub” já disponível no Reclaim Protocol.
  - O app inicia o fluxo de verificação, o usuário faz login no GitHub via Reclaim, e o protocolo gera uma prova ZK do nome de usuário.
  - O app recebe a prova e verifica se o campo `github_username` (ou similar) existe e é válido.
  - Se o campo for válido, grava no contrato RUM na XION, que valida e armazena o valor.
  - O app faz uma query no RUM e verifica se o usuário atende ao critério.
  - Exibe mensagem de “Aprovado” ou “Reprovado” conforme o resultado.

**Fluxo técnico resumido:**
1. Usuário clica em “Participar”.
2. App chama função para iniciar verificação zkTLS via Reclaim (provider GitHub).
3. Recebe `verificationResult` com o campo `github_username`.
4. Verifica se o campo existe e é válido.
5. Monta e envia transação para o contrato RUM (CosmWasm) com a prova.
6. Faz query no RUM para ler o valor gravado.
7. Se o nome de usuário for válido, mostra “✅ Você foi aprovado!”; senão, “❌ Você não possui os requisitos”.

**Exemplo de código para o fluxo:**
```tsx
const handleParticipate = async () => {
  setLoading(true);
  try {
    const githubUsername = await verifyAndStoreGithubAccount(); // starts zkTLS flow + stores in RUM
    const isValid = !!githubUsername;
    setStatus(isValid ? "approved" : "rejected");
    Alert.alert(isValid ? "You have been approved 🎉" : "You do not meet the requirements");
  } catch (e) {
    Alert.alert("Error", e?.message ?? "Verification process failed");
  } finally {
    setLoading(false);
  }
};

Observação:
Esse critério pode ser facilmente adaptado para outros provedores/campos conforme o objetivo do programa.

5. Roadmap Pós-Hackathon (Sugestão)
Expandir critérios de programas de incentivo (novos provedores Reclaim)
Adicionar novos tipos de provas ZK (ex: e-mail institucional, Discord, Telegram)
Melhorar UX e onboarding
Integração com mais contratos CosmWasm
Lançar versão pública na Play Store/App Store