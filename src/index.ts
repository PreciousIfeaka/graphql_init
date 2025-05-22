import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { schema } from "./schema";
import { context } from "./context";


export const server  = new ApolloServer({
  schema
});

const port = 5050;

startStandaloneServer(
  server, {
   listen: { port }, 
   context
  }
).then(async ({ url }) => {
  console.log(`Server running on url ${url}`)
}).catch((error) => console.error("Error runnig the server", error))
