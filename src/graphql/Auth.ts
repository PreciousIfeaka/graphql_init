import *  as bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";
import { extendType, nonNull, objectType, stringArg } from "nexus";
import { faker } from "@faker-js/faker";

export const AuthPayload = objectType({
  name: "AuthPayload",
  definition(t) {
    t.nonNull.string("token"),
    t.nonNull.field("user", {
      type: "User"
    });
  },
});

export const signUp = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("signup", {
      type: "AuthPayload",
      args: {
        name: nonNull(stringArg()),
        email: nonNull(stringArg()),
        password: nonNull(stringArg())
      },
      async resolve(parent, args, context, info) {
        const { name, email, password } = args;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await context.prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword
          }
        });

        const token = jwt.sign(
          { sub: user.id }, 
          process.env.JWT_SECRET as Secret, 
          { expiresIn: `${Number(process.env.JWT_EXPIRY)}H` }
        );

        return {
          user,
          token
        }
      }
    });
  },
});

export const signIn = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("login", {
      type: "AuthPayload",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg())
      },
      async resolve(parent, args, context, info) {
        const { email, password } = args;

        const user = await context.prisma.user.findUnique({ where: { email }});
        if (!user) throw new Error("User not found");

        const isPasswordMatch: boolean = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) throw new Error("Invalid password");

        const token = jwt.sign(
          { sub: user.id }, 
          process.env.JWT_SECRET as Secret, 
          { expiresIn: `${Number(process.env.JWT_EXPIRY)}H` }
        )

        return {
          user,
          token
        }
      }
    })
  },
})