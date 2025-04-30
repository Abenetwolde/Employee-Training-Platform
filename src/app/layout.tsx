import type { Metadata } from "next";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/session-provider";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { LogOut, User, Settings, Home, BookOpen, ChartBar } from "lucide-react";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Employee Training Platform",
  description: "A modern platform for employee training and development",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>

      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <SidebarProvider>
        
            <Sidebar>
              <SidebarHeader>
                <div className="flex items-center gap-2 p-4">
                  <BookOpen className="h-6 w-6" />
                  <span className="text-lg font-semibold">Training Platform</span>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                  >
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/groups"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                  >
                    <BookOpen className="h-5 w-5" />
                    <span>Training </span>
                  </Link>
                  <Link
                    href="/swaps"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                  >
                    <ChartBar className="h-5 w-5" />
                    <span>Swaps</span>
                  </Link>
                </SidebarGroup>
              </SidebarContent>
              <SidebarFooter>
                <div className="p-4">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                    {/* <span>{user.name || "Profile"}</span> */}
                  </Link>
                  <Link
                    href="/logout"
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </Link>
                </div>
              </SidebarFooter>
            </Sidebar>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Appbar */}
              <header className="flex h-16 items-center border-b px-4 w-full justify-between">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="h-6" />
                <Menubar>
                  <MenubarMenu>
                    <MenubarTrigger>File</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>
                        <Link href="/dashboard"> Dashboard</Link>
                      </MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>
                        <Link href="/groups">Groups</Link>
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                  <MenubarMenu>
                    <MenubarTrigger>View</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>Toggle Theme</MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm font-medium">name</span>
                  <Settings className="h-5 w-5" />
                </div>
              </header>
              <AuthProvider>
                <main className="min-h-screen bg-background">
                  {children}
                </main>
              </AuthProvider>
            </div>
         
        </SidebarProvider>
        </div>
      </body>
    </html>
  );
}
