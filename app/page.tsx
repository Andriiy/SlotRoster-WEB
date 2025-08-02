import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to the landing page which contains the full SlotRoster application
  redirect('/landing');
} 