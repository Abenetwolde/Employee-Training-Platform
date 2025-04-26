import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      employeeId: string
      groupId?: string
      group?: {
        id: string
        name: string
        startDate: Date
        endDate: Date
        maxSize: number
      }
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    employeeId: string
    groupId?: string
    group?: {
      id: string
      name: string
      startDate: Date
      endDate: Date
      maxSize: number
    }
  }
}