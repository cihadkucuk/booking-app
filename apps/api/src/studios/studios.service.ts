import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";

@Injectable()
export class StudiosService {
  constructor(private readonly prisma: PrismaService) {}

  async getTheme(studioId: string) {
    const studio = await this.prisma.studio.findUnique({
      where: { id: studioId },
      select: {
        id: true,
        slug: true,
        name: true,
        customDomain: true,
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
        theme: true
      }
    });

    if (!studio) {
      throw new NotFoundException("Studio not found");
    }

    return studio;
  }
}

