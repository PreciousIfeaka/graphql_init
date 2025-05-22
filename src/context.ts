import { PrismaClient } from "@prisma/client";
import { decodeJWT } from "./utils/auth";
import {  type IncomingMessage } from "http";

const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient,
  userId?: number
}

export const context = async ({ req }: { req: IncomingMessage }): Promise<Context> => {
  const authHeader = req && req.headers.authorization;

  const jwtPayload = authHeader ? decodeJWT(authHeader?.split(" ")[1]) : null;

  return {
    prisma,
    userId: Number(jwtPayload?.sub)
  }
}