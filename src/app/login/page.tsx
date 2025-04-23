import { Metadata } from 'next';
import LoginForm from '@/components/forms/login-form';

export const metadata: Metadata = {
  title: 'Login - Employee Training Platform',
  description: 'Login to access the employee training scheduling system',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Employee Training Platform</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your employee ID to access the training scheduling system
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
} 