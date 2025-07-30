'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, CreditCard, Info, Building2, Calendar, DollarSign, UserCheck } from 'lucide-react';

// Club page with segmented button selector
export default function ClubPage() {
  const [activeSection, setActiveSection] = useState<'info' | 'subscription' | 'members'>('info');

  // Mock data - replace with actual data from your API
  const clubData = {
    name: 'Skyward Aviation Club',
    airport: 'KLAX - Los Angeles International',
    address: '123 Aviation Way, Los Angeles, CA 90210',
    phone: '+1 (555) 123-4567',
    email: 'info@skywardaviation.com',
    website: 'https://skywardaviation.com',
    description: 'Premier aviation club offering flight training, aircraft rental, and community events.',
    subscription: {
      plan: 'Premium',
      status: 'Active',
      nextBilling: '2024-02-15',
      amount: '$299/month',
      features: ['Unlimited aircraft access', 'Priority booking', 'Training discounts', '24/7 support']
    },
    members: [
      { id: 1, name: 'John Smith', role: 'Admin', email: 'john@example.com', joinDate: '2023-01-15', status: 'Active' },
      { id: 2, name: 'Sarah Johnson', role: 'Pilot', email: 'sarah@example.com', joinDate: '2023-03-20', status: 'Active' },
      { id: 3, name: 'Mike Davis', role: 'Student', email: 'mike@example.com', joinDate: '2023-06-10', status: 'Active' },
      { id: 4, name: 'Lisa Wilson', role: 'Instructor', email: 'lisa@example.com', joinDate: '2023-02-05', status: 'Active' }
    ]
  };

  // Segmented button selector component
  const SegmentedSelector = () => (
    <div className="flex bg-muted rounded-lg p-1 mb-6">
      <Button
        variant={activeSection === 'info' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveSection('info')}
        className="flex-1"
      >
        <Info className="h-4 w-4 mr-2" />
        Club Info
      </Button>
      <Button
        variant={activeSection === 'subscription' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveSection('subscription')}
        className="flex-1"
      >
        <CreditCard className="h-4 w-4 mr-2" />
        Subscription
      </Button>
      <Button
        variant={activeSection === 'members' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setActiveSection('members')}
        className="flex-1"
      >
        <Users className="h-4 w-4 mr-2" />
        Members
      </Button>
    </div>
  );

  // Club Info Section
  const ClubInfoSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Club Information
          </CardTitle>
          <CardDescription>Manage your club's basic information and contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Club Name</label>
              <p className="text-lg font-semibold">{clubData.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Airport</label>
              <p className="text-lg">{clubData.airport}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <p className="text-base">{clubData.address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="text-base">{clubData.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-base">{clubData.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Website</label>
              <p className="text-base">
                <a href={clubData.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  {clubData.website}
                </a>
              </p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="text-base mt-1">{clubData.description}</p>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline">Edit Information</Button>
            <Button variant="outline">View Website</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Subscription Section
  const SubscriptionSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Details
          </CardTitle>
          <CardDescription>Manage your club's subscription and billing information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Plan</label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="default" className="text-sm">
                    {clubData.subscription.plan}
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    {clubData.subscription.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Monthly Amount</label>
                <p className="text-2xl font-bold text-green-600">{clubData.subscription.amount}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Next Billing Date</label>
                <p className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(clubData.subscription.nextBilling).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Plan Features</label>
              <ul className="mt-2 space-y-2">
                {clubData.subscription.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline">Change Plan</Button>
            <Button variant="outline">View Billing History</Button>
            <Button variant="outline">Update Payment Method</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Members Section
  const MembersSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Club Members
          </CardTitle>
          <CardDescription>Manage your club's members and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {clubData.members.length} members total
              </p>
              <Button size="sm">Invite Member</Button>
            </div>
            <div className="space-y-3">
              {clubData.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{member.role}</Badge>
                    <Badge variant="secondary">{member.status}</Badge>
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(member.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Club Management</h1>
        <p className="text-muted-foreground">
          Manage your aviation club's information, subscription, and members
        </p>
      </div>

      <SegmentedSelector />

      {activeSection === 'info' && <ClubInfoSection />}
      {activeSection === 'subscription' && <SubscriptionSection />}
      {activeSection === 'members' && <MembersSection />}
    </div>
  );
} 