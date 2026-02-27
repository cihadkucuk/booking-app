import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { CreateClientDto } from "./dto/create-client.dto";

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  listStaff(studioId: string) {
    return this.prisma.staff.findMany({
      where: {
        studioId,
        isActive: true
      },
      select: {
        id: true,
        displayName: true,
        color: true
      },
      orderBy: {
        displayName: "asc"
      }
    });
  }

  listServices(studioId: string) {
    return this.prisma.service.findMany({
      where: {
        studioId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        category: true,
        durationMin: true,
        priceCents: true,
        bufferBeforeMin: true,
        bufferAfterMin: true,
        depositType: true,
        depositValue: true
      },
      orderBy: [{ category: "asc" }, { name: "asc" }]
    });
  }

  listClients(studioId: string, search?: string) {
    return this.prisma.client.findMany({
      where: {
        studioId,
        OR: search
          ? [
              { fullName: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } }
            ]
          : undefined
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true
      },
      orderBy: {
        fullName: "asc"
      },
      take: 50
    });
  }

  createClient(studioId: string, dto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        studioId,
        fullName: dto.fullName,
        phone: dto.phone,
        email: dto.email,
        notes: dto.notes,
        source: "manual"
      }
    });
  }
}

