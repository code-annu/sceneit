import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import ENV from "./env";
import { PrismaClient } from "../generated/prisma/client";

const pool = new pg.Pool({ connectionString: ENV.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export { prisma };
