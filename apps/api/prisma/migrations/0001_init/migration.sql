-- Initial schema + RLS + exclusion constraints
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

CREATE TABLE IF NOT EXISTS "Tenant" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Studio" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL,
  "name" text NOT NULL,
  "timezone" text NOT NULL DEFAULT 'Europe/Prague',
  "currency" text NOT NULL DEFAULT 'CZK',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("studioId")
);

CREATE TABLE IF NOT EXISTS "User" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "email" text NOT NULL UNIQUE,
  "password" text NOT NULL,
  "name" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "StudioMember" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "role" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Service" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "category" text NOT NULL,
  "durationMin" integer NOT NULL,
  "bufferBefore" integer NOT NULL,
  "bufferAfter" integer NOT NULL,
  "priceAmount" integer NOT NULL,
  "priceCurrency" text NOT NULL,
  "depositAmount" integer,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "AvailabilitySchedule" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "artistId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "dayOfWeek" integer NOT NULL,
  "startTime" text NOT NULL,
  "endTime" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "TimeOff" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "artistId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "startsAt" timestamptz NOT NULL,
  "endsAt" timestamptz NOT NULL,
  "reason" text,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Station" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Client" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "email" text,
  "phone" text,
  "notes" text,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Appointment" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "artistId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "clientId" uuid NOT NULL REFERENCES "Client"("id") ON DELETE CASCADE,
  "serviceId" uuid NOT NULL REFERENCES "Service"("id") ON DELETE CASCADE,
  "stationId" uuid REFERENCES "Station"("id") ON DELETE SET NULL,
  "status" text NOT NULL,
  "category" text NOT NULL,
  "startsAt" timestamptz NOT NULL,
  "endsAt" timestamptz NOT NULL,
  "bufferBefore" integer NOT NULL,
  "bufferAfter" integer NOT NULL,
  "depositDue" integer NOT NULL,
  "currency" text NOT NULL,
  "notes" text,
  "createdById" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Payment" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "appointmentId" uuid NOT NULL REFERENCES "Appointment"("id") ON DELETE CASCADE,
  "amount" integer NOT NULL,
  "currency" text NOT NULL,
  "status" text NOT NULL,
  "provider" text NOT NULL,
  "providerEventId" text,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "PaymentEvent" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "provider" text NOT NULL,
  "eventId" text NOT NULL,
  "receivedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("provider", "eventId")
);

CREATE TABLE IF NOT EXISTS "Conversation" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "clientId" uuid,
  "channel" text NOT NULL,
  "subject" text,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Message" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "conversationId" uuid NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE,
  "senderName" text NOT NULL,
  "senderHandle" text,
  "body" text NOT NULL,
  "externalId" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("externalId")
);

CREATE TABLE IF NOT EXISTS "InternalNote" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "conversationId" uuid NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE,
  "authorId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "body" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Assignment" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "conversationId" uuid NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE,
  "assigneeId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Tag" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("studioId", "name")
);

CREATE TABLE IF NOT EXISTS "ConversationTag" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "conversationId" uuid NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE,
  "tagId" uuid NOT NULL REFERENCES "Tag"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "FeatureFlag" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "key" text NOT NULL,
  "enabled" boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("studioId", "key")
);

CREATE TABLE IF NOT EXISTS "Expense" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "amount" integer NOT NULL,
  "currency" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "RevenueSnapshot" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "artistId" uuid,
  "category" text,
  "amount" integer NOT NULL,
  "currency" text NOT NULL,
  "period" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "MetaAccountSnapshot" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "accountId" text NOT NULL,
  "metric" text NOT NULL,
  "value" integer NOT NULL,
  "capturedAt" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS "MetaMediaSnapshot" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "mediaId" text NOT NULL,
  "metric" text NOT NULL,
  "value" integer NOT NULL,
  "capturedAt" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS "MetaAdSnapshot" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "adId" text NOT NULL,
  "metric" text NOT NULL,
  "value" integer NOT NULL,
  "capturedAt" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS "GaSnapshot" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "propertyId" text NOT NULL,
  "metric" text NOT NULL,
  "value" integer NOT NULL,
  "capturedAt" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS "SeoCheck" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "domain" text NOT NULL,
  "score" integer NOT NULL,
  "report" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "studioId" uuid NOT NULL REFERENCES "Studio"("id") ON DELETE CASCADE,
  "entity" text NOT NULL,
  "entityId" uuid NOT NULL,
  "action" text NOT NULL,
  "payload" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

-- Exclusion constraints for booking conflicts
ALTER TABLE "Appointment"
  ADD CONSTRAINT appointment_artist_no_overlap
  EXCLUDE USING gist (
    "tenantId" WITH =,
    "artistId" WITH =,
    tstzrange(
      "startsAt" - ("bufferBefore" || ' minutes')::interval,
      "endsAt" + ("bufferAfter" || ' minutes')::interval,
      '[)'
    ) WITH &&
  )
  WHERE ("status" <> 'CANCELLED');

ALTER TABLE "Appointment"
  ADD CONSTRAINT appointment_station_no_overlap
  EXCLUDE USING gist (
    "tenantId" WITH =,
    "stationId" WITH =,
    tstzrange(
      "startsAt" - ("bufferBefore" || ' minutes')::interval,
      "endsAt" + ("bufferAfter" || ' minutes')::interval,
      '[)'
    ) WITH &&
  )
  WHERE ("stationId" IS NOT NULL AND "status" <> 'CANCELLED');

-- RLS helpers
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::uuid;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION current_studio_id() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('app.current_studio_id', true), '')::uuid;
$$ LANGUAGE sql STABLE;

-- Enable RLS and policies
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'Studio',
    'User',
    'StudioMember',
    'Service',
    'AvailabilitySchedule',
    'TimeOff',
    'Station',
    'Client',
    'Appointment',
    'Payment',
    'PaymentEvent',
    'Conversation',
    'Message',
    'InternalNote',
    'Assignment',
    'Tag',
    'ConversationTag',
    'FeatureFlag',
    'Expense',
    'RevenueSnapshot',
    'MetaAccountSnapshot',
    'MetaMediaSnapshot',
    'MetaAdSnapshot',
    'GaSnapshot',
    'SeoCheck',
    'AuditLog'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY tenant_isolation_%I ON %I USING ("tenantId" = current_tenant_id() AND "studioId" = current_studio_id())', t, t);
  END LOOP;
END $$;
