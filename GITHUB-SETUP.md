# GitHub Setup Guide

This guide will help you push this MCP Server project to GitHub.

## Prerequisites

- Git installed on your system
- GitHub account
- GitHub repository created (or we'll create one)

## Step-by-Step Instructions

### Option 1: Create Repository on GitHub First (Recommended)

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Repository name: `ORACLE-MCP-SERVER` (or your preferred name)
   - Description: "Oracle Database MCP Server - Model Context Protocol server for Oracle Database"
   - Choose Public or Private
   - **Do NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

2. **Add all files and make initial commit:**
   ```bash
   git add .
   git commit -m "Initial commit: Oracle MCP Server"
   ```

3. **Add GitHub remote and push:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ORACLE-MCP-SERVER.git
   git branch -M main
   git push -u origin main
   ```
   
   Replace `YOUR_USERNAME` with your GitHub username.

### Option 2: Using GitHub CLI (gh)

If you have GitHub CLI installed:

```bash
# Add and commit files
git add .
git commit -m "Initial commit: Oracle MCP Server"

# Create repository and push
gh repo create ORACLE-MCP-SERVER --public --source=. --remote=origin --push
```

### Option 3: Using SSH (if you have SSH keys set up)

```bash
git add .
git commit -m "Initial commit: Oracle MCP Server"
git remote add origin git@github.com:YOUR_USERNAME/ORACLE-MCP-SERVER.git
git branch -M main
git push -u origin main
```

## Quick Commands Reference

```bash
# Check current status
git status

# Add all files (respects .gitignore)
git add .

# Make initial commit
git commit -m "Initial commit: Oracle MCP Server"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/ORACLE-MCP-SERVER.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Files Excluded from Git

The following files/folders are excluded via `.gitignore`:
- `.env` - Contains sensitive database credentials
- `node_modules/` - Dependencies (can be reinstalled)
- `dist/` - Build output (can be regenerated)
- `*.log` - Log files
- `.DS_Store` - macOS system files
- `*.tsbuildinfo` - TypeScript build info

## Important Notes

⚠️ **Security Reminders:**
- Never commit `.env` file (already in .gitignore)
- Never commit `mcp.json` with real credentials
- The `mcp.json.reference` file is safe to commit (contains placeholders)
- Review all files before committing to ensure no sensitive data

## After Pushing

1. **Add a repository description** on GitHub
2. **Add topics/tags** like: `mcp`, `oracle`, `database`, `model-context-protocol`
3. **Consider adding a license** (MIT, Apache 2.0, etc.)
4. **Update README** if needed with your specific setup details

## Troubleshooting

### "Repository not found"
- Check that the repository name and username are correct
- Verify you have access to the repository
- Make sure the repository exists on GitHub

### "Permission denied"
- Use HTTPS with a personal access token, or
- Set up SSH keys for GitHub
- Check your GitHub authentication

### "Branch 'main' does not exist"
- Use `git branch -M main` to rename your current branch
- Or use `git push -u origin master` if you prefer the master branch

### Authentication Issues
- For HTTPS: Use a Personal Access Token (not password)
- Create token at: https://github.com/settings/tokens
- For SSH: Set up SSH keys at: https://github.com/settings/keys

