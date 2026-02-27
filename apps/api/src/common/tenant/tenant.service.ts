import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { TenantContext } from "../request-context";

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveFromHost(host: string | undefined, explicitSlug?: string): Promise<TenantContext | null> {
    let slug: string | undefined;
    const normalizedHost = host?.split(":")[0].toLowerCase();

    if (explicitSlug) {
      slug = explicitSlug.toLowerCase();
    } else if (normalizedHost) {
      const parts = normalizedHost.split(".");
      if (parts.length > 1 && parts[0] !== "www" && normalizedHost.endsWith("localhost")) {
        slug = parts[0];
      }
    }

    const whereCandidates: Array<Record<string, string>> = [];

    if (normalizedHost) {
      whereCandidates.push({ customDomain: normalizedHost });
    }

    if (slug) {
      whereCandidates.push({ slug });
    }

    if (whereCandidates.length === 0) {
      return null;
    }

    const studio = await this.prisma.studio.findFirst({
      where: {
        OR: whereCandidates
      }
    });

    if (!studio) {
      return null;
    }

    return {
      studioId: studio.id,
      studioSlug: studio.slug,
      studioName: studio.name
    };
  }
}
