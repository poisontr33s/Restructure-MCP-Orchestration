#!/bin/bash

# MCP v2 Infrastructure Backup Script
# Creates backups of PostgreSQL and Redis data

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
BACKUP_DIR="$SCRIPT_DIR/../backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration from environment or defaults
POSTGRES_HOST=${POSTGRES_HOST:-postgres}
POSTGRES_USER=${POSTGRES_USER:-mcp_user}
POSTGRES_DB=${POSTGRES_DB:-mcp_v2}
REDIS_HOST=${REDIS_HOST:-redis}
BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}

echo -e "${GREEN}🔄 Starting MCP v2 Infrastructure Backup${NC}"
echo "========================================"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# PostgreSQL Backup
echo -e "\n${YELLOW}📊 Backing up PostgreSQL...${NC}"
POSTGRES_BACKUP_FILE="$BACKUP_DIR/postgres_${DATE}.sql"

if docker exec mcp-v2-shared-infrastructure-postgres-1 pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$POSTGRES_BACKUP_FILE"; then
    echo -e "${GREEN}✅ PostgreSQL backup completed: $(basename "$POSTGRES_BACKUP_FILE")${NC}"
    
    # Compress the SQL file
    gzip "$POSTGRES_BACKUP_FILE"
    echo -e "${GREEN}🗜️  Compressed to: $(basename "$POSTGRES_BACKUP_FILE").gz${NC}"
else
    echo -e "${RED}❌ PostgreSQL backup failed${NC}"
    exit 1
fi

# Redis Backup
echo -e "\n${YELLOW}📈 Backing up Redis...${NC}"
REDIS_BACKUP_FILE="$BACKUP_DIR/redis_${DATE}.rdb"

# Trigger Redis background save
docker exec mcp-v2-shared-infrastructure-redis-1 redis-cli BGSAVE

# Wait for background save to complete
echo -n "Waiting for Redis BGSAVE to complete"
while true; do
    if docker exec mcp-v2-shared-infrastructure-redis-1 redis-cli LASTSAVE | grep -q "$(docker exec mcp-v2-shared-infrastructure-redis-1 redis-cli LASTSAVE)"; then
        sleep 2
        echo -n "."
        if docker exec mcp-v2-shared-infrastructure-redis-1 redis-cli BGSAVE | grep -q "Background saving started"; then
            continue
        else
            break
        fi
    else
        break
    fi
done
echo ""

# Copy Redis dump file
if docker cp mcp-v2-shared-infrastructure-redis-1:/data/dump.rdb "$REDIS_BACKUP_FILE"; then
    echo -e "${GREEN}✅ Redis backup completed: $(basename "$REDIS_BACKUP_FILE")${NC}"
    
    # Compress the RDB file
    gzip "$REDIS_BACKUP_FILE"
    echo -e "${GREEN}🗜️  Compressed to: $(basename "$REDIS_BACKUP_FILE").gz${NC}"
else
    echo -e "${RED}❌ Redis backup failed${NC}"
    exit 1
fi

# Clean up old backups
echo -e "\n${YELLOW}🧹 Cleaning up old backups (older than $BACKUP_RETENTION_DAYS days)...${NC}"

deleted_count=0
for file in "$BACKUP_DIR"/*.gz; do
    if [[ -f "$file" && $(find "$file" -mtime +$BACKUP_RETENTION_DAYS) ]]; then
        rm "$file"
        echo "Deleted: $(basename "$file")"
        deleted_count=$((deleted_count + 1))
    fi
done

if [[ $deleted_count -eq 0 ]]; then
    echo "No old backups to clean up."
else
    echo -e "${GREEN}🗑️  Deleted $deleted_count old backup files${NC}"
fi

# Backup verification
echo -e "\n${YELLOW}🔍 Verifying backups...${NC}"

# Check PostgreSQL backup
if [[ -f "$POSTGRES_BACKUP_FILE.gz" && -s "$POSTGRES_BACKUP_FILE.gz" ]]; then
    echo -e "${GREEN}✅ PostgreSQL backup verified${NC}"
else
    echo -e "${RED}❌ PostgreSQL backup verification failed${NC}"
    exit 1
fi

# Check Redis backup
if [[ -f "$REDIS_BACKUP_FILE.gz" && -s "$REDIS_BACKUP_FILE.gz" ]]; then
    echo -e "${GREEN}✅ Redis backup verified${NC}"
else
    echo -e "${RED}❌ Redis backup verification failed${NC}"
    exit 1
fi

# Summary
echo -e "\n${GREEN}📋 Backup Summary${NC}"
echo "================="
echo "PostgreSQL: $(basename "$POSTGRES_BACKUP_FILE").gz ($(du -h "$POSTGRES_BACKUP_FILE.gz" | cut -f1))"
echo "Redis: $(basename "$REDIS_BACKUP_FILE").gz ($(du -h "$REDIS_BACKUP_FILE.gz" | cut -f1))"
echo "Location: $BACKUP_DIR"
echo "Retention: $BACKUP_RETENTION_DAYS days"

echo -e "\n${GREEN}🎉 Backup completed successfully!${NC}"
