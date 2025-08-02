'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, CreditCard, Info, Building2, Calendar, DollarSign, UserCheck, AlertCircle } from 'lucide-react';
import { useAirClub } from '@/lib/contexts/AirClubContext';
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
};

// Club page with segmented button selector
export default function ClubPage() {
  const [activeSection, setActiveSection] = useState<'info' | 'subscription'>('info');
  const { selectedAirClub, airClubs } = useAirClub();

  // Fetch trial status for the selected air club
  const { data: trialData } = useSWR(
    selectedAirClub ? `/api/trial?airClubId=${selectedAirClub.id}` : null,
    fetcher
  );

  // Fetch aircraft for the selected air club
  const { data: aircraftData } = useSWR(
    selectedAirClub ? `/api/aircrafts?airClubId=${selectedAirClub.id}` : null,
    fetcher
  );

  // Show loading state if no air club is selected
  if (!selectedAirClub) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Club Management</h1>
          <p className="text-muted-foreground">
            Please select an air club from the dropdown to view its information
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Air Club Selected</h3>
              <p className="text-muted-foreground mb-4">
                Please select an air club from the dropdown menu to view its details.
              </p>
              <Button asChild>
                <a href="/dashboard/air-club-crud?mode=create">Create Your First Air Club</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <p className="text-lg font-semibold">{selectedAirClub.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Airport</label>
              <p className="text-lg">{selectedAirClub.airport || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="flex items-center gap-2">
                <Badge variant={selectedAirClub.is_trial_active ? 'default' : 'secondary'}>
                  {selectedAirClub.is_trial_active ? 'Trial Active' : selectedAirClub.subscription_status || 'Inactive'}
                </Badge>
                {selectedAirClub.is_trial_active && trialData && (
                  <Badge variant="outline">
                    {trialData.trialDaysRemaining} days left
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Plan</label>
              <p className="text-base">{selectedAirClub.plan_name || 'No plan selected'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Aircraft Count</label>
              <p className="text-base">{aircraftData?.length || 0} aircraft</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-base">
                {selectedAirClub.created_at ? new Date(selectedAirClub.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" asChild>
              <a href={`/dashboard/air-club-crud?mode=edit&id=${selectedAirClub.id}`}>
                Edit Information
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/dashboard/air-club-crud?mode=create">
                Create Another Air Club
              </a>
            </Button>
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
                    {selectedAirClub.plan_name || 'No Plan'}
                  </Badge>
                  <Badge variant={selectedAirClub.is_trial_active ? 'default' : 'secondary'} className="text-sm">
                    {selectedAirClub.is_trial_active ? 'Trial' : selectedAirClub.subscription_status || 'Inactive'}
                  </Badge>
                </div>
              </div>
              {selectedAirClub.is_trial_active && trialData && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Trial Status</label>
                  <p className="text-2xl font-bold text-green-600">
                    {trialData.trialDaysRemaining} days remaining
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Aircraft Limit</label>
                <p className="text-base">
                  {selectedAirClub.is_trial_active ? 'Unlimited (Trial)' : 
                   selectedAirClub.plan_name === 'Single Aircraft' ? '1 aircraft' :
                   selectedAirClub.plan_name === 'Small Fleet' ? '3 aircraft' :
                   selectedAirClub.plan_name === 'Medium Fleet' ? '5 aircraft' :
                   selectedAirClub.plan_name === 'Large Fleet' ? '7 aircraft' :
                   selectedAirClub.plan_name === 'Unlimited' ? 'Unlimited' : 'Not specified'}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Current Usage</label>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Aircraft Count:</span>
                  <span className="text-sm font-medium">{aircraftData?.length || 0}</span>
                </div>
                {selectedAirClub.is_trial_active && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Can Add More:</span>
                    <span className="text-sm font-medium text-green-600">
                      {trialData?.canAddAircraft ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" asChild>
              <a href="/dashboard/products">Change Plan</a>
            </Button>
            {selectedAirClub.is_trial_active && (
              <Button variant="outline" asChild>
                <a href="/dashboard/products">Upgrade Now</a>
              </Button>
            )}
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
          Managing: <strong>{selectedAirClub.name}</strong>
          {selectedAirClub.airport && ` at ${selectedAirClub.airport}`}
        </p>
      </div>

      <SegmentedSelector />

      {activeSection === 'info' && <ClubInfoSection />}
      {activeSection === 'subscription' && <SubscriptionSection />}
    </div>
  );
} 