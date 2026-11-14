# Flotilla

Run a fleet of Claude agents on your own machine. You talk to an orchestrator, and it hands the work to
workers, each on its own branch in its own git worktree.

This repo holds the release builds and the documentation.

- **Docs:** <https://knowledge-circuit.github.io/flotilla-releases/>
- **Releases:** <https://github.com/knowledge-circuit/flotilla-releases/releases>

## Install

```sh
curl -fsSL https://github.com/knowledge-circuit/flotilla-releases/releases/latest/download/install.sh | sh
```

Add `-s -- --desktop` after `sh` on macOS to install the app too. You need Claude Code, logged in, and git.
The docs have the full [requirements](https://knowledge-circuit.github.io/flotilla-releases/requirements).

## Run

```sh
cd ~/Projects/my-app
flotilla
```

The source of the docs site is in [`docs/`](docs/).
