import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        employeeId: { label: "Employee ID", type: "text" },
        groupId: { label: "Group ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.employeeId) {
          throw new Error("Employee ID is required")
        }
        if (!credentials?.groupId) {
          throw new Error("Group ID is required")
        }

        try {
          // 1. Verify group exists
          const group = await prisma.group.findUnique({
            where: { id: credentials.groupId },
            include: { _count: { select: { users: true } } }
          });

          if (!group) throw new Error("Group not found");
          if (group._count.users >= group.maxSize) throw new Error("Group is full");

          // 2. Find or create user
          let user = await prisma.user.findUnique({
            where: { employeeId: credentials.employeeId },
            include: { currentGroup: true }
          });

          if (!user) {
            // Create new user with minimal required fields
            user = await prisma.user.create({
              data: {
                employeeId: credentials.employeeId,
                name: `Employee ${credentials.employeeId}`,
                role: 'employee',
                currentGroup: { connect: { id: credentials.groupId } }
              },
              include: { currentGroup: true }
            });
          } else if (user.groupId !== credentials.groupId) {
            // Update user's group if different
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                currentGroup: { connect: { id: credentials.groupId } }
              },
              include: { currentGroup: true }
            });
          }

          return {
            id: user.id,
            name: user.name,
            email: user.employeeId,
            role: user.role,
            groupId: user.groupId,
            group: user.currentGroup
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error(
            error instanceof Error ? error.message : "Authentication failed"
          );
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Make sure to include the user ID
        token.role = user.role;
        token.employeeId = user.email;
        token.groupId = user.groupId;
        token.group = user.group;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string; // Include ID in session
        session.user.role = token.role as string;
        session.user.employeeId = token.employeeId as string;
        session.user.groupId = token.groupId as string;
        session.user.group = token.group as {
          id: string;
          name: string;
          startDate: Date;
          endDate: Date;
        };
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  events: {
    async signOut({ token }) {
      // Clean up database session if you're storing sessions in DB
      try {
        await prisma.session.deleteMany({
          where: {
            userId: token.id as string
          }
        });
      } catch (error) {
        console.error("Error cleaning up sessions:", error);
      }
    }
  }
};
// Enhanced logout function
export async function logout() {
  // Add any additional cleanup logic here
  return {
    redirect: '/login',
    destroy: true,
    clearCookies: true
  };
}