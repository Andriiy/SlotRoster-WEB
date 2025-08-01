import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          SlotRoster
        </h1>
        <p className="text-muted-foreground mb-8">
          Flight Club Management Platform
        </p>
        <div className="space-x-4">
          <Link 
            href="/sign-in" 
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            Sign In
          </Link>
          <Link 
            href="/sign-up" 
            className="inline-block bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary/90"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
} 