---
inclusion: always
---

# Ambiente de desenvolvimento

- O projeto roda dentro do WSL (Debian).
- O gerenciador de pacotes é o **pnpm**. Não usar `npm` nem `yarn` para instalar dependências ou rodar scripts (`pnpm install`, `pnpm run build`, `pnpm run start:dev`, etc).
- Comandos de terminal (build, start, test, etc.) devem ser executados via WSL, não diretamente no Windows/PowerShell/CMD.
