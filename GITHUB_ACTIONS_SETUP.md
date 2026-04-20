# GitHub Actions CI/CD Setup Guide

## ✅ What Was Set Up

I've created GitHub Actions CI/CD pipelines for your Event ERP system:

### 📦 Workflow Files Created

1. **`deploy.yml`** - Main deployment pipeline
   - Triggers on push to `main` branch
   - Runs tests (if available)
   - Builds frontend
   - Deploys backend (PM2 restart)
   - Deploys frontend (copy to production)

2. **`test.yml`** - Testing pipeline
   - Triggers on push to `main`/`develop` and pull requests
   - Runs frontend tests (if available)
   - Runs backend tests (if available)
   - Generates coverage reports (if configured)

---

## 🔐 Required GitHub Secrets

You need to add these **secrets** to your GitHub repository:

### How to Add Secrets:

1. Go to your repository: `https://github.com/PsychopathSyed/moonlight/settings/secrets/actions`
2. Click **"New repository secret"**
3. Add each secret below:

### Required Secrets:

| Secret Name | Value |
|-------------|-------|
| `VPS_HOST` | Your VPS IP address (e.g., `192.168.1.100`) |
| `VPS_USERNAME` | SSH username (e.g., `openclaw`) |
| `VPS_SSH_KEY` | SSH private key (see below) |

---

## 🔑 SSH Private Key for GitHub Actions

Copy this entire key (including `-----BEGIN` and `-----END` lines):

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACACWi0Z1QYNYniQyFyr4Ett1i2eJ1J9J680P0QKfMTA+AAAAJgLkpopC5Ka
KQAAAAtzc2gtZWQyNTUxOQAAACACWi0Z1QYNYniQyFyr4Ett1i2eJ1J9J680P0QKfMTA+A
AAAECy/8dWTRZCDPEu0Al4MMeOhhy/liPTs7NiMXNdD++baAJaLRnVBg1ieJDIXKvgS23W
LZ4nUn0nrzQ/RAp8xMD4AAAAFWdpdGh1Yi1hY3Rpb25zLWRlcGxveQ==
-----END OPENSSH PRIVATE KEY-----
```

### Add this secret as `VPS_SSH_KEY`:
1. Go to: `https://github.com/PsychopathSyed/moonlight/settings/secrets/actions`
2. Click **"New repository secret"**
3. Name: `VPS_SSH_KEY`
4. Value: Paste the entire SSH private key above
5. Click **"Add secret"**

---

## 🎯 How It Works

### Automatic Deployment (on push to `main`):

```
You push code to main
    ↓
GitHub Actions triggers
    ↓
Run tests (if available)
    ↓
Build frontend (npm run build)
    ↓
Deploy backend to VPS
    - Sync backend files
    - Restart PM2
    - Health check
    ↓
Deploy frontend to VPS
    - Sync dist files
    - Verify deployment
    ↓
Deployment complete!
```

### Manual Trigger:

You can also trigger deployment manually:
1. Go to: `https://github.com/PsychopathSyed/moonlight/actions`
2. Click **"Deploy Event ERP to Production"**
3. Click **"Run workflow"**

---

## 📊 What Gets Deployed

### Backend:
- ✅ All Python code (routers, models, schemas, config)
- ✅ Requirements.txt
- ✅ Main.py and configuration files
- ❌ Excluded: `.env`, `__pycache__`, `venv`, logs, uploads

### Frontend:
- ✅ Built React app (dist/ folder)
- ✅ All optimized production assets
- ✅ index.html and JavaScript bundles

---

## 🧪 Testing Pipeline

Currently, the workflow **doesn't require tests** (since you don't have any yet).

### Future Test Implementation:

When you add tests, the pipeline will:
1. Run frontend tests (npm test)
2. Run backend tests (pytest)
3. **Fail deployment** if tests fail

### Test Status:

```
✅ Tests run (if available)
⚠️  No tests found - skipped (current state)
❌ Tests failed - deployment blocked (future)
```

---

## 🔍 Monitoring Deployments

### View Deployment Status:

1. Go to: `https://github.com/PsychopathSyed/moonlight/actions`
2. See all workflow runs
3. Click on any run to see:
   - Step-by-step logs
   - Success/failure status
   - Error messages (if any)

### Deployment Logs:

Each step shows detailed logs:
- Which files were synced
- Build output
- SSH connection status
- Health check results

---

## 🚀 After You Add Secrets

### First Deployment:

Once you add the GitHub Secrets, the **next push** will trigger automatic deployment:

```bash
cd /opt/event-erp
git add .
git commit -m "Your changes"
git push
```

GitHub Actions will automatically:
1. ✅ Run tests (if available)
2. ✅ Build frontend
3. ✅ Deploy to VPS
4. ✅ Restart PM2
5. ✅ Verify deployment

---

## 🛠️ Common Issues & Solutions

### Issue: "Permission denied (publickey)"
**Solution**: Check that `VPS_SSH_KEY` secret is correct and includes all lines

### Issue: "rsync: command not found"
**Solution**: Install rsync on VPS: `sudo apt install rsync`

### Issue: "PM2 not found"
**Solution**: Ensure PM2 is in PATH: `pm2 startup` (already configured)

### Issue: "Deployment fails but manually works"
**Solution**: Check GitHub Actions logs for specific error message

---

## 📝 Next Steps

### 1. Add GitHub Secrets (Required):
- [ ] Go to: `https://github.com/PsychopathSyed/moonlight/settings/secrets/actions`
- [ ] Add `VPS_HOST` secret
- [ ] Add `VPS_USERNAME` secret
- [ ] Add `VPS_SSH_KEY` secret (use the key above)

### 2. Test First Deployment:
```bash
cd /opt/event-erp
# Make a small change
echo "# Test deployment" >> README.md
git add .
git commit -m "Test GitHub Actions deployment"
git push
```

### 3. Monitor Deployment:
- Go to: `https://github.com/PsychopathSyed/moonlight/actions`
- Watch the deployment in real-time
- Check logs if anything fails

### 4. (Optional) Add Tests:
- Frontend: Add npm test script to `package.json`
- Backend: Add pytest tests to `backend/tests/`
- Add test dependencies to `requirements.txt`

---

## 🎉 Benefits

Once configured, you'll get:

✅ **Automatic deployment** on every push to `main`
✅ **Zero manual work** - no more copying files manually
✅ **Test integration** - fails if tests fail (when you add tests)
✅ **Rollback capability** - revert commits to rollback deployments
✅ **Deployment logs** - full visibility into each deployment
✅ **Manual trigger** - can deploy without pushing code

---

**🚀 Your CI/CD pipeline is ready! Just add the GitHub Secrets and it will work automatically!**
