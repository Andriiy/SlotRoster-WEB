'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import useSWR, { mutate } from 'swr';
import { Suspense, useEffect, useState } from 'react';
import { Loader2, PlusCircle, RefreshCw, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';



const fetcher = (url: string) => fetch(url).then((res) => res.json());



function FlyingCommunitySkeleton() {
  return (
    <div className="space-y-2">
      <div className="border rounded-lg p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-4 w-28 bg-gray-200 rounded"></div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="h-8 w-16 bg-gray-200 rounded ml-4"></div>
        </div>
      </div>
    </div>
  );
}

// Type definition for air clubs
interface AirClub {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  airport: string | null;
  created_at: string;
  description: string | null;
  website: string | null;
  created_by: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_product_id: string | null;
  plan_name: string | null;
  subscription_status: string | null;
}

function FlyingCommunity() {
  const router = useRouter();
  const { data: airClubs, error, isLoading } = useSWR<AirClub[]>('/api/air-clubs', fetcher, {
    revalidateOnMount: true,
    dedupingInterval: 0
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status || 'Unknown'}</Badge>;
    }
  };

  if (error) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Air Clubs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Failed to load air clubs. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !airClubs) {
    return <FlyingCommunitySkeleton />;
  }

  return (
    <div className="space-y-2">
      {airClubs.length > 0 ? (
        airClubs.map((club) => (
          <div key={club.id} className="border border-border rounded-lg p-3 hover:bg-accent/50 transition-colors bg-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold">{club.name}</h3>
                  {getStatusBadge(club.subscription_status)}
                </div>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-card-foreground">Airport:</span>
                          <span className="text-muted-foreground">{club.airport}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-card-foreground">Email:</span>
                          <span className="text-muted-foreground">{club.email}</span>
                        </div>
                        {club.phone && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-card-foreground">Phone:</span>
                            <span className="text-muted-foreground">{club.phone}</span>
                          </div>
                        )}
                        {club.address && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-card-foreground">Address:</span>
                            <span className="text-muted-foreground">{club.address}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-card-foreground">Plan:</span>
                          <span className="text-muted-foreground">{club.plan_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-card-foreground">Created:</span>
                          <span className="text-muted-foreground">{new Date(club.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {club.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {club.description}
                        </p>
                      )}
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/air-club-crud`)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Manage
                </Button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <PlusCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No Air Clubs Yet</h3>
              <p className="text-muted-foreground mb-6">
                Get started by creating your first air club to manage your flying community.
              </p>
              <Button 
                onClick={() => {
                  // Navigate to CRUD page with create mode
                  router.push('/dashboard/air-club-crud?mode=create');
                }}
                className="flex items-center gap-2"
                size="lg"
              >
                <PlusCircle className="h-5 w-5" />
                Create Your First Air Club
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const refreshData = () => {
    mutate('/api/user');
    mutate('/api/flying-community');
  };

  if (!isMounted) {
    return <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Home</h1>
          <p className="text-muted-foreground">
            Manage your air club settings and members.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              // Navigate to CRUD page with create mode
              router.push('/dashboard/air-club-crud?mode=create');
            }}
            size="sm"
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Air Club
          </Button>
          <Button 
            onClick={refreshData} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      <FlyingCommunitySkeleton />
    </div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Home</h1>
          <p className="text-muted-foreground">
            Manage your air club settings and members.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              // Navigate to CRUD page with create mode
              window.location.href = '/dashboard/air-club-crud?mode=create';
            }}
            size="sm"
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Air Club
          </Button>
          <Button 
            onClick={refreshData} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Suspense fallback={<FlyingCommunitySkeleton />}>
        <FlyingCommunity />
      </Suspense>
    </div>
  );
}
