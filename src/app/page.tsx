import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const user = await getCurrentUser();
  
  // Redirect authenticated users to dashboard
  if (user) {
    redirect('/dashboard');
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Employee Training Platform
        </h1>
        <p className="text-center text-lg mb-8">
          A modern platform for managing and tracking employee training and development
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Track Progress</h2>
            <p>Monitor employee training progress and achievements</p>
          </div>
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Manage Courses</h2>
            <p>Create and manage training courses and materials</p>
          </div>
          <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Generate Reports</h2>
            <p>Access detailed reports and analytics</p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Link 
            href="/login" 
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Login to Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
