# ron_GIT V1.0

Minimal scaffold for the Ron-GIT blueprint.

## Structure

- `agent/` - orchestrator and worker scripts
- `utils/` - validation, config, quota and Groq helpers
- `.github/workflows/` - CI workflow for GitHub Actions
- `input/PROMPT.txt` - external user prompt
- `output/` - generated results

## Local environment

- Use `.env` for local API keys and runtime settings.
- Keep `.env` out of Git with `.gitignore`.
- A safe template is provided in `.env.example`.

### Supported local variables

- `GROQ_API_KEY_1`, `GROQ_API_KEY_2`, `GROQ_API_KEY_3`
- `GROQ_MODEL`
- `AGENT_LOOP_DELAY`
- `MAX_CONTEXT_FILES`
- `ENABLE_GROQ`

## Usage

1. Create or update `input/PROMPT.txt`.
2. Run locally with `node agent/architect_agent.js`.
3. Or push to `main` and let GitHub Actions execute `.github/workflows/ai_loop.yml`.
4. Generated output files appear under `output/`.

## Notes

- `.env` is ignored by Git and can store local keys.
- `.env.example` shows the expected config format.
- `ENABLE_GROQ=false` is the default safe mode to avoid accidental Groq calls.
- `utils/groq_client.js` rotates local Groq keys and enforces `AGENT_LOOP_DELAY`.
- `utils/quota_checker.js` keeps a local `.quota.json` counter.
