import { link } from "fs";
import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";

export const Vote = objectType({
  name: "Vote",
  definition(t) {
    t.nonNull.field("link", { type: "Link" }),
    t.nonNull.field("voter", { type: "User" })
  },
})

export const VoteMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("vote", {
      type: "Vote",
      args: {
        linkId: nonNull(intArg())
      },
      async resolve(parent, args, context, info) {
        const user = await context.prisma.user.findUnique({ where: { id: context.userId }});
        if (!user) throw new Error("User has to be logged in");

        const link = await context.prisma.link.update({
          where: { id: args.linkId },
          data: {
            voters: { connect: { id: context.userId }}
          }
        });

        return {
          link,
          voter: user
        }
      }
    });
  },
})