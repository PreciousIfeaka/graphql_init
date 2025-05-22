import jwt, { Secret } from "jsonwebtoken";
import { config } from "dotenv";

config();

export const decodeJWT = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET as Secret);
}