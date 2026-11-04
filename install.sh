#!/bin/bash

echo "Starting dotfiles setup..."

# 1. Configure Global Git Settings
echo "Configuring Git..."
git config --global user.name "Joel Salazar"
git config --global user.email "jsalazar@plative.com"
git config --global init.defaultBranch main
git config --global push.autoSetupRemote true

# Helpful global Git aliases
git config --global alias.st "status -s -b"
git config --global alias.co "checkout"
git config --global alias.br "branch -a -v"
git config --global alias.lg "log --graph --oneline --decorate"

# 2. Install System Dependencies (ripgrep & JDK 21)
echo "Installing system packages..."
if command -v apt-get &> /dev/null; then
    sudo apt-get update && sudo apt-get install -y ripgrep openjdk-21-jdk
fi

# 3. Install Salesforce CLI Plugins
if command -v sf &> /dev/null; then
    echo "Installing Salesforce CLI plugins..."
    sf plugins install code-analyzer
fi

# 4. Symlink VS Code Settings (if settings.json exists in your dotfiles repo)
if [ -f "$HOME/dotfiles/settings.json" ]; then
    echo "Linking VS Code settings..."
    mkdir -p "$HOME/.vscode-remote/data/Machine"
    ln -sf "$HOME/dotfiles/settings.json" "$HOME/.vscode-remote/data/Machine/settings.json"
fi

# 5. Install VS Code Extensions
echo "Installing VS Code extensions..."
code --install-extension salesforce.salesforcedx-vscode-expanded
code --install-extension salesforce.salesforcedx-vscode-agents
code --install-extension anthropic.claude-code
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension eamodio.gitlens
code --install-extension github.vscode-pull-request-github
code --install-extension usernamehw.errorlens
code --install-extension redhat.vscode-yaml
code --install-extension yzane.markdown-all-in-one
code --install-extension gruntfuggly.todo-tree

# 6. Cleanup & Reload
echo "Cleaning up caches..."
rm -rf ~/.cache/vscode-python ~/.cache/typescript

echo "Dotfiles setup complete!"
