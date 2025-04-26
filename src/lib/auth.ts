// src/lib/auth.ts (or wherever your getCurrentUser is defined)
import { getServerSession } from "next-auth";
import { authOptions } from "./auth.config";
import { prisma } from "./prisma";


export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  // Fetch the full user data including group
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { currentGroup: true }
  });

  return user;
}