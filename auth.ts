import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs";
import {prisma} from "@/utils/prisma";

declare module "next-auth" {
  interface User {
    emailVerified?: Date | null;
    image?: string | null
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  //@ts-ignore
  adapter: PrismaAdapter(prisma),
  session : {
    strategy : "jwt"
  },
  secret : process.env.AUTH_SECRET,
  pages : {
    signIn : "/connexion",
  },
  debug : process.env.NODE_ENV === "development",
  providers : [
    Credentials({
      name : "credentials",
      credentials : {
        email: { label: "Email", type: "email" }, // Add these properties
        password: { label: "Password", type: "password" }
      },
      authorize : async(credentials)=>{
          
          if (!credentials?.email || !credentials?.password) {
              // No user found, so this is their first attempt to login
              // meaning this is also the place you could do registration
              throw new Error("Invalid credential.")

          }

          const user = await prisma.user.findUnique({
            where : {
              // @ts-ignore
              email : credentials.email
            }
          })

          if(!user || !user?.password){
            throw new Error('Email ou Mot de passe incorrect')
          }

          // @ts-ignore
          const isCorrectPass = await bcrypt.compare(credentials.password, user.password);
          if (!isCorrectPass) {
            throw new Error("Invalid email or password.");
          }

          // return user object with the their profile data
          return user
      }
  })
  ],
  callbacks: {
		async session({ token, session, user }) {
			if (token.sub && session.user){
				session.user.id = token.sub,
        session.user.role = token.role
			}
			return session;
		},
		async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role; // Assigne le rôle à l'objet JWT
      }
      return token;
    },
	},
})