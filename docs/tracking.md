# Acompanhamento de corridas

O snapshot REST é a fonte autoritativa para inicialização e reconexão. A rota
canônica completa é persistida no SQL Server; Redis é usado apenas pelo adapter
do Socket.IO e pode ficar temporariamente indisponível sem perda do histórico.

## Configuração

- `TOMTOM_API_KEY` (obrigatória): chave usada exclusivamente pelo backend.
- `TOMTOM_TIMEOUT_MS` (opcional, padrão `8000`): timeout da API de rotas.
- `CORS_ORIGINS` (obrigatória em produção): origens separadas por vírgula.
- `REDIS_URL` e `REDIS_PASSWORD`: já existentes; habilitam o adapter distribuído
  do Socket.IO. Sem `REDIS_URL`, o gateway funciona em uma única instância.

Não havia `.env.example` no repositório, portanto nenhum arquivo de ambiente foi
criado e nenhuma chave real foi versionada.

## Banco

Execute `pnpm exec prisma generate` e aplique `pnpm exec prisma db push` (fluxo já usado no
Docker) ou gere uma migration revisada pelo time de banco. Os modelos adicionados
são `CorridaRota`, `CorridaPosicao`, `CorridaEspera`,
`CorridaParadaProgresso` e `ComandoIdempotente`, com índices de versão, última
posição, histórico, progresso das paradas e chave idempotente. Posições de
passageiros também guardam o usuário de origem. Payloads canônicos/resultados
usam `NVarChar(Max)`.

## REST

Todos os exemplos exigem `Authorization: Bearer <JWT>`.

```http
GET /corridas/123/tracking
```

```http
POST /corridas/123/tracking/positions/batch
Content-Type: application/json

{"positions":[{"lat":-23.55,"lng":-46.63,"accuracy":8,"speed":12,"heading":90,"timestamp":"2026-08-24T15:00:00.000Z"}]}
```

```http
POST /corridas/123/route/reroute
Idempotency-Key: 1f528e04-d384-4fa5-bdd7-42a3bc0bb4cf
Content-Type: application/json

{"position":{"lat":-23.55,"lng":-46.63,"accuracy":8,"speed":12,"heading":90,"timestamp":"2026-08-24T15:00:00.000Z"}}
```

Os comandos `waiting/start`, `waiting/resume` e `finish` também exigem
`Idempotency-Key` UUID. Respostas usam o envelope `{ "response": ... }`.

Ao chegar a uma parada, o motorista deve registrar sua conclusão antes dos
próximos recálculos:

```http
POST /corridas/123/stops/1/complete
Idempotency-Key: 7293cccb-8cc6-47df-b719-9130ed65a34c
```

O número é o `sequence` original da parada. Paradas concluídas deixam de ser
enviadas ao TomTom em recálculos posteriores. Comandos idempotentes aguardam até
12 segundos por uma execução concorrente; execuções abandonadas podem ser
retomadas após 30 segundos. A alteração de negócio e o estado `COMPLETED` são
gravados na mesma transação.

Timestamps de GPS podem estar no máximo cinco minutos no futuro. Valores além
desse limite são rejeitados e posições antigas inválidas também são ignoradas ao
buscar a última localização.

## Socket.IO

O handshake envia `Authorization: Bearer <JWT>`. Depois da conexão:

```json
{"event":"trip.join","data":{"tripId":"123","role":"passenger"}}
```

O papel declarado é ignorado; a associação no banco determina as permissões. O
ack e `trip.joined` só são enviados depois de `socket.join("trip:123")`.

Eventos do servidor usam `trip.event`:

```json
{
  "schemaVersion": 1,
  "type": "route.replaced",
  "eventId": "uuid",
  "tripId": "123",
  "sentAt": "2026-08-24T15:00:00.000Z",
  "payload": {}
}
```

Tipos emitidos na sala: `vehicle.location`, `route.replaced`, `waiting.changed`
e `trip.statusChanged`. A posição auxiliar de passageiro é persistida por usuário
e devolvida somente ao próprio passageiro no snapshot; ela não é transmitida à
sala da corrida.

## Decisões de negócio pendentes

- `SolicitacaoPassageiro` contém somente CPF. O acesso foi limitado ao
  solicitante ou a um usuário cujo CPF corresponda à lista da solicitação.
- `Veiculo` não possui descrição própria. O snapshot usa o nome de `TipoVeiculo`
  quando houver.
- Os IDs atuais são `Decimal(10,0)`; no JSON são serializados como string, mas a
  URL continua aceitando o número positivo já usado pelo backend.
