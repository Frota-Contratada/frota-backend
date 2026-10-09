# Corporate organization import

Run this tool only against a confirmed non-production SQL Server database after validating it in an isolated SQL Server. The workbook stays outside Git and the container image. Supply `DATABASE_URL` through the existing protected runtime mechanism; never place it on the command line.

```text
node scripts/import-corporate.cjs --excel <local-xlsx-path> --dry-run
node scripts/import-corporate.cjs --excel <local-xlsx-path> --apply \
  --expect-host <confirmed-host> --expect-database <confirmed-database> \
  --source-sha256 <verified-sha256>
```

The default mode is dry-run. It checks the full source and the current database without writing. The apply mode requires the target host, target database and exact source hash. Recheck the dry-run before applying. The tool prints counts and technical status only.

Import order: Empresa, Endereco with Filial in the same transaction, CentroCusto, Fornecedor. Cost centers whose complete Empresa+Filial key is missing from the source are counted as rejected references. They are never remapped or inserted. The source's OF and planning worksheets do not create contracts, orders, requests or rides.

Endereco uses one internal ID per corporate Filial key. New IDs are allocated from the current maximum in sorted key order; on rerun the Filial foreign key reuses its existing Endereco ID. Fornecedor uses Base+Estabelecimento as its corporate key and retains its existing internal ID on rerun. Batches are bounded; a failed run can be repeated after diagnosis. Do not run concurrent imports.

The importer fills a missing or zero street number with `S/N`. Seven-digit CEP cells represent a lost leading zero in the Excel numeric cell and are left-padded to eight digits. CentroCusto activation is set at first insert and preserved thereafter. Fornecedor preserves its original corporate status; `APROVADO` is active, while `INATIVO`, `LISTA AMARELA` and `BLOQUEADO` are inactive. Since the source lacks a deactivation date, the first import observation time is used for an inactive supplier and retained on rerun. CNPJ/CPF is left null when absent in the source.

The official test workbook must not be edited. Homologation accounts and credentials are handled separately after the corporate import. Any report containing source rows or personal data belongs in protected local state, never in Git, CI artifacts or logs.

The optional HML account preparation tool reads the approved organizational scope from a local JSON file outside Git. Its fields are `company`, `branch`, `costCenter`, `supplierBase` and `supplierEstablishment`, each containing the corresponding corporate numeric identifier. Run `node scripts/prepare-hml-users.cjs --dry-run --scope-file <protected-local-json>` first. The apply mode additionally requires `--expect-host` and `--expect-database`; it reads the test password from standard input, hashes it with Argon2 and stores only the hash. Do not put the password in shell arguments, a workbook, a versioned file or logs. Accounts with fictitious email addresses do not receive first-access PIN messages.
