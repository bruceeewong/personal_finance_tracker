# Production Deployment

This folder contains all production-related files for the Personal Finance application.

## 📁 **Folder Structure**

```
production/
├── README.md                    # This file
├── DEPLOYMENT.md               # Detailed deployment guide
├── docker-compose.prod.yml     # Production Docker Compose
├── .env.example               # Environment variables template
├── backend.Dockerfile.prod    # Backend production Dockerfile
├── frontend.Dockerfile.prod   # Frontend production Dockerfile
├── docker-entrypoint.sh      # Frontend nginx entrypoint
├── .dockerignore             # Docker ignore patterns
├── config/
│   └── nginx.prod.conf       # Production nginx configuration
├── scripts/
│   ├── backup-db.sh         # Database backup script
│   └── restore-db.sh        # Database restore script
├── backups/                 # Database backup storage
└── logs/                   # Application logs (when mounted)
```

## 🚀 **Quick Start**

1. **Set up environment**:
   ```bash
   cd production
   cp .env.example ../.env
   # Edit ../.env with your production values
   ```

2. **Deploy application**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

3. **Create database backup**:
   ```bash
   cd ..  # Go back to project root
   ./production/scripts/backup-db.sh
   ```

## 🔧 **Key Features**

- **Multi-stage Docker builds** for optimized image sizes
- **PostgreSQL database** with persistent volume storage
- **Redis caching** for session management
- **Nginx reverse proxy** with security headers
- **Health checks** for all services
- **Automated backup scripts** with compression
- **Environment-based configuration**

## 📋 **Usage Commands**

All commands should be run from the project root directory:

```bash
# Deploy production
cd production && docker-compose -f docker-compose.prod.yml up -d --build

# View logs
cd production && docker-compose -f docker-compose.prod.yml logs -f

# Create backup
./production/scripts/backup-db.sh

# Restore from backup
./production/scripts/restore-db.sh ./production/backups/backup-file.sql.gz

# Stop services
cd production && docker-compose -f docker-compose.prod.yml down

# Scale backend
cd production && docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## 📚 **Documentation**

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[.env.example](./.env.example)** - Environment variables reference
- **[Scripts README](./scripts/)** - Backup and maintenance scripts

## 🔒 **Security**

- Non-root users in all containers
- Security headers configured
- CORS properly configured for production
- Environment variable based secrets
- Health checks and restart policies

## 💾 **Data Persistence**

- Database data persists in `postgres_data` Docker volume
- Redis data persists in `redis_data` Docker volume
- Backups stored in `./backups/` directory
- Data survives container restarts and updates