import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";
import { asNexusMethod } from "nexus";
import { DateTimeResolver } from "graphql-scalars";
import { faker } from "@faker-js/faker";

export const GQLDate = asNexusMethod(DateTimeResolver, "DateTime");

// Create a Link type for nexus to generate its schema
export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.int("id"),
    t.nonNull.string("description"),
    t.nonNull.string("url"),
    t.nonNull.DateTime("createdAt")
    t.field("postedBy", {
      type: "User",
      async resolve(parent, args, context, info) {
        return await context.prisma.link.findUnique({ where: { id: parent.id }}).postedBy();
      }
    })
  },
});


// Creating a query schema and resolver for getting a link by ID using 'link' as the root field
export const LinkQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("link", {
      type: "Link",
      args: {
        id: nonNull(intArg()),
      },
      async resolve(parent, args, context, info) {
        return await context.prisma.link.findFirst({ where: { id: args.id }});
      }
    })
  },
});

export const LinkMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("post", {
      type: "Link",
      args: {
        url: nonNull(stringArg()),
        description: nonNull(stringArg())
      },
      async resolve(parent, args, context, info) {
        const { url, description } = args;
        const { prisma, userId } = context;

        if (!userId) throw new Error("Unauthorized user");

        for(let i = 0; i < 20; i++) {
          const url = faker.internet.url();;
          const description = faker.lorem.sentences();

          await context.prisma.link.create({
            data: {
              url,
              description,
              postedBy: { connect: { id: userId }}
            }
          });
        }

        return await prisma.link.create({
          data: {
            url,
            description,
            postedBy: { connect: { id: userId }}
          }
        });
      }
    })
  },
})

export const UpdateLinkQuery = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("put", {
      type: "Link",
      args: {
        id: nonNull(intArg()),
        url: stringArg(),
        description: stringArg(),
      },
      async resolve(parent, args, context, info) {
        await context.prisma.link.update({
          where: { id: args.id },
          data: {
            url: args.url ?? undefined,
            description: args.description ?? undefined
          }
        });

        const updatedLink = await context.prisma.link.findFirst({ where: { id: args.id } });

        if (!updatedLink) throw new Error("Link not found after update");

        return updatedLink;
      }
    })
  },
});

export const DeleteLinkQuery = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("delete", {
      type: "Link",
      args: {
        id: nonNull(intArg())
      },
      async resolve(parent, args, context, info) {
        return await context.prisma.link.delete({ where: { id: args.id } });
      }
    })
  },
})

// Creating a query schema and resolver for getting all links using 'feed' as the root field
export const LinksQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      type: "Link",
      args: { 
        filter: stringArg(),
        page: intArg(),
        take: intArg()
      },
      async resolve(parent, args, context, info) {
        const where = args.filter ? {
          OR: [
            { description: { contains: args.filter } },
            { url: { contains: args.filter } }
          ]
        } : {}
        return await context.prisma.link.findMany({
          where,
          take: args?.take as number | undefined,
          skip: ((Number(args?.page) - 1) * Number(args?.take)) as number | undefined
        });
      }
    })
  },
})