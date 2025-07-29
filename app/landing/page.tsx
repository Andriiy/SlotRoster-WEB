'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Plane, Users, Calendar, Shield, ArrowRight, Star, Phone, Mail, MapPin, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUserClient, signOutClient, getSessionClient, supabase } from '@/lib/auth-client';

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function checkUser() {
      try {
        setLoading(true);
        
        console.log('Checking user authentication...');
        console.log('Current URL:', window.location.href);
        console.log('Search params:', Object.fromEntries(searchParams.entries()));
        
        // Check both user and session to ensure we have complete auth state
        const [userData, sessionData] = await Promise.all([
          getCurrentUserClient(),
          getSessionClient()
        ]);

        console.log('User data:', userData);
        console.log('Session data:', sessionData);

        // Set user if we have either user data or session data
        if (userData || sessionData) {
          const finalUser = userData || sessionData?.user;
          console.log('Setting user:', finalUser);
          setUser(finalUser);
        } else {
          console.log('No user or session found, setting user to null');
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('Auth state changed:', event, session);
        if (session?.user) {
          console.log('Setting user from auth state change:', session.user);
          setUser(session.user);
        } else {
          console.log('Clearing user from auth state change');
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [searchParams]);

  async function handleSignOut() {
    try {
      await signOutClient();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering landing page with user:', user);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Plane className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">SlotRoster</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              {user ? (
                <div className="flex items-center space-x-2">
                  <Button asChild>
                    <Link href="/dashboard">Home</Link>
                  </Button>
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950/20 dark:via-background dark:to-blue-950/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              ✈️ Aviation Club Management Platform
            </Badge>
            <h1 className="text-4xl font-bold text-foreground tracking-tight sm:text-5xl md:text-6xl mb-6">
              Streamline Your
              <span className="block text-primary">Air Club Operations</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              The complete aviation club management platform for fleet, members, and bookings. 
              Built for pilots, by pilots.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button size="lg" asChild className="text-lg">
                  <Link href="/dashboard">
                    Go to Home
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" asChild className="text-lg">
                  <Link href="/sign-up">
                    Start Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
              <Button size="lg" variant="outline" asChild className="text-lg">
                <Link href="/demo">View Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need to Manage Your Air Club
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From fleet management to member bookings, SlotRoster has all the tools you need
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Plane className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Fleet Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Add aircraft with registration, type, seats, and engine specifications. Track availability and maintenance schedules.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Member Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Invite members, manage roles and permissions, and keep track of pilot qualifications and certifications.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Smart Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Calendar-based slot booking with real-time availability tracking and automatic conflict detection.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Safety & Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track maintenance schedules, pilot qualifications, and ensure regulatory compliance for your operations.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How SlotRoster Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Get started in minutes, not days
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Create Your Club</h3>
              <p className="text-muted-foreground">Sign up and set up your aviation club profile in minutes</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Add Your Fleet</h3>
              <p className="text-muted-foreground">Register your aircraft with specifications and availability</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Start Booking</h3>
              <p className="text-muted-foreground">Invite members and start managing bookings immediately</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Aircraft-Based Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Pay only for the aircraft you manage. Start free with 1 aircraft!
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-6">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plane className="h-4 w-4 mr-2" />
                  Free
                </CardTitle>
                <div className="text-2xl font-bold text-foreground">€0<span className="text-sm text-muted-foreground">/month</span></div>
                <CardDescription>1 Aircraft</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">1 aircraft management</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Basic scheduling tools</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Member management</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Email support</span>
                  </div>
                </div>
                <Button className="w-full text-sm" asChild>
                  <Link href="/sign-up">Start Free</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Small Fleet Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plane className="h-4 w-4 mr-2" />
                  Small Fleet
                </CardTitle>
                <div className="text-2xl font-bold text-foreground">€15<span className="text-sm text-muted-foreground">/month</span></div>
                <CardDescription>3 Aircraft</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Up to 3 aircraft</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Advanced scheduling</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Priority support</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Analytics dashboard</span>
                  </div>
                </div>
                <Button className="w-full text-sm" asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Medium Fleet Plan */}
            <Card className="border-primary relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plane className="h-4 w-4 mr-2" />
                  Medium Fleet
                </CardTitle>
                <div className="text-2xl font-bold text-foreground">€25<span className="text-sm text-muted-foreground">/month</span></div>
                <CardDescription>5 Aircraft</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Up to 5 aircraft</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Unlimited members</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Custom integrations</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Flying Community management</span>
                  </div>
                </div>
                <Button className="w-full text-sm" asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Large Fleet Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plane className="h-4 w-4 mr-2" />
                  Large Fleet
                </CardTitle>
                <div className="text-2xl font-bold text-foreground">€35<span className="text-sm text-muted-foreground">/month</span></div>
                <CardDescription>7 Aircraft</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Up to 7 aircraft</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Advanced security</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Dedicated support</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">API access</span>
                  </div>
                </div>
                <Button className="w-full text-sm" asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Unlimited Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plane className="h-4 w-4 mr-2" />
                  Unlimited
                </CardTitle>
                <div className="text-2xl font-bold text-foreground">€50<span className="text-sm text-muted-foreground">/month</span></div>
                <CardDescription>Unlimited Aircraft</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Unlimited aircraft</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">White-label options</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Custom branding</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Enterprise features</span>
                  </div>
                </div>
                <Button className="w-full text-sm" asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Trusted by Air Clubs Worldwide
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our customers have to say
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                </div>
                <p className="text-muted-foreground mb-4">
                  "SlotRoster transformed how we manage our fleet. The booking system is intuitive and our members love the mobile app."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <Plane className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Sarah Johnson</div>
                    <div className="text-sm text-muted-foreground">Flight Instructor, Skyward Aviation</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                </div>
                <p className="text-muted-foreground mb-4">
                  "The maintenance tracking feature is a game-changer. We never miss a scheduled inspection anymore."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Mike Chen</div>
                    <div className="text-sm text-muted-foreground">Chief Pilot, Blue Skies Club</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                </div>
                <p className="text-muted-foreground mb-4">
                  "Setting up our club was incredibly easy. The pricing model is fair and the support team is responsive."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">David Rodriguez</div>
                    <div className="text-sm text-muted-foreground">Club President, Eagle Flight Club</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about SlotRoster
            </p>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                How does the aircraft-based pricing work?
              </h3>
              <p className="text-muted-foreground">
                You pay based on the number of aircraft you manage. Start free with 1 aircraft, then upgrade as your fleet grows.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Can I try SlotRoster before committing?
              </h3>
              <p className="text-muted-foreground">
                Yes! Start with our free tier that includes 1 aircraft. You can upgrade anytime as your needs grow.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                What features are included in the free plan?
              </h3>
              <p className="text-muted-foreground">
                The free plan includes 1 aircraft management, basic scheduling tools, member management, and email support.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Is my data secure?
              </h3>
              <p className="text-muted-foreground">
                Absolutely. We use enterprise-grade security with encrypted data transmission and secure cloud storage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your Air Club?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of air clubs already using SlotRoster to streamline their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" asChild className="text-lg">
                <Link href="/dashboard">
                  Go to Home
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" asChild className="text-lg">
                <Link href="/sign-up">
                  Start Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
            <Button size="lg" variant="outline" asChild className="text-lg">
              <Link href="/demo">View Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Plane className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-foreground">SlotRoster</span>
              </div>
              <p className="text-muted-foreground">
                The complete aviation club management platform for modern air clubs.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <div className="space-y-2">
                <Link href="#features" className="block text-muted-foreground hover:text-foreground">Features</Link>
                <Link href="#pricing" className="block text-muted-foreground hover:text-foreground">Pricing</Link>
                <Link href="/demo" className="block text-muted-foreground hover:text-foreground">Demo</Link>
                <Link href="/sign-up" className="block text-muted-foreground hover:text-foreground">Sign Up</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <div className="space-y-2">
                <Link href="#contact" className="block text-muted-foreground hover:text-foreground">Contact</Link>
                <Link href="/sign-in" className="block text-muted-foreground hover:text-foreground">Sign In</Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground">Documentation</Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground">Help Center</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Contact</h3>
              <div className="space-y-2">
                <div className="flex items-center text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>support@slotroster.com</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Aviation Way, Sky City</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 SlotRoster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 