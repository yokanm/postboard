# Postboard — Operations Runbook

## Overview

This runbook covers common production incidents, diagnosis procedures, and recovery steps for the Postboard platform.

### Contact / Escalation
| Role | Contact |
|------|---------|
| Platform Engineer | DevOps team (PagerDuty) |
| Backend Lead | Backend squad (Slack) |
| Security Officer | Security team (email) |
| Emergency | On-call engineer (phone) |

---

## Incident Severity Levels

| Level | Definition | Response Time |
|-------|------------|---------------|
| **SEV1** | Complete outage — all users affected | 15 min |
| **SEV2** | Partial outage — feature degraded | 1 hour |
| **SEV3** | Minor issue — non-critical | 24 hours |
| **SEV4** | Cosmetic / non-urgent | Next sprint |

---

## Common Incidents

### 1. API is Down

**Symptoms**:
- `502 Bad Gateway` from Nginx
- Health check fails (`/health` returns 5xx)
- Frontend shows "Failed to load data" errors

**Diagnosis**:
```bash
# Check container status
docker compose ps api

# View recent logs
docker compose logs --tail=50 api

# Check for OOM kill
docker inspect postboard-api | jq '.[0].State.OOMKilled'

# Verify database connectivity
docker compose exec api node -e "require('http').get('http://localhost:5000/health', r => console.log(r.statusCode))"
```

**Recovery**:
```bash
# Restart the container
docker compose restart api

# If OOM: increase memory limits in docker-compose.yml, then restart
# If migration failed: check prisma migration status
docker compose exec api npx prisma migrate status

# If code error: rollback to previous image
docker compose up -d --no-deps api=<previous-tag>
```

**Escalation**: If API fails to start after 3 attempts, escalate to SEV1.

---

### 2. Database Failure

**Symptoms**:
- API returns 500 errors with "database connection failed"
- Migration commands fail
- `pg_isready` returns failure

**Diagnosis**:
```bash
# Check PostgreSQL container
docker compose ps postgres
docker compose logs --tail=50 postgres

# Check disk space on data volume
docker system df

# Verify from inside container
docker compose exec postgres pg_isready -U postboard -d postboard

# Check PostgreSQL logs for corruption
docker compose exec postgres tail -100 /var/lib/postgresql/data/log/postgresql-*.log
```

**Recovery**:

#### Connection Pool Exhaustion
```bash
# Restart API to release connections
docker compose restart api

# Increase pool size in Prisma config if persistent
```

#### Disk Full
```bash
# Clean up old backups
find /backups -name "*.dump" -mtime +7 -delete

# Remove old Docker images
docker image prune -af

# Vacuum full (requires downtime)
docker compose exec postgres psql -U postboard -d postboard -c "VACUUM FULL;"
```

#### Database Corruption
```bash
# 1. Stop API
docker compose stop api

# 2. Restore from latest backup
./backups/scripts/restore.sh -f /backups/postboard_latest.dump

# 3. Re-run migrations
docker compose exec api npx prisma migrate deploy

# 4. Start API
docker compose start api
```

**Escalation**: Database corruption or data loss → SEV1 immediately.

---

### 3. Redis Failure

**Symptoms**:
- Queues not processing
- Rate limiting disabled
- Auth refresh failures

**Diagnosis**:
```bash
docker compose ps redis
docker compose logs --tail=50 redis
docker compose exec redis redis-cli ping
docker compose exec redis redis-cli info persistence
docker compose exec redis redis-cli dbsize
```

**Recovery**:
```bash
# Restart Redis
docker compose restart redis

# If data corruption: restore from RDB backup
# Stop, replace dump.rdb, restart
docker compose stop redis
cp /backups/redis/redis_latest.rdb /var/lib/docker/volumes/postboard_redis_data/_data/dump.rdb
docker compose start redis
```

**Note**: Redis is a cache/queue — data loss may cause:
- Pending email notifications to be lost
- Rate limit counters to reset (safe)
- BullMQ jobs to be re-queued from DB on worker restart

**Escalation**: Redis unavailable > 15 min → SEV2.

---

### 4. Queue / Worker Failure

**Symptoms**:
- Emails not sending
- Bull Board shows stalled jobs
- Worker container restarting

**Diagnosis**:
```bash
docker compose ps email-worker
docker compose logs --tail=50 email-worker

# Check queue health
curl http://localhost:5000/queue/health

# Access Bull Board (requires auth)
# https://yourdomain.com/admin/queues
```

**Recovery**:
```bash
# Restart worker
docker compose restart email-worker

# Clear stalled jobs (Bull Board UI or redis-cli)
docker compose exec redis redis-cli KEYS "bull:*" | xargs docker compose exec redis redis-cli DEL

# If Resend API key invalid: check RESEND_API_KEY env var
```

**Escalation**: Email queue backlog > 1000 jobs → SEV3.

---

### 5. Frontend SSR Failure

**Symptoms**:
- Blank page or spinner
- SSR timeout errors in Nginx logs
- `503 Service Unavailable`

**Diagnosis**:
```bash
docker compose ps frontend
docker compose logs --tail=50 frontend

# Check if SSR responds directly
curl http://localhost:3000

# Check Nginx error logs
docker compose exec nginx tail -50 /var/log/nginx/error.log
```

**Recovery**:
```bash
# Restart frontend
docker compose restart frontend

# If build issue: rebuild with cache clear
docker compose build --no-cache frontend
docker compose up -d --no-deps frontend
```

**Escalation**: Frontend down > 10 min → SEV1.

---

### 6. Email Delivery Failure

**Symptoms**:
- Users not receiving password reset / verification emails
- Worker logs showing API errors

**Diagnosis**:
```bash
docker compose logs email-worker | grep -i "error\|fail\|reject"

# Check Resend API dashboard for delivery status
# Verify EMAIL_FROM domain is verified in Resend
```

**Recovery**:
```bash
# Re-queue failed jobs
# Access Bull Board at /admin/queues and retry failed jobs

# If Resend rate limited: wait and retry automatically (BullMQ retry built in)
# If EMAIL_FROM unverified: verify domain in Resend dashboard
```

**Escalation**: Complete email failure > 1 hour → SEV2.

---

### 7. High CPU / Memory

**Symptoms**:
- Slow page loads
- API latency spikes
- Container OOM kills
- Server monitoring alerts

**Diagnosis**:
```bash
# Top CPU consumers
docker stats --no-stream

# Check per-process inside container
docker compose exec api top -b -n 1

# Check Node.js heap usage
docker compose exec api node -e "console.log(process.memoryUsage())"
```

**Recovery**:
```bash
# Increase resource limits
# Edit docker-compose.yml deploy.resources section

# Add more API replicas
docker compose up -d --scale api=3 --no-deps

# Restart to clear memory leaks
docker compose restart api

# Long-term: profile with clinic.js or Sentry Performance
```

**Escalation**: OOM kills every hour → SEV2.

---

### 8. Security Incident

**Symptoms**:
- Suspicious login attempts
- Unauthorized access detected
- Rate limit alerts firing

**Diagnosis**:
```bash
# Check audit logs (API)
docker compose exec api node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  prisma.securityEvent.findMany({ take: 20, orderBy: { createdAt: 'desc' } })
    .then(console.log).catch(console.error)
"

# Check Nginx access logs for anomaly patterns
docker compose exec nginx tail -100 /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -20
```

**Recovery**:
```bash
# Block offending IPs
docker compose exec nginx sh -c 'echo "deny <offending-ip>;" >> /etc/nginx/conf.d/blocked.conf && nginx -s reload'

# Force logout all users (rotate JWT secrets)
# Update JWT secrets in .env
docker compose restart api

# If credentials compromised:
# 1. Rotate ALL secrets (JWT, DB, Resend, Cloudinary)
# 2. Force password reset for all users
# 3. Audit all recent actions
```

**Escalation**: Any confirmed breach → SEV1 + security officer notified.

---

## Backup & Recovery Procedures

### Automated Backups (configured in docker-compose.yml)
- **PostgreSQL**: Daily at 3 AM (pg_dump custom format)
- **Redis**: Hourly RDB snapshots (via AOF persistence)
- **Retention**: 30 days (PostgreSQL), 7 days (Redis)

### Manual Backup
```bash
# PostgreSQL
docker compose exec postgres pg_dump -U postboard -d postboard -Fc -f /backups/manual_$(date +%Y%m%d).dump

# Redis
docker compose exec redis redis-cli SAVE
docker compose cp redis:/data/dump.rdb ./backups/redis_manual.rdb
```

### Full Recovery Drill
```bash
# 1. Stop all services except database
docker compose stop frontend api email-worker

# 2. Restore database
./backups/scripts/restore.sh -f /backups/postboard_20260101_000000.dump

# 3. Run pending migrations
docker compose exec api npx prisma migrate deploy

# 4. Start services
docker compose start frontend api email-worker

# 5. Verify
curl http://localhost:5000/health
curl http://localhost:3000
```

---

## Maintenance Procedures

### Zero-Downtime Migration
```bash
# 1. Run migrations (already handled by entrypoint.sh)
docker compose restart api

# 2. Verify
curl http://localhost:5000/health
```

### Log Rotation (built into Nginx)
- Nginx logs rotate via `docker compose logs` or external log shipper
- Application logs via Winston (configured in `src/lib/winston.ts`)

### Certificate Renewal (Let's Encrypt)
```bash
# Automated (cron): renew every 60 days
docker run --rm -v certbot_data:/etc/letsencrypt certbot/certbot renew
docker compose exec nginx nginx -s reload
```

### Security Updates
```bash
# Rebuild containers with security patches
docker compose build --no-cache
docker compose up -d
```

---

## Monitoring Queries

### API Latency (via Nginx logs)
```bash
docker compose exec nginx awk '{print $NF, $(NF-1)}' /var/log/nginx/access.log | sort -rn | head -20
```

### Active Users
```bash
docker compose exec api node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  prisma.refreshToken.count({ where: { expiresAt: { gt: new Date() } } })
    .then(c => console.log('Active sessions:', c));
"
```

### Queue Depth
```bash
curl -s http://localhost:5000/queue/health | jq .
```

---

## Appendices

### A. Environment Variable Reference

See `DEPLOYMENT.md` → Environment Variables section.

### B. Docker Commands Quick Reference

```bash
docker compose ps                          # Service status
docker compose logs -f <service>          # Follow logs
docker compose restart <service>          # Restart service
docker compose down                       # Stop all
docker compose up -d                      # Start all
docker compose build --no-cache <service> # Rebuild
docker compose exec <service> <cmd>       # Run command
```

### C. Health Checks Reference

| Service | Check | Command |
|---------|-------|---------|
| API | HTTP 200 | `curl localhost:5000/health` |
| Frontend | HTTP 200 | `curl localhost:3000` |
| PostgreSQL | pg_isready | `docker compose exec postgres pg_isready` |
| Redis | PING | `docker compose exec redis redis-cli ping` |
| Worker | Process | `docker compose ps email-worker` |
| Nginx | Port 80/443 | `curl -I https://yourdomain.com` |

### D. Data Locations

| Data | Location (container) | Location (host volume) |
|------|---------------------|----------------------|
| PostgreSQL | `/var/lib/postgresql/data` | `postgres_data` |
| Redis | `/data` | `redis_data` |
| Backups | `/backups` | `./backups/` |
| Nginx logs | `/var/log/nginx/` | `nginx_logs` |
| SSL certs | `/etc/letsencrypt` | `certbot_data` |
