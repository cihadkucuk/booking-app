-- Create enums
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF');
CREATE TYPE "DepositType" AS ENUM ('NONE', 'FIXED', 'PERCENT');
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');
CREATE TYPE "AppointmentSource" AS ENUM ('MANUAL', 'ONLINE', 'INBOX');
CREATE TYPE "ConversationChannel" AS ENUM ('SMS', 'WHATSAPP', 'INSTAGRAM', 'EMAIL', 'STUB');
CREATE TYPE "ConversationStatus" AS ENUM ('OPEN', 'ARCHIVED', 'SPAM');
CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');
CREATE TYPE "MessageStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'RECEIVED');
CREATE TYPE "ShoppingListStatus" AS ENUM ('SUGGESTED', 'APPROVED', 'PURCHASED', 'SKIPPED');

-- Create tables
CREATE TABLE "Studio" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "customDomain" TEXT,
  "logoUrl" TEXT,
  "primaryColor" TEXT NOT NULL DEFAULT '#111827',
  "secondaryColor" TEXT NOT NULL DEFAULT '#F59E0B',
  "theme" JSONB,
  "stripeConnectId" TEXT,
  "emailSenderDomain" TEXT,
  "staffCanViewClientPhone" BOOLEAN NOT NULL DEFAULT true,
  "staffCanViewClientEmail" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Studio_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "studioId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Staff" (
  "id" TEXT NOT NULL,
  "studioId" TEXT NOT NULL,
  "userId" TEXT,
  "displayName" TEXT NOT NULL,
  "color" TEXT DEFAULT '#2563EB',
  "bio" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Client" (
  "id" TEXT NOT NULL,
  "studioId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "source" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Service" (
  "id" TEXT NOT NULL,
  "studioId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT,
  "durationMin" INTEGER NOT NULL,
  "priceCents" INTEGER NOT NULL,
  "bufferBeforeMin" INTEGER NOT NULL DEFAULT 0,
  "bufferAfterMin" INTEGER NOT NULL DEFAULT 0,
  "depositType" "DepositType" NOT NULL DEFAULT 'NONE',
  "depositValue" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StaffService" (
  "staffId" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StaffService_pkey" PRIMARY KEY ("staffId", "serviceId")
);

CREATE TABLE "Appointment" (
  "id" TEXT NOT NULL,
  "studioId" TEXT NOT NULL,
  "staffId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "createdByUserId" TEXT,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
  "source" "AppointmentSource" NOT NULL DEFAULT 'MANUAL',
  "depositAmountCents" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "cancelReason" TEXT,
  "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StaffAvailabilityRule" (
  "id" TEXT NOT NULL,
  "studioId" TEXT NOT NULL,
  "staffId" TEXT NOT NULL,
  "dayOfWeek" INTEGER NOT NULL,
  "startMinute" INTEGER NOT NULL,
  "endMinute" INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StaffAvailabilityRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StaffAvailabilityException" (
  "id" TEXT NOT NULL,
  "studioId" TEXT NOT NULL,
  "staffId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "startMinute" INTEGER,
  "endMinute" INTEGER,
  "isUnavailable" BOOLEAN NOT NULL DEFAULT true,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StaffAvailabilityException_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Conversation" (
  "id" TEXT NOT NULL,
  "studioId" TEXT NOT NULL,
  "clientId" TEXT,
  "channel" "ConversationChannel" NOT NULL,
  "externalThreadId" TEXT,
  "status" "ConversationStatus" NOT NULL DEFAULT 'OPEN',
  "lastMessageAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Message" (
  "id" TEXT NOT NULL,
  "studioId" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "clientId" TEXT,
  "direction" "MessageDirection" NOT NULL,
  "externalMessageId" TEXT,
  "text" TEXT NOT NULL,
  "attachments" JSONB,
  "status" "MessageStatus" NOT NULL DEFAULT 'QUEUED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShoppingTemplateItem" (
  "id" TEXT NOT NULL,
  "studioId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "unit" TEXT,
  "category" TEXT,
  "avgUsagePerService" DECIMAL(10,2),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShoppingTemplateItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShoppingListItem" (
  "id" TEXT NOT NULL,
  "studioId" TEXT NOT NULL,
  "weekStartDate" TIMESTAMP(3) NOT NULL,
  "templateItemId" TEXT,
  "name" TEXT NOT NULL,
  "unit" TEXT,
  "quantitySuggested" DECIMAL(10,2) NOT NULL,
  "quantityManual" DECIMAL(10,2),
  "reason" TEXT,
  "status" "ShoppingListStatus" NOT NULL DEFAULT 'SUGGESTED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShoppingListItem_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "Studio_slug_key" ON "Studio"("slug");
CREATE UNIQUE INDEX "Studio_customDomain_key" ON "Studio"("customDomain");
CREATE UNIQUE INDEX "User_studioId_email_key" ON "User"("studioId", "email");
CREATE UNIQUE INDEX "Staff_userId_key" ON "Staff"("userId");
CREATE UNIQUE INDEX "Conversation_studioId_channel_externalThreadId_key" ON "Conversation"("studioId", "channel", "externalThreadId");

-- Create lookup indexes
CREATE INDEX "User_studioId_role_idx" ON "User"("studioId", "role");
CREATE INDEX "Staff_studioId_isActive_idx" ON "Staff"("studioId", "isActive");
CREATE INDEX "Client_studioId_fullName_idx" ON "Client"("studioId", "fullName");
CREATE INDEX "Client_studioId_phone_idx" ON "Client"("studioId", "phone");
CREATE INDEX "Service_studioId_isActive_idx" ON "Service"("studioId", "isActive");
CREATE INDEX "Appointment_studioId_startAt_idx" ON "Appointment"("studioId", "startAt");
CREATE INDEX "Appointment_studioId_staffId_startAt_idx" ON "Appointment"("studioId", "staffId", "startAt");
CREATE INDEX "Appointment_studioId_clientId_startAt_idx" ON "Appointment"("studioId", "clientId", "startAt");
CREATE INDEX "StaffAvailabilityRule_studioId_staffId_dayOfWeek_idx" ON "StaffAvailabilityRule"("studioId", "staffId", "dayOfWeek");
CREATE INDEX "StaffAvailabilityException_studioId_staffId_date_idx" ON "StaffAvailabilityException"("studioId", "staffId", "date");
CREATE INDEX "Conversation_studioId_status_lastMessageAt_idx" ON "Conversation"("studioId", "status", "lastMessageAt");
CREATE INDEX "Message_studioId_conversationId_createdAt_idx" ON "Message"("studioId", "conversationId", "createdAt");
CREATE INDEX "ShoppingTemplateItem_studioId_isActive_idx" ON "ShoppingTemplateItem"("studioId", "isActive");
CREATE INDEX "ShoppingListItem_studioId_weekStartDate_status_idx" ON "ShoppingListItem"("studioId", "weekStartDate", "status");

-- Foreign keys
ALTER TABLE "User"
  ADD CONSTRAINT "User_studioId_fkey"
  FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Staff"
  ADD CONSTRAINT "Staff_studioId_fkey"
  FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Staff"
  ADD CONSTRAINT "Staff_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Client"
  ADD CONSTRAINT "Client_studioId_fkey"
  FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Service"
  ADD CONSTRAINT "Service_studioId_fkey"
  FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StaffService"
  ADD CONSTRAINT "StaffService_staffId_fkey"
  FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StaffService"
  ADD CONSTRAINT "StaffService_serviceId_fkey"
  FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_studioId_fkey"
  FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_staffId_fkey"
  FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_serviceId_fkey"
  FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "StaffAvailabilityRule"
  ADD CONSTRAINT "StaffAvailabilityRule_studioId_fkey"
  FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StaffAvailabilityRule"
  ADD CONSTRAINT "StaffAvailabilityRule_staffId_fkey"
  FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StaffAvailabilityException"
  ADD CONSTRAINT "StaffAvailabilityException_studioId_fkey"
  FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StaffAvailabilityException"
  ADD CONSTRAINT "StaffAvailabilityException_staffId_fkey"
  FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Conversation"
  ADD CONSTRAINT "Conversation_studioId_fkey"
  FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Conversation"
  ADD CONSTRAINT "Conversation_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Message"
  ADD CONSTRAINT "Message_studioId_fkey"
  FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Message"
  ADD CONSTRAINT "Message_conversationId_fkey"
  FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Message"
  ADD CONSTRAINT "Message_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ShoppingTemplateItem"
  ADD CONSTRAINT "ShoppingTemplateItem_studioId_fkey"
  FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ShoppingListItem"
  ADD CONSTRAINT "ShoppingListItem_studioId_fkey"
  FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ShoppingListItem"
  ADD CONSTRAINT "ShoppingListItem_templateItemId_fkey"
  FOREIGN KEY ("templateItemId") REFERENCES "ShoppingTemplateItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

