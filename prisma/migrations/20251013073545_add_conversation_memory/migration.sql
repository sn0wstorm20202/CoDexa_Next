-- CreateTable
CREATE TABLE "public"."ConversationMemory" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "lastContext" TEXT,
    "currentTask" TEXT,
    "domainInfo" JSONB,
    "recentMessages" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationMemory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConversationMemory_projectId_key" ON "public"."ConversationMemory"("projectId");

-- AddForeignKey
ALTER TABLE "public"."ConversationMemory" ADD CONSTRAINT "ConversationMemory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
