# ChadGPT Local Development — Tiltfile

# Next.js web app
local_resource(
    "web",
    serve_cmd="npx next dev --turbopack --port 3000",
    deps=["src/app", "src/components", "src/lib"],
    labels=["frontend"],
)

# Discord bot
local_resource(
    "bot",
    serve_cmd="node --env-file=.env src/bot/index.js",
    deps=["src/bot"],
    labels=["backend"],
)

# Prisma — push schema changes to the DB when schema file changes
local_resource(
    "db-migrate",
    cmd="npx prisma db push --skip-generate && npx prisma generate",
    deps=["prisma/schema.prisma"],
    labels=["database"],
    auto_init=False,
)
