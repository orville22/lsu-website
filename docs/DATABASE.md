# Database and migrations

Use a separate PostgreSQL database for each environment. The initial migration is `prisma/migrations/20261110000000_initial/migration.sql`. It creates tables, enums, indexes and foreign keys without modifying any existing site.

```sh
npm run db:generate
npm run db:migrate
npm run db:seed
```

`db:migrate` runs `prisma migrate deploy`, suitable for applying committed migrations. Do not use `db push` as a production migration workflow. Seeds are optional, draft-only, idempotent and non-overwriting. If a lesson was already reviewed or edited, reseeding leaves it unchanged.

For subsequent schema work in a development database:

```sh
npx prisma migrate dev --name describe_the_change
npm run db:generate
npm test
npm run test:integration
```

Review generated SQL and back up production before migration. Use `pg_dump --format=custom` with connection settings supplied securely to capture the full database, including content, attempts, relations and audit logs. Test restoration into a separate database with `pg_restore`. Question-bank export is a content portability tool, not a substitute for a full PostgreSQL backup; imports deliberately reset questions to Draft and create new IDs.

## Maintenance

Set `ANONYMOUS_RETENTION_DAYS` (default 30) and run:

```sh
npm run db:cleanup
```

This removes expired administrator sessions and limiter rows and anonymous attempts older than the chosen period, measured from their last update. It leaves future account-owned attempts and editorial audit history intact. Schedule it with the chosen hosting platform or cron after approving retention policy. Nothing is scheduled by this project.

Quiz snapshots preserve completed attempts when a question is edited or deleted. Lesson/question deletion cascades only their lesson-link and option records. Audit logs are append-only through application code; use restrictive production database roles and protected backups to prevent out-of-band modifications.

The initial database constraints enforce unique option positions but correctness cardinality is enforced at the validated API boundary and rechecked before starting a quiz. Direct database writes must honour the same invariants; they are not an editorial workflow.
