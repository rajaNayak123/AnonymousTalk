import NextAuth from "next-auth/next";
import { authOption} from "./option";

const handler = NextAuth(authOption);

export {handler as POST, handler as GET};