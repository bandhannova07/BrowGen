# 🚀 Windsurf Enhancement Deployment Checklist

## ✅ **Pre-Deployment Completed**

### 🔐 **Cookie-Based Authentication**
- [x] httpOnly refresh tokens (7d) + access tokens (15m)
- [x] `/api/auth/refresh` endpoint for token renewal
- [x] `/api/auth/logout` endpoint for cookie clearing
- [x] Enhanced auth middleware with token type validation
- [x] Cookie parser middleware added to Express app

### ⚡ **Upstash Redis Integration**
- [x] Updated redis.js for Upstash compatibility
- [x] TLS support for upstash.io domains
- [x] Improved connection handling and timeouts
- [x] Fallback handling for Redis unavailability

### 🤖 **Bro Chatbot Enhancement**
- [x] 5 custom flows implemented:
  - [x] `home-welcome` - Homepage greeting
  - [x] `on-chapter-complete` - Chapter completion celebration
  - [x] `daily-streak-reminder` - Daily login streak motivation
  - [x] `community-invite` - Community engagement prompt
  - [x] `mentorship-prompt` - Stuck user guidance
- [x] Friendly tone with contextual responses
- [x] Enhanced EN/BN/HI localization

### 🏆 **Gamification Updates**
- [x] Points increased to 50 per module (was 10)
- [x] 8 custom badges implemented:
  - [x] First Steps (1 course) - 100 points
  - [x] Streak Starter (3-day) - 50 points
  - [x] Week Warrior (7-day) - 150 points
  - [x] Month Master (30-day) - 500 points
  - [x] Challenge Champ (10 challenges) - 200 points
  - [x] Skill Builder (500 points) - 75 points
  - [x] Knowledge Seeker (1000 points) - 150 points
  - [x] Pro Coder (2000 points) - 300 points

### 🌐 **i18n Improvements**
- [x] Extended translations for gamification features
- [x] Badge and achievement notifications
- [x] Mixed-language approach for BN/HI maintained

### 📋 **Environment & Documentation**
- [x] Comprehensive `.env.example` created
- [x] Backup branch created: `backup/pre-windsurf-migration-20250925`
- [x] Feature branch pushed: `prod-elevate/windsurf-auth-redis-20250925`

---

## 🔧 **Render Environment Variables Required**

### **Backend Service (browgen-backend)**
```bash
# Core (Already Set)
NODE_ENV=production
PORT=10000
DATABASE_URL=<auto-linked>
JWT_SECRET=<existing-secret>
CORS_ORIGIN=https://browgen-frontend.onrender.com

# NEW - Upstash Redis (REQUIRED)
UPSTASH_REDIS_URL=https://wise-perch-5685.upstash.io
UPSTASH_REDIS_REST_URL=https://wise-perch-5685.upstash.io
UPSTASH_REDIS_REST_TOKEN=AhY1AAIgcDFIth6CHePNiehSjWqk10Chic4fkwX10ng7L0dD4p32nw

# Optional - Analytics (Set Later)
POSTHOG_API_KEY=<to-be-set>
SENTRY_DSN=<to-be-set>
```

### **Frontend Service (browgen-frontend)**
```bash
# Core (Already Set)
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://browgen-backend.onrender.com

# Optional - Analytics (Set Later)
NEXT_PUBLIC_POSTHOG_KEY=<to-be-set>
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## 🧪 **Smoke Test Commands**

### **1. Health Check**
```bash
BACKEND_URL="https://browgen-backend.onrender.com"
curl -s "$BACKEND_URL/api/health" | jq .
# Expected: {"ok":true,"service":"browgen-backend"}
```

### **2. Cookie-Based Auth Test**
```bash
# Signup with cookie capture
curl -s -c cookies.txt -X POST "$BACKEND_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"testpass123"}' | jq .
# Expected: {"accessToken":"...", "user":{...}}

# Login with cookie capture
curl -s -c cookies.txt -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}' | jq .
# Expected: {"accessToken":"...", "user":{...}}

# Refresh token using cookie
curl -s -b cookies.txt -X POST "$BACKEND_URL/api/auth/refresh" | jq .
# Expected: {"accessToken":"..."}

# Logout
curl -s -b cookies.txt -X POST "$BACKEND_URL/api/auth/logout" | jq .
# Expected: {"message":"Logged out successfully"}
```

### **3. Upstash Redis Cache Test**
```bash
# First request (should be MISS)
curl -s -I "$BACKEND_URL/api/courses" | grep -i x-cache
# Expected: X-Cache: MISS

# Second request (should be HIT)
curl -s -I "$BACKEND_URL/api/courses" | grep -i x-cache
# Expected: X-Cache: HIT
```

### **4. Bro Chatbot Test**
```bash
TOKEN="<access-token-from-login>"

# Test home-welcome flow
curl -s -X POST "$BACKEND_URL/api/bro/trigger" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"trigger":"home-welcome","language":"en"}' | jq .
# Expected: {"show":true,"message":"Welcome back! 🎉...","options":[...]}

# Test Bengali localization
curl -s -X POST "$BACKEND_URL/api/bro/trigger" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"trigger":"home-welcome","language":"bn"}' | jq .
# Expected: Bengali message with mixed language
```

### **5. Enhanced Gamification Test**
```bash
# Get user stats
curl -s -H "Authorization: Bearer $TOKEN" "$BACKEND_URL/api/gamification/stats" | jq .
# Expected: Updated point values and new badges

# Award points (50 per module now)
curl -s -X POST "$BACKEND_URL/api/gamification/award" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"MODULE_COMPLETE","courseId":"test"}' | jq .
# Expected: 50 points awarded
```

### **6. Frontend Tests**
```bash
FRONTEND_URL="https://browgen-frontend.onrender.com"

# Test pages load
curl -s -I "$FRONTEND_URL" | head -1
curl -s -I "$FRONTEND_URL/learning" | head -1
curl -s -I "$FRONTEND_URL/dashboard" | head -1
# Expected: HTTP/1.1 200 OK
```

---

## 🔄 **Deployment Steps**

### **1. Merge to Main**
```bash
git checkout main
git merge prod-elevate/windsurf-auth-redis-20250925
git push origin main
```

### **2. Set Environment Variables in Render**
1. Go to Render Dashboard → browgen-backend
2. Navigate to Environment tab
3. Add the Upstash Redis variables:
   - `UPSTASH_REDIS_URL`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### **3. Monitor Deployment**
1. Watch build logs for errors
2. Check health endpoint after deployment
3. Run smoke tests
4. Monitor Sentry for any errors

### **4. Verify Features**
- [ ] Cookie-based auth works
- [ ] Redis caching active (X-Cache headers)
- [ ] Bro chatbot shows new flows
- [ ] Gamification shows 50 points per module
- [ ] Language switcher works
- [ ] No JavaScript errors in browser console

---

## 🚨 **Rollback Plan**

### **Immediate Issues**
1. **Render Dashboard Rollback**:
   - Go to browgen-backend → Deployments
   - Click "Rollback" on previous stable version

2. **Code Rollback**:
   ```bash
   git checkout main
   git reset --hard <previous-stable-commit>
   git push --force-with-lease origin main
   ```

3. **Environment Cleanup**:
   - Remove Upstash Redis variables if causing issues
   - Revert to previous JWT_SECRET if needed

### **Database Issues**
- No schema changes made, so no database rollback needed
- If Redis issues occur, app will fallback gracefully

---

## 📊 **Success Metrics**

### **Performance**
- [ ] API response times < 500ms
- [ ] Redis cache hit rate > 70%
- [ ] Frontend load times < 3s
- [ ] Error rate < 1%

### **Functionality**
- [ ] Auth flow works end-to-end with cookies
- [ ] Bro chatbot triggers correctly
- [ ] Gamification awards correct points
- [ ] Language switching works
- [ ] Admin panel accessible

### **Security**
- [ ] httpOnly cookies set correctly
- [ ] No tokens exposed in localStorage
- [ ] CORS headers correct
- [ ] Rate limiting active

---

## 📞 **Post-Deployment Actions**

1. **Monitor for 24 hours**:
   - Check Sentry for errors
   - Monitor user signup/login success rates
   - Watch Redis memory usage

2. **User Communication**:
   - Announce new features (enhanced gamification, Bro flows)
   - Update documentation if needed

3. **Analytics Setup** (Next Phase):
   - Set PostHog API keys
   - Configure Sentry alerts
   - Set up monitoring dashboards

---

**Deployment Status**: ✅ Ready for Production
**Estimated Deployment Time**: 10-15 minutes
**Risk Level**: Low (graceful fallbacks implemented)
