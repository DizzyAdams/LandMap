# Twenty-first integration

Este pacote expõe um client REST mínimo para o CRM Twenty-first, suficiente para:
- cadastrar pessoas e leads
- avançar oportunidades no pipeline
- registrar notas

## Configuração

Defina as variáveis de ambiente antes de rodar os scripts de seed/sync:
```bash
export TWENTY_BASE_URL="http://localhost:3000"
export TWENTY_API_KEY="<api-key>"
```

Em Windows (PowerShell):
```powershell
$env:TWENTY_BASE_URL='http://localhost:3000'
$env:TWENTY_API_KEY='<api-key>'
```

## Uso programático

```ts
import { TwentyClient } from '@landmap/twenty';

const client = new TwentyClient({
  baseUrl: process.env.TWENTY_BASE_URL,
  apiKey: process.env.TWENTY_API_KEY,
});

await client.createPerson({
  name: 'Alice Silva',
  email: 'alice@example.com',
  city: 'Curitiba',
  state: 'PR',
});

await client.createLead({
  name: 'Alice Silva',
  email: 'alice@example.com',
  source: 'landmap_search',
  score: 80,
});

await client.createOpportunity({
  title: 'Apartamento padrão - Alice',
  stage: 'captured',
  amount: 420000,
  currency: 'BRL',
  leadId: '<lead-id>',
});
```

## Pipeline

Estágios do funil:
- `captured`
- `contacted`
- `qualified`
- `scheduled`
- `closed_won`
- `closed_lost`

## Notas

- Sem deploy do Twenty executado aqui: apenas client e estrutura.
- Para execução local, rode o Twenty conforme sua documentação oficial e ajuste `TWENTY_BASE_URL` para a porta exposta.
