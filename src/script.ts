import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  const newLink = await prisma.link.create({
    data: {
      description: "Fullstack tutorial on graphql",
      url: "www.howtographql.com"
    }
  });

  const links = await prisma.link.findMany();
  console.log(links);
}

main().catch((error) => { throw error }).finally(async () => {
  await prisma.$disconnect()
});