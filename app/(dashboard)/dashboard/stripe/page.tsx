'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Package, DollarSign, Calendar, CheckCircle, AlertCircle, Loader2, Plane, ArrowUpDown, X } from 'lucide-react';
import { useAirClub } from '@/lib/contexts/AirClubContext';
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
};

interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  created: number;
  updated: number;
  metadata: Record<string, any>;
  images: string[];
  package_dimensions: any;
  shippable: boolean;
  statement_descriptor: string | null;
  tax_code: string | null;
  unit_label: string | null;
  url: string | null;
}

interface StripePrice {
  id: string;
  product: string;
  active: boolean;
  currency: string;
  unit_amount: number;
  unit_amount_decimal: string;
  recurring: {
    interval: string;
    interval_count: number;
    usage_type: string;
  } | null;
  type: string;
  created: number;
  livemode: boolean;
  metadata: Record<string, any>;
  nickname: string | null;
  product_data: any;
  tiers: any;
  tiers_mode: any;
  transform_quantity: any;
}

interface StripeProductWithPrices extends StripeProduct {
  prices: StripePrice[];
}

export default function StripePage() {
  const { selectedAirClub } = useAirClub();
  const [isLoading, setIsLoading] = useState(false);
  const [stripeProducts, setStripeProducts] = useState<StripeProductWithPrices[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [selectedAircraft, setSelectedAircraft] = useState<number>(1);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  // Check URL parameters for success/cancel messages
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setSuccessMessage('Subscription completed successfully!');
    }
    if (urlParams.get('canceled') === 'true') {
      setCancelMessage('Subscription was canceled.');
    }
  }, []);

  // Fetch Stripe products and prices
  const { data: stripeData, error: stripeError, mutate } = useSWR(
    selectedAirClub ? '/api/stripe/products' : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      onError: (err) => {
        console.error('Stripe fetch error:', err);
        setError('Failed to fetch Stripe products');
      }
    }
  );

  // Fetch current subscription
  const { data: subscriptionData } = useSWR(
    selectedAirClub ? `/api/stripe/subscription?airClubId=${selectedAirClub.id}` : null,
    fetcher
  );

  useEffect(() => {
    if (stripeData) {
      setStripeProducts(stripeData.products || []);
      setError(null);
    }
  }, [stripeData]);

  useEffect(() => {
    if (subscriptionData) {
      setCurrentSubscription(subscriptionData.subscription);
    }
  }, [subscriptionData]);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRecurringText = (price: StripePrice) => {
    if (!price.recurring) return 'One-time';
    
    const { interval, interval_count } = price.recurring;
    if (interval_count === 1) {
      return `Per ${interval}`;
    }
    return `Every ${interval_count} ${interval}s`;
  };

  const handleSubscribe = async (priceId: string, productType: string) => {
    try {
      console.log('Subscribing to:', priceId, 'aircraft:', selectedAircraft);
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          quantity: 1,
          airClubId: selectedAirClub?.id,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/dashboard/stripe?canceled=true`,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
        alert(`Subscription error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpgrade = async (newPriceId: string) => {
    try {
      console.log('Upgrading subscription to:', newPriceId);
      
      const response = await fetch('/api/stripe/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPriceId: newPriceId,
          airClubId: selectedAirClub?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Subscription upgraded successfully!');
        mutate(); // Refresh data
      } else {
        alert(`Upgrade error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const showUpgradeOptions = () => {
    if (!currentSubscription || !stripeProducts.length) return;

    const currentAircraftCount = parseInt(currentSubscription.metadata?.aircraftCount || '1');
    const currentType = currentSubscription.metadata?.type || 'monthly';
    
    // Find available upgrade options
    const upgradeOptions: Array<{
      priceId: string;
      aircraftCount: number;
      type: string;
      totalPrice: number;
      unitPrice: number;
      description: string;
    }> = [];
    
    stripeProducts.forEach(product => {
      const productType = product.metadata.type;
      product.prices.forEach(price => {
        const priceAircraftCount = parseInt(price.metadata?.aircraft_count || '1');
        
        // Show options for more aircraft or different plan type
        if (priceAircraftCount > currentAircraftCount || productType !== currentType) {
          const unitPrice = productType === 'yearly' ? 50 : 5;
          const totalPrice = unitPrice * priceAircraftCount;
          
          upgradeOptions.push({
            priceId: price.id,
            aircraftCount: priceAircraftCount,
            type: productType,
            totalPrice: totalPrice,
            unitPrice: unitPrice,
            description: `${priceAircraftCount} Aircraft - ${productType === 'monthly' ? 'Monthly' : 'Yearly'} Plan`
          });
        }
      });
    });

    if (upgradeOptions.length === 0) {
      alert('No upgrade options available');
      return;
    }

    // Show upgrade options
    const optionText = upgradeOptions.map(option => 
      `${option.description}: ${formatPrice(option.totalPrice * 100, 'eur')}`
    ).join('\n');
    
    const selectedOption = prompt(
      `Available upgrade options:\n\n${optionText}\n\nEnter the number of the option you want (1-${upgradeOptions.length}):`
    );
    
    const optionIndex = parseInt(selectedOption || '0') - 1;
    if (optionIndex >= 0 && optionIndex < upgradeOptions.length) {
      handleUpgrade(upgradeOptions[optionIndex].priceId);
    }
  };

  const handleUnsubscribe = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      console.log('Canceling subscription');
      
      const response = await fetch('/api/stripe/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          airClubId: selectedAirClub?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Subscription canceled successfully!');
        mutate(); // Refresh data
      } else {
        alert(`Cancel error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (!selectedAirClub) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aircraft Subscriptions</h1>
          <p className="text-muted-foreground">
            Please select an air club from the dropdown to view subscription options
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Air Club Selected</h3>
              <p className="text-muted-foreground">
                Please select an air club from the dropdown menu to view subscription options.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Aircraft Subscriptions</h1>
        <p className="text-muted-foreground">
          Choose your subscription plan for: <strong>{selectedAirClub.name}</strong>
        </p>
      </div>

      {/* Aircraft Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Number of Aircraft
          </CardTitle>
          <CardDescription>
            Select how many aircraft you want to manage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label htmlFor="aircraft-select" className="text-sm font-medium">
              Aircraft Count:
            </label>
            <select
              id="aircraft-select"
              value={selectedAircraft}
              onChange={(e) => setSelectedAircraft(parseInt(e.target.value))}
              className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
            <span className="text-sm text-muted-foreground">
              aircraft{selectedAircraft > 1 ? 's' : ''}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Current Subscription */}
      {currentSubscription && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-blue-700">
                {currentSubscription.metadata?.aircraft_count || '1'} Aircraft - {currentSubscription.metadata?.type === 'monthly' ? 'Monthly' : 'Yearly'}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={showUpgradeOptions}
                  className="flex items-center gap-1"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  Upgrade
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleUnsubscribe}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
        <Button
          onClick={() => mutate()}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="h-4 w-4" />
          )}
          Refresh Products
        </Button>
      </div>

      {/* Success/Cancel Messages */}
      {successMessage && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-2 py-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-600">{successMessage}</p>
          </CardContent>
        </Card>
      )}
      {cancelMessage && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-2 py-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-600">{cancelMessage}</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-2 py-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {!stripeData && !error && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Loading subscription options...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      {stripeProducts.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {stripeProducts.map((product) => {
            const productType = product.metadata.type;
            const isYearly = productType === 'yearly';
            const unitPrice = isYearly ? 50 : 5;
            const totalPrice = unitPrice * selectedAircraft;
            
            return (
              <Card key={product.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {product.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {product.description}
                      </CardDescription>
                      {isYearly && (
                        <Badge variant="secondary" className="mt-2">
                          Save 17%
                        </Badge>
                      )}
                    </div>
                    <Badge variant={product.active ? "default" : "secondary"}>
                      {product.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Pricing Display */}
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">
                      {formatPrice(totalPrice * 100, 'eur')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      for {selectedAircraft} aircraft{selectedAircraft > 1 ? 's' : ''} per {productType}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatPrice(unitPrice * 100, 'eur')} per aircraft
                    </div>
                  </div>

                  {/* Subscribe Button */}
                  <Button
                    onClick={() => {
                      const price = product.prices.find(p => 
                        p.metadata.aircraft_count === selectedAircraft.toString()
                      );
                      if (price) {
                        handleSubscribe(price.id, productType);
                      } else {
                        alert('Price not found for selected aircraft count');
                      }
                    }}
                    className="w-full"
                    variant="default"
                    disabled={!product.active}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Subscribe to {productType === 'monthly' ? 'Monthly' : 'Yearly'} Plan
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {stripeProducts.length === 0 && !error && stripeData && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Subscription Plans Found</h3>
              <p className="text-muted-foreground mb-4">
                No subscription plans are currently available.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 