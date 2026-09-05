#!/usr/bin/env bash
# install.sh — set up PR Posse on Ubuntu (or any Debian-flavored Linux).
# Safe to re-run.
set -euo pipefail

cyan()  { printf "\033[36m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
red()   { printf "\033[31m%s\033[0m\n" "$*" >&2; }

cyan "🤠  Installing PR Posse..."

# 1. Node.js
if ! command -v node >/dev/null 2>&1; then
  red "Node.js is not installed."
  cat <<'EOF'
On Ubuntu, install Node 18+ with:
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
EOF
  exit 1
fi
NODE_MAJOR=$(node -v | sed 's/^v//; s/\..*//')
if [ "$NODE_MAJOR" -lt 18 ]; then
  red "Node.js >= 18 required (you have $(node -v))."
  exit 1
fi
green "✓  Node $(node -v)"

# 2. gh CLI
if ! command -v gh >/dev/null 2>&1; then
  red "GitHub CLI (gh) is not installed."
  echo "On Ubuntu: sudo apt install gh    (or see https://cli.github.com/)"
  exit 1
fi
green "✓  gh $(gh --version | head -1)"

# 3. gh auth status
if ! gh auth status >/dev/null 2>&1; then
  red "gh is not authenticated. Run: gh auth login"
  exit 1
fi
green "✓  gh authenticated"

# 4. Install npm deps
cyan "📦 Installing npm dependencies..."
npm install --no-audit --no-fund

# 5. Symlink to ~/.local/bin if available (so 'pr-posse' is on PATH)
mkdir -p "$HOME/.local/bin"
ln -sf "$(pwd)/bin/pr-posse" "$HOME/.local/bin/pr-posse"
chmod +x "$(pwd)/bin/pr-posse"
green "✓  Linked $HOME/.local/bin/pr-posse"

# 6. .env reminder
if [ ! -f .env ]; then
  cp .env.example .env
  cyan "📝 Created .env — open it and add your ANTHROPIC_API_KEY."
fi

cyan ""
cyan "🎉 Done. Try a sample report (no API key needed):"
echo "   pr-posse --demo"
cyan ""
cyan "Then on a real PR (after setting ANTHROPIC_API_KEY):"
echo "   pr-posse 42                              # in a repo clone"
echo "   pr-posse owner/repo#42"
echo "   pr-posse https://github.com/o/r/pull/42 --post"
cyan ""
cyan "If 'pr-posse' isn't found, ensure ~/.local/bin is on your PATH:"
echo '   export PATH="$HOME/.local/bin:$PATH"   # add to ~/.bashrc'
