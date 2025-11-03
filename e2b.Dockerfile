# CoDexa Full-Stack E2B Template
# Includes: Node.js 20, SQLite, PostgreSQL, pre-installed dependencies

FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    sqlite3 \
    postgresql-15 \
    postgresql-client-15 \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create user directory
RUN useradd -m -s /bin/bash user
USER user
WORKDIR /home/user

# Copy template files
COPY --chown=user:user templates/backend /home/user/.templates/backend
COPY --chown=user:user templates/frontend /home/user/.templates/frontend
COPY --chown=user:user templates/process-manager.js /home/user/.templates/process-manager.js
COPY --chown=user:user templates/startup.sh /home/user/.templates/startup.sh

# Pre-install common dependencies to speed up project creation
RUN cd /home/user/.templates/backend && npm install --silent
RUN cd /home/user/.templates/frontend && npm install --silent

# Make startup script executable
RUN chmod +x /home/user/.templates/startup.sh

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3000
ENV BACKEND_PORT=8000

# Expose ports
EXPOSE 3000 8000 5432

CMD ["/bin/bash"]
