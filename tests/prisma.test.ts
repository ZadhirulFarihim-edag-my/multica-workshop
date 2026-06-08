import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/db/prisma";

describe("prisma client", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("connects to the configured sqlite database", async () => {
    await expect(prisma.$connect()).resolves.toBeUndefined();
  });
});
