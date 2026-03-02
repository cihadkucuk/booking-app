import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(name: string) {
    return this.prisma.tenant.create({ data: { name } });
  }

  async list() {
    return this.prisma.tenant.findMany();
  }
}
