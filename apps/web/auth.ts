import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { auth, signIn, signOut, handlers, update } = NextAuth(
  authConfig
) as any;
