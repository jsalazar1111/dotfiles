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

# 2. Install System Dependencies 
echo "Installing system packages..." 
if command -v apt-get &> /dev/null; then 
    sudo apt-get update && sudo apt-get install -y ripgrep openjdk-21-jdk 
fi 

# 3. Install Global npm Packages 
if command -v npm &> /dev/null; then 
    echo "Installing global npm packages..." 
    sudo npm install -g @salesforce/cli @anthropic-ai/claude-code 
fi 

# 4. Install Salesforce CLI Plugins 
if command -v sf &> /dev/null; then 
    echo "Installing Salesforce CLI plugins..." 
    sf plugins install code-analyzer 
fi 

# --- Link Plative Claude Code configuration ---
echo "Migrating Plative MDM Claude configuration..."
mkdir -p "$HOME/.claude"
if [ -d "$PWD/.claude" ]; then
    cp -rn "$PWD/.claude/"* "$HOME/.claude/"
fi
# ----------------------------------------------

# 5. Install Claude Code Plugins 
if command -v claude &> /dev/null; then 
    echo "Installing Claude Code plugins..." 
    claude plugin marketplace add obra/superpowers-marketplace 
    claude plugin install superpowers@superpowers-marketplace --scope user 
    claude plugin marketplace add mattpocock/skills 
    claude plugin install mattpocock-skills@mattpocock --scope user 
fi 

# 6. Symlink VS Code Settings 
if [ -f "$HOME/dotfiles/settings.json" ]; then 
    echo "Linking VS Code settings..." 
    mkdir -p "$HOME/.vscode-remote/data/Machine" 
    ln -sf "$HOME/dotfiles/settings.json" "$HOME/.vscode-remote/data/Machine/settings.json" 
fi 

# 7. Install VS Code Extensions 
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

# 8. Cleanup & Reload 
echo "Cleaning up caches..." 
rm -rf ~/.cache/vscode-python ~/.cache/typescript 

echo "Dotfiles setup complete!"
