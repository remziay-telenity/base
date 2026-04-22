# Contributing to Base Guild Helper

Thanks for helping build this! Here's how to get started.

## Development setup

```bash
git clone https://github.com/remziay-telenity/base
cd base
npm install
cp .env.local.example .env.local   # fill in your keys
npm run dev
```

## Project structure

| Path | Purpose |
|------|---------|
| `contracts/` | Solidity source files |
| `scripts/compile.js` | Compiles contracts → `src/lib/*Artifact.json` |
| `src/app/` | Next.js App Router pages and layout |
| `src/components/` | React UI components |
| `src/hooks/` | Custom wagmi/data hooks |
| `src/lib/` | Utilities, config, compiled artifacts |
| `src/providers/` | Context providers (Web3) |
| `src/test/` | Test setup |

## Adding a new Guild role

1. Add the Solidity contract to `contracts/` if needed, update `scripts/compile.js`
2. Create a hook in `src/hooks/` to fetch the on-chain state
3. Create a component in `src/components/` to display it
4. Wire it into `src/app/page.tsx`
5. Add it to the `GUILD_ROLES` array in `page.tsx`
6. Write tests for the hook utilities and component rendering

## Commit style

One logical change per commit. Prefix with the area:

```
Add <thing>           # new feature or file
Update <thing>        # change to existing feature
Fix <thing>           # bug fix
Refactor <thing>      # restructuring without behaviour change
Add tests for <thing> # test coverage
```

## Running tests

```bash
npm test              # run once
npm run test:watch    # watch mode
```

All tests must pass before opening a PR. CI will verify automatically.

## Opening a PR

- Target the `main` branch
- Describe *what* changed and *why*
- Link to the Guild.xyz role being targeted if relevant
