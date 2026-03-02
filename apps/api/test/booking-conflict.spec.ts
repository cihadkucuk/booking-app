import { Client } from "pg";
import { randomUUID } from "crypto";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for integration tests");
}

async function seedBasic(client: Client) {
  const tenantId = randomUUID();
  const studioId = randomUUID();
  const userId = randomUUID();
  const clientId = randomUUID();
  const serviceId = randomUUID();
  const stationId = randomUUID();

  await client.query(`INSERT INTO "Tenant" (id, name) VALUES ($1, $2)`, [tenantId, "Test Tenant"]);
  await client.query(`SET app.current_tenant_id = '${tenantId}';`);
  await client.query(`SET app.current_studio_id = '${studioId}';`);
  await client.query(
    `INSERT INTO "Studio" (id, tenantId, studioId, name, timezone, currency) VALUES ($1, $2, $3, $4, $5, $6)`,
    [studioId, tenantId, studioId, "Test Studio", "Europe/Prague", "CZK"]
  );
  await client.query(
    `INSERT INTO "User" (id, tenantId, studioId, email, password, name) VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, tenantId, studioId, `user-${userId}@test.local`, "hashed", "Artist"]
  );
  await client.query(
    `INSERT INTO "StudioMember" (id, tenantId, studioId, userId, role) VALUES ($1, $2, $3, $4, $5)`,
    [randomUUID(), tenantId, studioId, userId, "ARTIST"]
  );
  await client.query(
    `INSERT INTO "Client" (id, tenantId, studioId, name) VALUES ($1, $2, $3, $4)`,
    [clientId, tenantId, studioId, "Client"]
  );
  await client.query(
    `INSERT INTO "Service" (id, tenantId, studioId, name, category, durationMin, bufferBefore, bufferAfter, priceAmount, priceCurrency, depositAmount)
     VALUES ($1, $2, $3, $4, $5, 60, 0, 0, 1000, 'CZK', 0)`,
    [serviceId, tenantId, studioId, "Session", "tattoo"]
  );
  await client.query(
    `INSERT INTO "Station" (id, tenantId, studioId, name) VALUES ($1, $2, $3, $4)`,
    [stationId, tenantId, studioId, "Station 1"]
  );

  return { tenantId, studioId, userId, clientId, serviceId, stationId };
}

async function setContext(client: Client, tenantId: string, studioId: string) {
  await client.query(`SET app.current_tenant_id = '${tenantId}';`);
  await client.query(`SET app.current_studio_id = '${studioId}';`);
}

describe("Booking conflict constraints", () => {
  it("rejects overlapping artist bookings", async () => {
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    const ctx = await seedBasic(client);
    await setContext(client, ctx.tenantId, ctx.studioId);

    const startsAt = new Date("2030-01-01T10:00:00Z");
    const endsAt = new Date("2030-01-01T11:00:00Z");

    const insert = () =>
      client.query(
        `INSERT INTO "Appointment" (id, tenantId, studioId, artistId, clientId, serviceId, status, category, startsAt, endsAt, bufferBefore, bufferAfter, depositDue, currency, createdById)
         VALUES ($1, $2, $3, $4, $5, $6, 'TENTATIVE', 'tattoo', $7, $8, 0, 0, 0, 'CZK', $9)`,
        [randomUUID(), ctx.tenantId, ctx.studioId, ctx.userId, ctx.clientId, ctx.serviceId, startsAt, endsAt, ctx.userId]
      );

    const results = await Promise.allSettled([insert(), insert()]);
    const rejected = results.filter((r) => r.status === "rejected");

    expect(rejected.length).toBe(1);
    await client.end();
  });

  it("rejects overlapping station assignments", async () => {
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    const ctx = await seedBasic(client);
    await setContext(client, ctx.tenantId, ctx.studioId);

    const startsAt = new Date("2030-01-02T10:00:00Z");
    const endsAt = new Date("2030-01-02T11:00:00Z");

    await client.query(
      `INSERT INTO "Appointment" (id, tenantId, studioId, artistId, clientId, serviceId, stationId, status, category, startsAt, endsAt, bufferBefore, bufferAfter, depositDue, currency, createdById)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'TENTATIVE', 'tattoo', $8, $9, 0, 0, 0, 'CZK', $10)`,
      [randomUUID(), ctx.tenantId, ctx.studioId, ctx.userId, ctx.clientId, ctx.serviceId, ctx.stationId, startsAt, endsAt, ctx.userId]
    );

    await expect(
      client.query(
        `INSERT INTO "Appointment" (id, tenantId, studioId, artistId, clientId, serviceId, stationId, status, category, startsAt, endsAt, bufferBefore, bufferAfter, depositDue, currency, createdById)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'TENTATIVE', 'tattoo', $8, $9, 0, 0, 0, 'CZK', $10)`,
        [randomUUID(), ctx.tenantId, ctx.studioId, ctx.userId, ctx.clientId, ctx.serviceId, ctx.stationId, startsAt, endsAt, ctx.userId]
      )
    ).rejects.toBeDefined();

    await client.end();
  });

  it("enforces tenant isolation via RLS", async () => {
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    const ctx1 = await seedBasic(client);
    const ctx2 = await seedBasic(client);

    await setContext(client, ctx1.tenantId, ctx1.studioId);
    const res = await client.query(
      `SELECT * FROM "Appointment" WHERE tenantId = $1`,
      [ctx2.tenantId]
    );

    expect(res.rows.length).toBe(0);
    await client.end();
  });
});
