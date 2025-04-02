import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOption: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async authorize(credentials: any): Promise<any> {
        await dbConnect();

        console.log("the credentilas", credentials);

        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier }, 
              { username: credentials.identifier }, 
            ],
          }).select("+password");

          if (!user) {
            throw new Error("No User found with this email or username");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your account before login");
          }

          if (!user.password) {
            throw new Error(
              "User password is missing. Try resetting your password."
            );
          }

          console.log("User password:", user.password);
          

          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password.toString());

          if (!isPasswordCorrect) {
            throw new Error("Invalid password");
          }
          return user;
        } catch ( // eslint-disable-next-line @typescript-eslint/no-explicit-any 
        error: any) {
          throw new Error(error.message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessage = user.isAcceptingMessage;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessage = token.isAcceptingMessage;
        session.user.username = token.username;
      }
      return session;
    },
  },

  pages: { signIn: "/sign-in" },

  session: { strategy: "jwt" },

  secret: process.env.NEXTAUTH_SECRET,
};