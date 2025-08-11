# You can use most Debian-based base images
FROM node:21-slim

# Install curl
RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY compile_page.sh /compile_page.sh
RUN chmod +x /compile_page.sh

# Set working directory
WORKDIR /home/user/nextjs-app

# Create Next.js app
RUN npx --yes create-next-app@15.3.3 . --yes

# Initialize shadcn UI
RUN npx --yes shadcn@2.6.3 init --yes -b neutral --force

# OPTIONAL: Add individual components (instead of all)
# You can replace these with only what you need to keep image light and avoid network issues
RUN npx --yes shadcn@2.6.3 add button input card --yes

# If you really need all components, add retry logic
# RUN until npx --yes shadcn@2.6.3 add --all --yes; do echo "Retrying..."; sleep 5; done

# Move the app to home and clean up
RUN mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app
