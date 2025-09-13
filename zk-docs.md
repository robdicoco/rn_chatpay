# zk Integration Guide (Reclaim + XION) <!-- markdownlint-disable MD001 MD024 -->

> **Objetivo:** Este guia reúne, em **Markdown**, tudo que você precisa para implementar **funcionalidades ZK** no seu app (ex.: ChatPay Go) usando **Reclaim Protocol** no **XION** (CosmWasm), contemplando:
>
> * **zkTLS** no mobile (provas verificáveis de interações HTTPS sem expor dados).
> * **RUM (Reclaim User Map)** para armazenar dados verificados por usuário.
> * **Provedores customizados** no Reclaim (ex.: Kaggle/e-mail).
> * **zkFetch** para gerar provas sobre respostas de APIs sem oráculos.
>
> O conteúdo foi consolidado a partir da documentação que você forneceu e está pronto para servir de **referência do Copilot** no seu repositório.

---

## Sumário

* [Visão Geral](#visão-geral)
* [Pré-requisitos](#pré-requisitos)
* [Conceitos Essenciais](#conceitos-essenciais)
* [Contratos e Endereços Importantes](#contratos-e-endereços-importantes)
* [RUM (Reclaim User Map)](#rum-reclaim-user-map)

  * [Instanciação](#instanciação)
  * [Mensagem de atualização (`executeMsg`)](#mensagem-de-atualização-executemsg)
  * [Leitura de dados (query)](#leitura-de-dados-query)
* [Setup do App Móvel (Expo/React Native)](#setup-do-app-móvel-exporeact-native)

  * [Variáveis de Ambiente (`.env.local`)](#variáveis-de-ambiente-envlocal)
  * [Fluxo de Verificação no App](#fluxo-de-verificação-no-app)
  * [Exemplo de UI: Card “Programa de Incentivo”](#exemplo-de-ui-card-programa-de-incentivo)
* [Criando um Provedor Customizado (Ex.: Kaggle → e-mail)](#criando-um-provedor-customizado-ex-kaggle--e-mail)

  * [Fluxo de Criação e Publicação](#fluxo-de-criação-e-publicação)
* [zkFetch (Provas sobre APIs sem Oráculos)](#zkfetch-provas-sobre-apis-sem-oráculos)

  * [Uso Básico](#uso-básico)
  * [Quick Start do Cliente de Exemplo](#quick-start-do-cliente-de-exemplo)
  * [Exemplos de `responseMatches`/regex](#exemplos-de-responsematchesregex)
  * [Exemplo de Integração com CosmWasm](#exemplo-de-integração-com-cosmwasm)
* [MVP Sugerido para o ChatPay Go](#mvp-sugerido-para-o-chatpay-go)
* [Boas Práticas de Segurança](#boas-práticas-de-segurança)
* [Troubleshooting](#troubleshooting)
* [Referências (fornecidas)](#referências-fornecidas)

---

## Visão Geral

* **zkTLS (Reclaim):** o usuário prova fatos obtidos via HTTPS (p.ex., *followers\_count* no X/Twitter) **sem expor a resposta completa** nem credenciais.
* **Verificação on-chain:** o contrato verificador da Reclaim em XION valida a prova.
* **Persistência (RUM):** dados verificados por usuário são gravados em um contrato “user map” (RUM), indexados pelo endereço do usuário.
* **zkFetch:** gera ZKPs sobre **campos específicos de respostas de APIs** (sem oráculo), ideal para provar “eu vi `X` no endpoint `Y`”.

---

## Pré-requisitos

* **Node.js (LTS) + npm**
* **Ambiente Expo/React Native** configurado (Android Emulator, iOS Simulator ou dispositivo físico).
* Acesso ao **Reclaim Developer Portal** e **app Reclaim (Android)** quando for criar/usar provedores ou zkFetch.

> Guia útil: *Local App Development (Expo)* e *Set up your XION Mobile Environment* (da documentação fornecida).

---

## Conceitos Essenciais

* **Prova zkTLS (Reclaim):** contém `claimData` e `signatures` que permitem verificação **sem confiança no servidor HTTP**.
* **Provider (Reclaim):** especifica *de onde* e *o que* extrair (p.ex., “Twitter User Profile” → `followers_count`).
* **RUM Contract:** armazena **JSON por usuário**; recebe provas e grava um valor com base em um `claim_key` (ex.: `"followers_count"`).
* **Verification Contract:** contrato da Reclaim que valida se a prova é legítima (assinaturas, witness, timestamp, etc.).
* **zkFetch:** biblioteca que executa requisição HTTP, extrai campos por regex e gera prova ZK somente dos campos definidos.

---

## Contratos e Endereços Importantes

* **Reclaim Verification Contract (XION Testnet):**

  ```
  xion1qf8jtznwf0tykpg7e65gwafwp47rwxl4x2g2kldvv357s6frcjlsh2m24e
  ```
* **RUM Contract (código publicado na referência):**

  * `CODE_ID` (testnet): `1289`
  * Parâmetros na instanciação:

    * `verification_addr` (endereço acima, se usar o verificador padrão)
    * `claim_key` (ex.: `"followers_count"`)

> **Observação:** Se você usar **seu próprio verificador**, ajuste **ambos**: `verification_addr` e `claim_key`.

---

## RUM (Reclaim User Map)

Contrato para **armazenar dados verificados por usuário** em formato JSON, com **chave** baseada em um campo de prova (ex.: `followers_count`).

### Instanciação

```ts
// Requer: signing client (CosmWasm), conta do usuário, e acesso ao RPC/REST XION.
const instantiateRUMContract = async ({
  accountBech32,
  client,
}: {
  accountBech32: string;
  client: any; // CosmWasm signing client
}) => {
  const instantiateMsg = {
    verification_addr: "xion1qf8jtznwf0tykpg7e65gwafwp47rwxl4x2g2kldvv357s6frcjlsh2m24e", // verificador padrão
    claim_key: "followers_count", // chave a ser armazenada
  };

  const CODE_ID = 1289;

  const res = await client.instantiate(
    accountBech32,
    CODE_ID,
    instantiateMsg,
    "rum-init",
    "auto"
  );

  console.log("RUM contract instantiated:", res);
  return res.contractAddress;
};
```

### Mensagem de atualização (`executeMsg`)

Use após obter `verificationResult` (zkTLS, via Reclaim):

```ts
// Extração conforme estrutura fornecida
const claimInfo = {
  provider: verificationResult.proofs[0].claimData.provider,
  parameters: verificationResult.proofs[0].claimData.parameters,
  context: verificationResult.proofs[0].claimData.context,
};

const signedClaim = {
  claim: {
    identifier: verificationResult.proofs[0].claimData.identifier,
    owner: verificationResult.proofs[0].claimData.owner,
    epoch: verificationResult.proofs[0].claimData.epoch,
    timestampS: verificationResult.proofs[0].claimData.timestampS,
  },
  signatures: verificationResult.proofs[0].signatures,
};

const executeMsg = {
  update: {
    value: {
      proof: {
        claimInfo,
        signedClaim,
      },
    },
  },
};

// Envio
const tx = await client.execute(
  accountBech32,
  RUM_CONTRACT_ADDRESS,
  executeMsg,
  "auto"
);
```

> O RUM chama o **Verification Contract** na cadeia para aceitar/recusar a atualização com base na validade da prova.

### Leitura de dados (query)

> **Atenção:** O schema de **query** depende da versão do contrato RUM instanciado. Consulte o JSON schema do contrato que você lançou a partir do quickstart/PR.
> Em geral, você fará uma query **smart** para obter o valor associado ao endereço do usuário. Exemplo **genérico**:

```ts
// Exemplo genérico (ajuste para o schema real do seu RUM):
const queryFollowers = async (restEndpoint: string, contractAddr: string, userAddr: string) => {
  const queryMsg = {
    // consulte o schema do RUM; exemplos comuns:
    // get_value: { key: userAddr }
    // or
    // user: { address: userAddr }
  };

  const url = `${restEndpoint}/cosmwasm/wasm/v1/contract/${contractAddr}/smart/${btoa(JSON.stringify(queryMsg))}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Query failed: ${res.status}`);
  const json = await res.json();

  // Extraia o campo conforme o schema retornado
  // p.ex.: const followers = json.data?.followers_count ?? 0;
  return json;
};
```

---

## Setup do App Móvel (Expo/React Native)

### Variáveis de Ambiente (`.env.local`)

```dotenv
EXPO_PUBLIC_TREASURY_CONTRACT_ADDRESS="treasury-contract-address"
EXPO_PUBLIC_RPC_ENDPOINT="https://rpc.xion-testnet-2.burnt.com:443"
EXPO_PUBLIC_REST_ENDPOINT="https://api.xion-testnet-2.burnt.com"

EXPO_PUBLIC_RECLAIM_APP_ID="your-reclaim-app-id"
EXPO_PUBLIC_RECLAIM_APP_SECRET="your-reclaim-secret"
EXPO_PUBLIC_RECLAIM_PROVIDER_ID="your-reclaim-provider-id" # httpProviderId (ex.: Twitter User Profile)

EXPO_PUBLIC_RUM_CONTRACT_ADDRESS="your-rum-contract-address"
```

| Variável                                | Descrição                                                                                             |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_TREASURY_CONTRACT_ADDRESS` | Contrato de *treasury* usado para transações sem gás (gasless) e permissões de execução via User Map. |
| `EXPO_PUBLIC_RPC_ENDPOINT`              | Endpoint RPC do Xion (padrão de testnet).                                                             |
| `EXPO_PUBLIC_REST_ENDPOINT`             | Endpoint REST do Xion (padrão de testnet).                                                            |
| `EXPO_PUBLIC_RUM_CONTRACT_ADDRESS`      | Endereço da instância do RUM onde o valor será gravado.                                               |
| `EXPO_PUBLIC_RECLAIM_APP_ID`            | App ID do Reclaim.                                                                                    |
| `EXPO_PUBLIC_RECLAIM_APP_SECRET`        | App Secret do Reclaim.                                                                                |
| `EXPO_PUBLIC_RECLAIM_PROVIDER_ID`       | **httpProviderId** do provider adicionado (ex.: Twitter User Profile).                                |

### Fluxo de Verificação no App

1. Usuário toca **Participar**.
2. App inicia sessão Reclaim (abre deep link / app Reclaim / fluxo do *demo*).
3. Ao concluir, o app recebe `verificationResult`.
4. App monta `executeMsg` e chama `client.execute()` no RUM.
5. App faz **query** no RUM para ler `followers_count` (ou outro `claim_key`).
6. Apresenta **Aprovado / Reprovado** (ex.: `followers_count >= 100`).

### Exemplo de UI: Card “Programa de Incentivo”

```tsx
import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import Button from "@/components/Button";
import { verifyAndStoreFollowersCount, readFollowersFromRUM, isEligible } from "@/lib/incentive";

const THRESHOLD = 100;

export default function IncentiveCard() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "approved" | "rejected">("idle");

  const handleParticipate = async () => {
    setLoading(true);
    try {
      await verifyAndStoreFollowersCount();
      const followers = await readFollowersFromRUM();
      const ok = isEligible(followers, THRESHOLD);
      setStatus(ok ? "approved" : "rejected");
      Alert.alert(ok ? "Você foi aprovado 🎉" : "Você não possui os requisitos");
    } catch (e: any) {
      console.log(e);
      Alert.alert("Erro", e?.message ?? "Falha no processo de verificação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Programa de Incentivo X</Text>
      <Text>Critério: conta do X (Twitter) com {THRESHOLD}+ seguidores</Text>
      <Button label={loading ? "Verificando..." : "Participar"} onPress={handleParticipate} disabled={loading} />
      {status !== "idle" && (
        <Text style={{ marginTop: 6 }}>
          {status === "approved" ? "✅ Aprovado" : "❌ Reprovado"}
        </Text>
      )}
    </View>
  );
}
```

> **Nota:** Implemente `verifyAndStoreFollowersCount()` e `readFollowersFromRUM()` conforme seu client/SDK e o schema do RUM lançado via quickstart.

---

## Criando um Provedor Customizado (Ex.: Kaggle → e-mail)

### Fluxo de Criação e Publicação

1. **Reclaim App (Android):** instale o app e abra.
2. **Developer Portal → My Providers → New Provider.**
3. Vincule o app ao portal com a **session key**.
4. No app, acesse o site-alvo (ex.: `https://www.kaggle.com`) e faça login.
5. No portal, visualize as respostas HTTP capturadas e **localize o dado** (ex.: e-mail).
6. Clique **View** → **Add to Provider** → **Next**.
7. Defina **variáveis** sugeridas pela AI (ou selecione manualmente) e **padronize a URL** se necessário.
8. Preencha **metadados** (nome, descrição, fonte/URL).
9. Gere uma **prova real** (QR code / link), validando o fluxo ponta-a-ponta.
10. Publique e **solicite ativação** à equipe Reclaim (fica *inactive* até aprovação).

> Depois de aprovado, você pode **usar este provider** como qualquer outro (via `httpProviderId`).

---

## zkFetch (Provas sobre APIs sem Oráculos)

### Uso Básico

```ts
const data = await reclaim.zkFetch(
  url,              // endpoint HTTP/HTTPS
  fetchOptions,     // { method, headers, body }
  {
    responseMatches: [
      // o que extrair (regex nomeado)
      { type: 'regex', value: '"field_name":\\s*(?<extracted_value>\\d+)' }
    ],
    responseRedactions: [
      // o que será provado (campo(s) a manter)
      { regex: '"field_name":\\s*(?<extracted_value>\\d+)' }
    ]
  }
);
```

* `\\s*` ajuda a tolerar variações de espaço em JSON.
* O **prova** inclui apenas os campos definidos (mantém privacidade).

### Quick Start do Cliente de Exemplo

```bash
git clone https://github.com/burnt-labs/zkfetch-client.git
cd zkfetch-client
npm install
npm run postinstall
npm start
# App local em http://localhost:3000
```

> Configure `.env` com `REACT_APP_RECLAIM_APP_ID` e `REACT_APP_RECLAIM_APP_SECRET` (via Reclaim).

### Exemplos de `responseMatches`/regex

```ts
// Número (inteiro) em um campo:
{ type: 'regex', value: '"count":\\s*(?<count>\\d+)' }

// Valor booleano:
{ type: 'regex', value: '"verified":\\s*(?<is_verified>true|false)' }

// String (e-mail):
{ type: 'regex', value: '"email":\\s*"(?<email>[^"]+)"' }

// Elemento inicial de array numérico:
{ type: 'regex', value: '"scores":\\s*\\[(?<first_score>\\d+)' }
```

### Exemplo de Integração com CosmWasm

```rust
#[derive(Serialize, Deserialize, JsonSchema)]
pub struct VerifyProofMsg {
    pub claim_info: ClaimInfo,
    pub signed_claim: SignedClaim,
    pub extracted_data: std::collections::HashMap<String, String>,
    pub witnesses: Vec<Witness>,
}

pub fn verify_and_mint_nft(
    deps: DepsMut,
    info: MessageInfo,
    proof: VerifyProofMsg,
) -> Result<Response, ContractError> {
    // 1) Verifica a prova (assinaturas, integridade, etc.)
    verify_reclaim_proof(&proof)?;

    // 2) Lê dado extraído
    let score = proof
        .extracted_data
        .get("score")
        .ok_or(ContractError::MissingScore)?;

    // 3) Lógica de negócio
    if score.parse::<u32>()? > 100 {
        mint_nft(deps, info.sender, "High Scorer")?;
    }

    Ok(Response::new()
        .add_attribute("action", "verify_proof")
        .add_attribute("score", score))
}
```

---

## MVP Sugerido para o ChatPay Go

**Objetivo:** Gate de participação em **Programa de Incentivo** com **critério simples** e **componentes prontos**.

* **Provider pronto:** **Twitter User Profile** (Reclaim).
* **`claim_key`:** `followers_count`.
* **Critério:** `followers_count >= 100`.
* **Fluxo:**

  1. Card “Programa de Incentivo X” → botão **Participar**.
  2. Inicia fluxo Reclaim, coleta `verificationResult`.
  3. Envia `executeMsg.update.value.proof` ao **RUM**.
  4. Faz **query** ao RUM e lê `followers_count`.
  5. Mostra **Aprovado/Reprovado** conforme o threshold.

> **Sem customização** (rápido para MVP). Evolua depois para múltiplos critérios, provedores adicionais ou zkFetch para dados de APIs.

---

## Boas Práticas de Segurança

1. **Não exponha API keys** no cliente.
2. **Valide timestamps** (`timestampS`) das provas (p.ex., rejeitar > 1h) para evitar *replay*.
3. **Verifique assinaturas** sempre que processar provas em contrato.
4. **Rate limiting** na geração de provas para evitar abuso.
5. **Regex seguro** → evite padrões com *catastrophic backtracking* (ReDoS).

---

## Troubleshooting

* **“Application not found” (Reclaim):** confira `APP_ID`/`APP_SECRET` no `.env`.
* **“Regex does not match” (zkFetch):** adapte o regex ao **response real**; inclua `\\s*` em pontos sensíveis.
* **CORS bloqueado (dev):** use APIs com CORS, um **proxy** local, ou execute *server-side*.
* **Carteira/cliente ausentes (RN):** garanta que o usuário está logado (Abstraxion) antes de executar transações.
* **Query RUM falhando:** confirme o **schema** do contrato instanciado (quickstart/PR) e ajuste o `queryMsg`.

---

## Referências (fornecidas)

* **Reclaim – Developer Portal:** [https://dev.reclaimprotocol.org/explore](https://dev.reclaimprotocol.org/explore)
* **RUM Contract (PR):** [https://github.com/burnt-labs/contracts/pull/72](https://github.com/burnt-labs/contracts/pull/72)
* **Demo (Abstraxion + Reclaim):** [https://github.com/burnt-labs/abstraxion-reclaim-demo](https://github.com/burnt-labs/abstraxion-reclaim-demo)
* **zkFetch (cliente):** [https://github.com/burnt-labs/zkfetch-client](https://github.com/burnt-labs/zkfetch-client)
* **Endpoints XION (testnet):**

  * RPC: `https://rpc.xion-testnet-2.burnt.com:443`
  * REST: `https://api.xion-testnet-2.burnt.com`
* **Verification Contract (XION Testnet):**

  ```
  xion1qf8jtznwf0tykpg7e65gwafwp47rwxl4x2g2kldvv357s6frcjlsh2m24e
  ```

---

> **Nota final:** Onde este guia indicar “ajuste conforme o schema do seu RUM”, use os artefatos do **quickstart** que você lançou (ou o PR indicado) para copiar exatamente os `queryMsg` e as chaves de resposta suportadas pela sua instância.
