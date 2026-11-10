# GymCRM — Microfrontend (SPA React)

Interface do GymCRM. SPA em **React + TypeScript (Vite)** que consome **somente o BFF** (através do API Gateway). Ela não conhece os microsserviços, os bancos nem a Azure Function.

```
Usuário -> Microfrontend -> API Gateway -> BFF -> MS Estoque | MS Matrículas | Azure Function
```

**Integrantes:** Igor Thiago Lara da Silva · Leonardo Ceccon Sobol · Leonardo Godoi Siemens · Rafael Augusto de Oliveira Souza

## Telas
| Tela | O que faz | Endpoint do BFF |
|---|---|---|
| **Painel** | Em uma única consulta mostra quais serviços responderam (Estoque/Mongo, Matrículas/Azure SQL, Cálculo financeiro/Azure Function), as matrículas, o **alerta de estoque baixo** e o **resumo financeiro** (receita bruta, desconto, taxa do gateway, líquida e MRR). Avisa quando a resposta é parcial. | `GET /aggregated-data` |
| **Matrículas** | Listar, criar (com total do período em tempo real), editar/trancar/cancelar via status, **renovar** e excluir | `/enrollments` |
| **Estoque** | Listar, criar, editar (saldo, categoria, estoque mínimo) e excluir itens; destaca itens com estoque baixo | `/products` |

O rodapé mostra o endereço da API em uso, o que ajuda a provar no vídeo que a aplicação está falando com a nuvem.

## Arquitetura
- **Vertical slice:** `src/features/{dashboard,enrollments,stock}`, cada uma com sua tela, formulário e módulo `*.api.ts`.
- **`src/shared`:** cliente de API único, tipos, formatação e componentes de UI. `shared` nunca importa `features`, e uma feature nunca importa outra (teste de arquitetura).
- **Só o BFF:** o teste de arquitetura falha se o código referenciar endereços de microsserviços, Function ou bancos.

## Tecnologias
React 18 · TypeScript · Vite 5 · Vitest + Testing Library · Docker (nginx)

## Configuração
| Variável (build) | Descrição |
|---|---|
| `VITE_API_BASE_URL` | URL do **API Gateway** (ou do BFF). Ex.: `https://abc123.execute-api.us-east-1.amazonaws.com`. Padrão em dev: `http://localhost:3000` |

> O Vite embute a variável **na hora do build**. Para mudar a URL, rode o build de novo.

## Como rodar localmente
```bash
npm install
cp .env.example .env      # PowerShell: Copy-Item .env.example .env  -> edite VITE_API_BASE_URL
npm run dev               # http://localhost:5173
```
O BFF precisa permitir a origem do front no CORS (`CORS_ORIGIN`, ou `*`).
> No vídeo de apresentação, mostre o frontend **publicado** (URL de nuvem) apontando para o gateway, não o localhost.

## Testes
```bash
npm test      # 23 testes: cliente de API, formatação, Painel (resposta completa/parcial/erro), formulário de matrícula, arquitetura
npm run build # checagem de tipos + build de produção (dist/)
```

## Build e publicação
**Opção A — hospedagem estática** (Azure Static Web Apps, Netlify, Vercel, S3...): rode `npm run build` com `VITE_API_BASE_URL` definido e publique a pasta `dist/`. É uma SPA com rotas por hash (`#/estoque`), então não precisa de configuração de reescrita.

**Opção B — Docker (nginx):**
```bash
docker build --build-arg VITE_API_BASE_URL=https://<api-id>.execute-api.<regiao>.amazonaws.com \
  -t <usuario_dockerhub>/gymcrm/frontend:v1 .
docker run -p 8080:80 <usuario_dockerhub>/gymcrm/frontend:v1
docker login && docker push <usuario_dockerhub>/gymcrm/frontend:v1
```
