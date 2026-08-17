# Development Workflow & Commit Guidelines

## 📋 Commit Message Standards

**ALL commits must follow this ONE-LINE format:**

```
<type>(<scope>): <description>
```

### Components

- **type**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- **scope** (optional): Component being changed - `web-app`, `mobile-app`, `functions`, `scripts`, etc.
- **description**: Concise, imperative mood (Add, Fix, Update, not Added/Fixes)
- **No period** at the end
- **Max ~72 characters** total

### Examples ✅

```
feat: Add budget allocation module
fix: Resolve Uganda flag image loading on mobile
docs: Update administrative hierarchy documentation
feat(mobile-app): Implement district editing screen
fix(web-app): Fix GeoJSON map rendering issue
refactor: Optimize village search performance
test: Add unit tests for location service
chore: Update dependencies to latest versions
```

### Invalid Examples ❌

```
Added new feature                          ← No type
feat: Added budget allocation              ← Not imperative
feat(scope): Add budget allocation.        ← Has period
feat: Add budget, fix flags, update docs   ← Multiple changes
```

---

## 🔧 Automatic Commit Workflow

### Step 1: Make Code Changes
Edit files as usual in your IDE.

### Step 2: Verify Changes
```powershell
git status
```
See all modified files.

### Step 3: Commit Changes
Choose one method:

#### Method A: Using auto-commit.ps1 script
```powershell
cd c:\Users\Raheem\Desktop\location-system

# Simple commit message
.\auto-commit.ps1 -CommitMessage "Add budget allocation module"

# Or using type/scope/description
.\auto-commit.ps1 -Type "feat" -Scope "web-app" -Description "Add budget allocation module"

# Shorthand for fixes
.\auto-commit.ps1 -Type "fix" -Scope "mobile-app" -Description "Resolve flag loading issue"
```

#### Method B: Direct git command
```powershell
cd c:\Users\Raheem\Desktop\location-system
git add -A
git commit -m "feat: Add budget allocation module"
```

#### Method C: Simple one-liner
```powershell
git add -A; git commit -m "feat: Add new feature"
```

---

## 📦 Change Categories & Commit Types

| Type | When to Use | Examples |
|------|-----------|----------|
| **feat** | New feature/functionality | "feat: Add budget allocation", "feat(mobile): New admin screen" |
| **fix** | Bug fix | "fix: Resolve flag rendering", "fix(search): Fix village lookup" |
| **docs** | Documentation only | "docs: Update hierarchy guide", "docs: Add API examples" |
| **refactor** | Code improvement, no feature change | "refactor: Optimize search algorithm", "refactor: Simplify state management" |
| **test** | Add/update tests | "test: Add unit tests for location service" |
| **chore** | Dependencies, config, tooling | "chore: Update packages", "chore: Configure ESLint" |

---

## 🎯 Scope Guidelines

Use scope to indicate which part of system is affected:

```
web-app              ← Web application changes
mobile-app           ← Mobile app changes
functions            ← Firebase Cloud Functions
scripts              ← Build/import scripts
flag                 ← Flag-related changes
docs                 ← Documentation
```

### Scope Examples
```
feat(web-app): Add map zoom controls
fix(mobile-app): Resolve navigation back button
feat(functions): Add location search API
fix(flag): Update Uganda flag SVG with crane
docs(hierarchy): Complete administrative structure guide
```

---

## ✅ Pre-Commit Checklist

Before committing, ensure:

- [ ] Code compiles/runs without errors
- [ ] Tests pass (if applicable)
- [ ] Only intentional files are staged
- [ ] Commit message is one line
- [ ] Commit message uses imperative mood
- [ ] No periods at end of message
- [ ] Message is descriptive but concise
- [ ] Scope is relevant (or omitted if not needed)

---

## 📊 Git Workflow Quick Reference

### View commit history
```powershell
git log --oneline -10        # Last 10 commits
git log --oneline --graph    # Graphical history
git log --author="Name"      # Commits by author
```

### Undo commits (if needed)
```powershell
git reset --soft HEAD~1      # Undo last commit, keep changes
git reset --hard HEAD~1      # Undo last commit, discard changes
git revert HEAD              # Create new commit that undoes last
```

### View changes before commit
```powershell
git diff                     # Changes not staged
git diff --cached            # Staged changes
git status                   # Overall status
```

### Stash changes temporarily
```powershell
git stash                    # Save changes
git stash list               # View stashes
git stash pop                # Restore changes
```

---

## 🚀 Development Workflow

### Typical Session

```powershell
# 1. Start work
cd c:\Users\Raheem\Desktop\location-system
git pull origin main         # Get latest

# 2. Make changes to files
# Edit src/screens/AdminLevelsScreen.tsx
# Edit src/services/locationService.ts

# 3. Check what changed
git status
git diff src/screens/AdminLevelsScreen.tsx

# 4. Stage and commit
git add -A
git commit -m "feat(mobile-app): Add district editor screen"

# 5. Continue with next feature
# Edit another file...
git add -A
git commit -m "feat: Implement budget allocation logic"

# 6. Push to remote
git push origin main
```

---

## 💡 Best Practices

### ✅ DO

- Commit frequently (after each logical change)
- Write clear, descriptive messages
- Use one-line format consistently
- Test before committing
- Keep commits focused on one change
- Use lowercase for message

### ❌ DON'T

- Mix multiple unrelated changes in one commit
- Use vague messages like "update", "fix", "work in progress"
- Add periods or exclamation marks
- Change commit convention between commits
- Leave broken code in commits
- Commit commented-out code

---

## 🔄 Commit Message Evolution

### As Features Develop

```
Day 1: feat: Add budget allocation data model
Day 2: feat(mobile-app): Create budget editor screen
Day 3: feat(web-app): Add budget visualization chart
Day 4: feat(functions): Implement budget API endpoints
Day 5: test: Add integration tests for budget module
Day 6: docs: Add budget allocation guide
```

Each commit is atomic and self-contained.

---

## 📝 Special Cases

### Large Features
Split into multiple commits:
```
feat(mobile-app): Add admin dashboard UI skeleton
feat(mobile-app): Implement district list with search
feat(mobile-app): Add editing functionality
feat(mobile-app): Add delete confirmation dialog
test(mobile-app): Add unit tests for dashboard
```

### Bug Fixes
Link to issue if applicable:
```
fix: Resolve Uganda flag loading timeout
```

### Documentation
Keep separate from code:
```
docs: Add admin user guide
docs: Update API documentation
```

---

## 🔗 Integration with Development Tools

### VS Code Git Extensions
If using GitLens or similar:
- They will show commits formatted correctly
- Use the command palette to commit

### Pre-commit Hooks (Optional)
Can add `.git/hooks/pre-commit` to enforce formatting (advanced).

### GitHub/GitLab
- Commits appear in UI with one-line format
- Pull requests show clean history
- Release notes can auto-generate from commits

---

## 📚 References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

---

## ❓ FAQ

**Q: What if I made changes but forgot to commit?**
A: Stage and commit them:
```powershell
git add -A; git commit -m "feat: Your feature here"
```

**Q: Can I change the last commit message?**
A: Yes, if not pushed:
```powershell
git commit --amend -m "feat: Corrected message"
```

**Q: Should I commit work-in-progress code?**
A: No. Only commit working, tested code. Use branches for experimental work.

**Q: What if my commit has a typo?**
A: If already pushed, create a fix commit. If local, amend.

---

## ✅ Ready to Develop!

Your location-system is now set up for:
- ✅ Consistent one-line commits
- ✅ Clear project history
- ✅ Easy collaboration
- ✅ Professional git practices

**Start your next feature with:**
```powershell
.\auto-commit.ps1 -Type "feat" -Description "Your new feature"
```

---

*Last Updated: August 17, 2026*  
*System: Uganda Administrative Registration System*  
*Commit Standard: One-line, Conventional Commits format*
