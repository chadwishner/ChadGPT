# ChadGPT Local Development — Tiltfile

# Next.js web app (bot runs inside the same process)
local_resource(
    "web",
    serve_cmd="npx next dev --turbopack --port 3000",
    deps=["src/app", "src/components", "src/lib"],
    labels=["frontend"],
)
