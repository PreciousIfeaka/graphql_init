import { objectType } from "nexus";

export const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.int("id"),
    t.nonNull.string("name"),
    t.nonNull.string("email"),
    t.nonNull.DateTime("createdAt"),
    t.list.nonNull.field("links",{
      type: "Link",
      resolve(parent, args, context, info) {
        return context.prisma.user.findUnique({ where: { id: parent.id }}).link()
      }
    })
  },
});