import { AppointmentSource, AppointmentStatus, ConversationChannel, MessageDirection, MessageStatus, PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function withMinutes(base: Date, mins: number): Date {
  const next = new Date(base);
  next.setMinutes(next.getMinutes() + mins);
  return next;
}

async function main(): Promise<void> {
  await prisma.studio.deleteMany();

  const passwordHash = await bcrypt.hash("owner123", 10);
  const staffPasswordHash = await bcrypt.hash("staff123", 10);

  const studio = await prisma.studio.create({
    data: {
      slug: "inkhouse",
      name: "Ink House Studio",
      customDomain: "inkhouse.localhost",
      logoUrl: "https://placehold.co/200x80?text=Ink+House",
      primaryColor: "#0F172A",
      secondaryColor: "#F97316",
      stripeConnectId: "acct_test_inkhouse",
      emailSenderDomain: "mail.inkhouse.example",
      theme: {
        fontHeading: "Space Grotesk",
        fontBody: "Manrope",
        calendarDensity: "comfortable"
      },
      users: {
        create: [
          {
            email: "owner@inkhouse.test",
            passwordHash,
            fullName: "Studio Owner",
            role: UserRole.OWNER
          },
          {
            email: "manager@inkhouse.test",
            passwordHash,
            fullName: "Studio Manager",
            role: UserRole.MANAGER
          },
          {
            email: "maya@inkhouse.test",
            passwordHash: staffPasswordHash,
            fullName: "Maya Artist",
            role: UserRole.STAFF
          },
          {
            email: "leo@inkhouse.test",
            passwordHash: staffPasswordHash,
            fullName: "Leo Barber",
            role: UserRole.STAFF
          }
        ]
      }
    },
    include: {
      users: true
    }
  });

  const mayaUser = studio.users.find((user) => user.email === "maya@inkhouse.test");
  const leoUser = studio.users.find((user) => user.email === "leo@inkhouse.test");
  const ownerUser = studio.users.find((user) => user.email === "owner@inkhouse.test");

  if (!mayaUser || !leoUser || !ownerUser) {
    throw new Error("Seed users were not created.");
  }

  const [mayaStaff, leoStaff] = await Promise.all([
    prisma.staff.create({
      data: {
        studioId: studio.id,
        userId: mayaUser.id,
        displayName: "Maya Artist",
        color: "#E11D48",
        bio: "Fine-line tattoo specialist"
      }
    }),
    prisma.staff.create({
      data: {
        studioId: studio.id,
        userId: leoUser.id,
        displayName: "Leo Barber",
        color: "#0284C7",
        bio: "Fade and beard grooming"
      }
    })
  ]);

  const [tattooService, barberService, lashService] = await Promise.all([
    prisma.service.create({
      data: {
        studioId: studio.id,
        name: "Fine-line Tattoo Session",
        category: "Tattoo",
        durationMin: 120,
        priceCents: 25000,
        bufferBeforeMin: 15,
        bufferAfterMin: 20,
        depositType: "PERCENT",
        depositValue: 30
      }
    }),
    prisma.service.create({
      data: {
        studioId: studio.id,
        name: "Skin Fade + Beard Trim",
        category: "Barber",
        durationMin: 60,
        priceCents: 6500,
        bufferBeforeMin: 10,
        bufferAfterMin: 10,
        depositType: "FIXED",
        depositValue: 1500
      }
    }),
    prisma.service.create({
      data: {
        studioId: studio.id,
        name: "Lash Refill",
        category: "Lash",
        durationMin: 75,
        priceCents: 9000,
        bufferBeforeMin: 5,
        bufferAfterMin: 10,
        depositType: "NONE",
        depositValue: 0
      }
    })
  ]);

  await prisma.staffService.createMany({
    data: [
      { staffId: mayaStaff.id, serviceId: tattooService.id },
      { staffId: mayaStaff.id, serviceId: lashService.id },
      { staffId: leoStaff.id, serviceId: barberService.id }
    ],
    skipDuplicates: true
  });

  const clients = await prisma.client.createManyAndReturn({
    data: [
      {
        studioId: studio.id,
        fullName: "Alicia Stone",
        phone: "+1-555-111-2222",
        email: "alicia@example.com",
        source: "booking"
      },
      {
        studioId: studio.id,
        fullName: "Ruben Miles",
        phone: "+1-555-111-3333",
        email: "ruben@example.com",
        source: "inbox"
      },
      {
        studioId: studio.id,
        fullName: "Sana Brooks",
        phone: "+1-555-111-4444",
        email: "sana@example.com",
        source: "manual"
      }
    ]
  });

  const today = new Date();
  today.setSeconds(0, 0);
  today.setHours(9, 0, 0, 0);

  await prisma.appointment.createMany({
    data: [
      {
        studioId: studio.id,
        staffId: mayaStaff.id,
        clientId: clients[0].id,
        serviceId: tattooService.id,
        createdByUserId: ownerUser.id,
        startAt: withMinutes(today, 60),
        endAt: withMinutes(today, 180),
        status: AppointmentStatus.CONFIRMED,
        source: AppointmentSource.MANUAL,
        depositAmountCents: 7500,
        notes: "Initial sleeve consult"
      },
      {
        studioId: studio.id,
        staffId: leoStaff.id,
        clientId: clients[1].id,
        serviceId: barberService.id,
        createdByUserId: ownerUser.id,
        startAt: withMinutes(today, 120),
        endAt: withMinutes(today, 180),
        status: AppointmentStatus.PENDING,
        source: AppointmentSource.ONLINE,
        depositAmountCents: 1500
      },
      {
        studioId: studio.id,
        staffId: mayaStaff.id,
        clientId: clients[2].id,
        serviceId: lashService.id,
        createdByUserId: ownerUser.id,
        startAt: withMinutes(today, 300),
        endAt: withMinutes(today, 375),
        status: AppointmentStatus.CONFIRMED,
        source: AppointmentSource.INBOX,
        depositAmountCents: 0
      }
    ]
  });

  const mondayToFriday = [1, 2, 3, 4, 5].flatMap((day) => [
    {
      studioId: studio.id,
      staffId: mayaStaff.id,
      dayOfWeek: day,
      startMinute: 10 * 60,
      endMinute: 19 * 60
    },
    {
      studioId: studio.id,
      staffId: leoStaff.id,
      dayOfWeek: day,
      startMinute: 9 * 60,
      endMinute: 17 * 60
    }
  ]);

  await prisma.staffAvailabilityRule.createMany({
    data: mondayToFriday
  });

  const nextMonday = new Date(today);
  const dayOffset = (8 - nextMonday.getDay()) % 7 || 7;
  nextMonday.setDate(nextMonday.getDate() + dayOffset);
  nextMonday.setHours(0, 0, 0, 0);

  await prisma.shoppingTemplateItem.createMany({
    data: [
      {
        studioId: studio.id,
        name: "Black Nitrile Gloves",
        unit: "box",
        category: "Hygiene",
        avgUsagePerService: "0.20"
      },
      {
        studioId: studio.id,
        name: "Tattoo Ink - Black",
        unit: "bottle",
        category: "Tattoo",
        avgUsagePerService: "0.08"
      },
      {
        studioId: studio.id,
        name: "Disposable Razor",
        unit: "pack",
        category: "Barber",
        avgUsagePerService: "0.15"
      }
    ]
  });

  const conversation = await prisma.conversation.create({
    data: {
      studioId: studio.id,
      clientId: clients[1].id,
      channel: ConversationChannel.STUB,
      externalThreadId: "stub-ruben-1",
      status: "OPEN",
      lastMessageAt: new Date()
    }
  });

  await prisma.message.createMany({
    data: [
      {
        studioId: studio.id,
        conversationId: conversation.id,
        clientId: clients[1].id,
        direction: MessageDirection.INBOUND,
        text: "Hi, can I move my appointment to Friday?",
        status: MessageStatus.RECEIVED
      },
      {
        studioId: studio.id,
        conversationId: conversation.id,
        clientId: clients[1].id,
        direction: MessageDirection.OUTBOUND,
        text: "Sure, send me your preferred time and I will check.",
        status: MessageStatus.SENT
      }
    ]
  });

  await prisma.shoppingListItem.create({
    data: {
      studioId: studio.id,
      weekStartDate: nextMonday,
      name: "Black Nitrile Gloves",
      unit: "box",
      quantitySuggested: "2.00",
      reason: "Seeded suggestion for upcoming appointments"
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

