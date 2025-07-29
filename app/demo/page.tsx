import { redirect } from 'next/navigation';

export default function DemoPage() {
  // Redirect demo users to the dashboard to showcase the features
  redirect('/dashboard');
} 