import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function withContext<T>(tenantId: string, studioId: string, fn: (tx: PrismaClient) => Promise<T>) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = '${tenantId}';`);
    await tx.$executeRawUnsafe(`SET LOCAL app.current_studio_id = '${studioId}';`);
    return fn(tx as PrismaClient);
  });
}

async function main() {
  const tenant = await prisma.tenant.create({
    data: { name: "Soul Tattoo Atelier" }
  });

  const studioId = randomUUID();
  const studio = await withContext(tenant.id, studioId, (tx) =>
    tx.studio.create({
      data: {
        id: studioId,
        studioId,
        tenantId: tenant.id,
        name: "Soul Tattoo Atelier",
        timezone: "Europe/Prague",
        currency: "CZK"
      }
    })
  );

  const password = await bcrypt.hash("ChangeMe123!", 10);

  const owner = await withContext(tenant.id, studio.id, (tx) =>
    tx.user.create({
      data: {
        tenantId: tenant.id,
        studioId: studio.id,
        email: "owner@soultattoo.example",
        password,
        name: "Owner"
      }
    })
  );

  await withContext(tenant.id, studio.id, (tx) =>
    tx.studioMember.create({
      data: {
        tenantId: tenant.id,
        studioId: studio.id,
        userId: owner.id,
        role: "OWNER"
      }
    })
  );

  const artist = await withContext(tenant.id, studio.id, (tx) =>
    tx.user.create({
      data: {
        tenantId: tenant.id,
        studioId: studio.id,
        email: "artist@soultattoo.example",
        password,
        name: "Artist"
      }
    })
  );

  await withContext(tenant.id, studio.id, (tx) =>
    tx.studioMember.create({
      data: {
        tenantId: tenant.id,
        studioId: studio.id,
        userId: artist.id,
        role: "ARTIST"
      }
    })
  );

  await withContext(tenant.id, studio.id, (tx) =>
    tx.service.createMany({
      data: [
        {
          tenantId: tenant.id,
          studioId: studio.id,
          name: "Consultation",
          category: "tattoo",
          durationMin: 30,
          bufferBefore: 0,
          bufferAfter: 0,
          priceAmount: 0,
          priceCurrency: "CZK",
          depositAmount: 0
        },
        {
          tenantId: tenant.id,
          studioId: studio.id,
          name: "Session",
          category: "tattoo",
          durationMin: 120,
          bufferBefore: 15,
          bufferAfter: 15,
          priceAmount: 3000,
          priceCurrency: "CZK",
          depositAmount: 1000
        }
      ]
    })
  );

  await withContext(tenant.id, studio.id, (tx) =>
    tx.station.create({
      data: {
        tenantId: tenant.id,
        studioId: studio.id,
        name: "Setup Required"
      }
    })
  );

  await withContext(tenant.id, studio.id, (tx) =>
    tx.featureFlag.createMany({
      data: [
        { tenantId: tenant.id, studioId: studio.id, key: "stripe", enabled: false },
        { tenantId: tenant.id, studioId: studio.id, key: "meta", enabled: false },
        { tenantId: tenant.id, studioId: studio.id, key: "notion", enabled: false },
        { tenantId: tenant.id, studioId: studio.id, key: "ga", enabled: false },
        { tenantId: tenant.id, studioId: studio.id, key: "seo", enabled: false },
        { tenantId: tenant.id, studioId: studio.id, key: "growthAnalytics", enabled: false },
        { tenantId: tenant.id, studioId: studio.id, key: "shoppingList", enabled: false }
      ]
    })
  );

  console.log("Seeded tenant/studio/users/services/station/feature flags");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
