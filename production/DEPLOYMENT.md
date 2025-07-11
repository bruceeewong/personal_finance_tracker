# Production Deployment Guide

This guide provides instructions for deploying the Personal Finance application to production using Docker.

## Prerequisites

- Docker and Docker Compose installed
- Domain name (optional, for public deployment)
- SSL certificates (optional, for HTTPS)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd personal_finance
   ```

2. **Create environment file**
   ```bash
   cp production/.env.example .env
   ```

3. **Configure environment variables**
   Edit `.env` file with your production values:
   - Set strong passwords for database and Redis
   - Generate a secure JWT secret key
   - Update CORS origins with your domain
   - Configure API URL for frontend

4. **Build and start services**
   ```bash
   cd production
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

5. **Run database migrations**
   ```bash
   cd production
   docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
   ```

## Architecture

The production deployment includes:

- **Frontend**: React app served by Nginx (port 80/443)
- **Backend**: Flask API with Gunicorn (port 5000)
- **Database**: PostgreSQL 15 (port 5432)
- **Cache**: Redis 7 (port 6379)

## Security Features

- Non-root users in containers
- Security headers configured in Nginx
- HTTPS support (configure SSL certificates)
- Environment-based secrets management
- Health checks for all services
- Network isolation between services

## Configuration

### Environment Variables

Key environment variables (see `.env.example`):

- `JWT_SECRET_KEY`: Secret key for JWT tokens (generate a strong random key)
- `DATABASE_URL`: PostgreSQL connection string
- `CORS_ORIGINS`: Allowed origins for CORS
- `VITE_API_URL`: Backend API URL for frontend

### SSL/HTTPS Setup

1. Place SSL certificates in `nginx/ssl/` directory:
   - `cert.pem`: SSL certificate
   - `key.pem`: Private key

2. Update `nginx/nginx.prod.conf` to enable HTTPS configuration

3. Update `VITE_API_URL` to use HTTPS

## Monitoring

### Health Checks

All services include health check endpoints:

- Frontend: `http://localhost/health`
- Backend: `http://localhost:5000/api/health`
- Database: PostgreSQL built-in health check
- Redis: Redis CLI ping check

### Logs

View service logs:
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

## Backup and Restore

### Database Persistence
✅ **Database data persists** through container restarts, updates, and system reboots  
✅ **Stored in Docker volume**: `postgres_data` (survives `docker-compose down`)  
❌ **Data lost only if**: You explicitly delete the volume  

### Automated Backup

Use the provided backup script (run from project root):
```bash
# Create backup
./production/scripts/backup-db.sh

# Create backup in specific directory
./production/scripts/backup-db.sh /path/to/backups
```

### Manual Database Backup

```bash
# Create timestamped backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres personal_finance > backup-$(date +%Y%m%d-%H%M%S).sql

# Compressed backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres personal_finance | gzip > backup-$(date +%Y%m%d-%H%M%S).sql.gz
```

### Database Restore

```bash
# Using restore script (run from project root)
./production/scripts/restore-db.sh ./production/backups/backup-20250626-120000.sql.gz

# Manual restore (run from production folder)
cd production
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres personal_finance < ../backup.sql
```

### Automated Backups (Production)

Add to crontab for daily backups:
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/your/app && ./production/scripts/backup-db.sh /backups/daily
```

### Volume Management

```bash
# List all volumes
docker volume ls

# Inspect volume details
docker volume inspect personal_finance_postgres_data

# Manual volume backup
docker run --rm -v personal_finance_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_volume_backup.tar.gz /data
```

### Redis Backup

Redis data is persisted in the `redis_data` volume:

```bash
# Save Redis data
docker-compose -f docker-compose.prod.yml exec redis redis-cli --pass $REDIS_PASSWORD BGSAVE

# Manual Redis backup
docker-compose -f docker-compose.prod.yml exec redis redis-cli --pass $REDIS_PASSWORD --rdb /data/dump.rdb
```

## Scaling

### Horizontal Scaling

To scale the backend service:
```bash
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

Note: You'll need a load balancer for multiple backend instances.

### Performance Tuning

- Adjust Gunicorn workers in `Dockerfile.prod`: `--workers 4`
- Configure PostgreSQL settings for your workload
- Use Redis for session storage and caching
- Enable CDN for static assets

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check DATABASE_URL in .env
   - Verify PostgreSQL is running: `docker-compose -f docker-compose.prod.yml ps`
   - Check logs: `docker-compose -f docker-compose.prod.yml logs db`

2. **Frontend can't reach backend**
   - Verify VITE_API_URL is correct
   - Check CORS_ORIGINS includes frontend URL
   - Review Nginx proxy configuration

3. **Permission errors**
   - Ensure proper file ownership in volumes
   - Check user permissions in Dockerfiles

### Debug Commands

```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# Execute commands in containers
docker-compose -f docker-compose.prod.yml exec backend /bin/bash

# View environment variables
docker-compose -f docker-compose.prod.yml exec backend env

# Test database connection
docker-compose -f docker-compose.prod.yml exec backend python -c "from src.main import app, db; app.app_context().push(); db.engine.execute('SELECT 1')"
```

## Maintenance

### Updates

1. Pull latest code
2. Review and update .env if needed
3. Rebuild and restart services:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

### Database Migrations

After updates, run migrations:
```bash
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

## Production Checklist

Before going live:

- [ ] Strong passwords set for all services
- [ ] JWT secret key generated and secured
- [ ] CORS origins configured correctly
- [ ] SSL certificates installed (for HTTPS)
- [ ] Database backups configured
- [ ] Monitoring/alerting set up
- [ ] Log aggregation configured
- [ ] Rate limiting enabled
- [ ] Security headers verified
- [ ] Health checks tested