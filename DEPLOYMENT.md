# Postboard — Deployment Guide

## Overview

Postboard is a multi-tenant recruitment platform with:
- **Frontend**: TanStack Start SSR application (port 3000)
- **Backend**: Express + Prisma API (port 5000)
- **Worker**: BullMQ email worker
- **Database**: PostgreSQL 16
- **Cache/Queue**: Redis 7
- **Proxy**: Nginx 1.27

---

## Infrastructure Requirements

### Minimum (Staging / Low Traffic)
| Resource | Spec |
|----------|------|
| CPU | 2 vCPUs |
| RAM | 4 GB |
| Disk | 20 GB SSD |
| Docker | 24+ |
| PostgreSQL | 16+ |

### Recommended (Production)
| Resource | Spec |
|----------|------|
| CPU | 4 vCPUs |
| RAM | 8 GB |
| Disk | 50 GB SSD (or more for DB volume) |
| Docker | 24+ with Compose v2 |
| PostgreSQL | 16+ with WAL archiving |

### Required Services
- Docker Engine 24+ and Docker Compose v2
- Domain name with DNS pointing to server IP
- SMTP/Resend API key for emails
- Cloudinary account for file uploads
- Sentry DSN for error tracking (optional)

---

## Environment Variables

### Frontend (`/.env`)
```env
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_APP_ENV=production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=true
VITE_SENTRY_DSN=https://your-dsn@sentry.io/your-project
VITE_APP_TITLE=PostBoard
VITE_APP_DESCRIPTION=Technical recruitment platform
VITE_APP_URL=https://yourdomain.com
```

### Backend (`/jobboard/.env`)
```env
NODE_ENV=production
PORT=5000
LOG_LEVEL=info
ALLOW_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

DATABASE_URL=postgresql://user:password@postgres:5432/postboard

JWT_ACCESS_SECRET=<32+ char random string>
JWT_REFRESH_SECRET=<different 32+ char random string>
JWT_SUPERADMIN_SECRET=<another 32+ char random string>
ACCESS_EXPIRES=15m
REFRESH_EXPIRES=7d

REDIS_URL=redis://redis:6379

RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com

CLOUDINARY_CLOUD_NAME=<your-cloud>
CLOUDINARY_API_KEY=<your-key>
CLOUDINARY_API_SECRET=<your-secret>

APP_URL=https://yourdomain.com

ENABLE_DOCS=false

SUPER_ADMIN_EMAIL=admin@yourcompany.com
SUPER_ADMIN_PASSWORD=<change-immediately>
SUPER_ADMIN_FIRST_NAME=Super
SUPER_ADMIN_LAST_NAME=Admin
```

> **Security**: Never commit `.env` files. Use `.env.example` as template. Generate unique secrets for each environment.

---

## Deployment Steps

### 1. Server Preparation

```bash
# Install Docker & Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Create directories
mkdir -p /opt/postboard/{backups,nginx/{conf.d,logs},certbot}

# Set up swap (if < 4GB RAM)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

### 2. Clone & Configure

```bash
git clone https://github.com/yourorg/postboard.git /opt/postboard
cd /opt/postboard

# Create production environment files
cp .env.production.example .env
cp jobboard/.env.production.example jobboard/.env

# Edit .env files with your values
nano .env
nano jobboard/.env
```

### 3. SSL Certificate (Let's Encrypt)

```bash
# Initial certificate (replace yourdomain.com)
docker run -it --rm -v certbot_data:/etc/letsencrypt \
  -v $(pwd)/nginx/conf.d:/var/www/certbot \
  certbot/certbot certonly --webroot \
  -w /var/www/certbot \
  -d yourdomain.com -d www.yourdomain.com

# Update nginx/conf.d/postboard.conf with your domain name
```

### 4. Deploy

```bash
# Start all services
docker compose up -d

# Verify
docker compose ps
curl http://localhost:8080/health
curl http://localhost:5000/health
```

### 5. Seed Super Admin (first deploy only)

```bash
docker compose exec api npx prisma db seed
```

---

## Docker Compose Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `nginx` | nginx:1.27-alpine | 80, 443 | Reverse proxy |
| `frontend` | custom | 3000 | SSR application |
| `api` | custom | 5000 | Express API |
| `email-worker` | custom | - | BullMQ worker |
| `postgres` | postgres:16-alpine | 5432 | Database |
| `redis` | redis:7-alpine | 6379 | Cache/queue |
| `backup` | postgres:16-alpine | - | pg_dump cron |

---

## Rollback

### Docker Compose Rollback
```bash
# Revert to previous images
docker compose up -d --no-deps --remove-orphans

# Or specific version
docker compose up -d api=<previous-tag>
```

### Database Rollback
```bash
# Restore from backup
./backups/scripts/restore.sh -f /backups/postboard_20260101_000000.dump

# Then re-run migrations
docker compose exec api npx prisma migrate deploy
```

### Full Rollback
```bash
# Stop all services
docker compose down

# Checkout previous version
git checkout <previous-tag>

# Restore database from backup
# Restart
docker compose up -d
```

---

## Scaling

### Vertical Scaling
Increase server resources in `docker-compose.yml`:
```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
```

### Horizontal Scaling (Multi-Instance)
```bash
# Run multiple API instances
docker compose up -d --scale api=3 --scale email-worker=2
```

> Note: Requires a load balancer in front of Nginx for true horizontal scaling.

---

## Health Checks

| Endpoint | Service | Description |
|----------|---------|-------------|
| `GET /health` | API | Basic health (DB + Redis) |
| `GET /ready` | API | Readiness probe |
| `GET /queue/health` | API | Queue health |
| `http://localhost:8080/health` | Nginx | Internal health |
| Port 3000 | Frontend | SSR responds to HTTP |

---

## Monitoring

### Integrated Monitoring
- **Sentry**: Frontend + backend error tracking (configurable via env vars)
- **Health endpoints**: Built into API and Nginx
- **Docker healthchecks**: All services have health checks
- **Logs**: Structured JSON via Winston (backend) and Nginx access logs

### External Monitoring Recommendations
- **Uptime monitoring**: Check `/health` every 60s
- **APM**: Sentry Performance or DataDog
- **Metrics**: Prometheus + Grafana (future)
- **Log aggregation**: Papertrail, Logtail, or ELK

---

## Troubleshooting

### Container won't start
```bash
# Check logs
docker compose logs <service>

# Common issues:
# - Database unreachable: Check POSTGRES_USER/PASSWORD/DB match
# - Redis connection refused: Check REDIS_URL
# - Migration failed: Check DATABASE_URL and network
```

### High memory usage
```bash
# Check per-container usage
docker stats

# Limit memory in docker-compose.yml
```

### SSL certificate expired
```bash
# Renew
docker run --rm -v certbot_data:/etc/letsencrypt certbot/certbot renew

# Reload nginx
docker compose exec nginx nginx -s reload
```

---

## Production Checklist

- [ ] All `.env` files created with production values
- [ ] JWT secrets generated (32+ random chars each)
- [ ] Database password changed from default
- [ ] SSL certificates issued and configured
- [ ] Domain DNS pointing to server
- [ ] Resend API key configured
- [ ] Cloudinary credentials configured
- [ ] Sentry DSN configured (optional)
- [ ] Firewall configured (allow 80, 443 only)
- [ ] SSH key-based auth only (no passwords)
- [ ] Automatic security updates enabled
- [ ] Backup cron job verified
- [ ] Monitoring endpoints tested
- [ ] Docker compose up confirmed
- [ ] Health checks all passing
- [ ] Frontend accessible via HTTPS
- [ ] API accessible via HTTPS
- [ ] Email sending verified
- [ ] File uploads working
- [ ] SuperAdmin login confirmed
- [ ] Rollback procedure documented
