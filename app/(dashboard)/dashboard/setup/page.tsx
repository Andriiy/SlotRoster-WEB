'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleIcon } from 'lucide-react';

export default function SetupPage() {
  const [clubName, setClubName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClub = async () => {
    if (!clubName.trim()) return;
    
    setIsCreating(true);
    // TODO: Implement club creation logic
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CircleIcon className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Welcome to Flight Club!</CardTitle>
          <CardDescription>
            To complete your setup, you need to create or join an air club.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="clubName">Air Club Name</Label>
            <Input
              id="clubName"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder="Enter your air club name"
              className="mt-1 border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <Button 
            onClick={handleCreateClub}
            disabled={!clubName.trim() || isCreating}
            className="w-full"
          >
            {isCreating ? 'Creating...' : 'Create Air Club'}
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Or{' '}
              <Button variant="link" className="p-0 h-auto">
                join an existing club
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 