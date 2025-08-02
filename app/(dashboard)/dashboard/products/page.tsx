'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Plane, Users, Calendar, Shield, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAirClub } from '@/lib/contexts/AirClubContext';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  aircraftLimit: number;
  popular?: boolean;
  trialDays: number;
}

const predefinedPlans: PricingPlan[] = [
  {
    id: 'single-aircraft',
    name: 'Single Aircraft',
    price: '€5',
    description: 'Perfect for individual pilots or small operations',
    features: [
      '1 Aircraft Management',
      'Basic Scheduling',
      'Member Management',
      'Email Support',
      '1 Month Free Trial'
    ],
    aircraftLimit: 1,
    trialDays: 30
  },
  {
    id: 'small-fleet',
    name: 'Small Fleet',
    price: '€15',
    description: 'Ideal for small flying clubs and schools',
    features: [
      '3 Aircraft Management',
      'Advanced Scheduling'
    ],
    aircraftLimit: 3,
    popular: true,
    trialDays: 30
  },
  {
    id: 'medium-fleet',
    name: 'Medium Fleet',
    price: '€25',
    description: 'Perfect for growing aviation businesses',
    features: [
      '5 Aircraft Management',
      'Advanced Scheduling',
      'Member Management',
      'Priority Support',
      '1 Month Free Trial'
    ],
    aircraftLimit: 5,
    trialDays: 30
  },
  {
    id: 'large-fleet',
    name: 'Large Fleet',
    price: '€35',
    description: 'For established aviation operations',
    features: [
      '7 Aircraft Management',
      'Advanced Scheduling',
      'Member Management',
      'Priority Support',
      '1 Month Free Trial'
    ],
    aircraftLimit: 7,
    trialDays: 30
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '€50',
    description: 'For large aviation organizations',
    features: [
      'Unlimited Aircraft',
      'Advanced Scheduling',
      'Member Management',
      'Priority Support',
      '1 Month Free Trial'
    ],
    aircraftLimit: 999,
    trialDays: 30
  }
];

export default function ProductsPage() {
  const router = useRouter();
  const { selectedAirClub } = useAirClub();
  const [loading, setLoading] = useState(true);
  const [stripeProducts, setStripeProducts] = useState<any[]>([]);
  const [useStripeProducts, setUseStripeProducts] = useState(false);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);

        // Try to fetch Stripe products
        const [productsResponse, pricesResponse] = await Promise.all([
          fetch('/api/stripe/products'),
          fetch('/api/stripe/prices')
        ]);

        if (productsResponse.ok && pricesResponse.ok) {
          const productsData = await productsResponse.json();
          const pricesData = await pricesResponse.json();

          console.log('Products data:', productsData);
          console.log('Prices data:', pricesData);

          if (productsData.length > 0 && pricesData.length > 0) {
            // Filter products that have features metadata (our pricing plans)
            const validProducts = productsData.filter((product: any) => 
              product.metadata && product.metadata.features
            );

            console.log('Valid products with features:', validProducts);

            if (validProducts.length > 0) {
              // Group prices by product
              const productsWithPricing = validProducts.map((product: any) => ({
                product,
                prices: pricesData.filter((price: any) => 
                  // Handle both string ID and expanded product object
                  (typeof price.product === 'string' && price.product === product.id) ||
                  (typeof price.product === 'object' && price.product.id === product.id)
                )
              }));

              console.log('Products with pricing:', productsWithPricing);
              console.log('Setting useStripeProducts to true');
              setStripeProducts(productsWithPricing);
              setUseStripeProducts(true);
            } else {
              console.log('No valid products with features found, using fallback');
              setUseStripeProducts(false);
            }
          } else {
            console.log('No products or prices found, using fallback');
            setUseStripeProducts(false);
          }
        } else {
          console.log('API responses not ok, using fallback');
          console.log('Products response:', productsResponse.status);
          console.log('Prices response:', pricesResponse.status);
          setUseStripeProducts(false);
        }
      } catch (err) {
        console.error('Error fetching Stripe products:', err);
        // Fall back to predefined plans
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const formatPrice = (amount: number | null, currency: string) => {
    if (!amount) return 'Contact us';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature.toLowerCase()) {
      case 'fleet':
      case 'aircraft':
        return <Plane className="h-4 w-4" />;
      case 'members':
      case 'users':
        return <Users className="h-4 w-4" />;
      case 'booking':
      case 'scheduling':
        return <Calendar className="h-4 w-4" />;
      case 'safety':
      case 'compliance':
        return <Shield className="h-4 w-4" />;
      case 'trial':
        return <Crown className="h-4 w-4" />;
      default:
        return <Check className="h-4 w-4" />;
    }
  };

  const handleSubscribe = async (product: any, prices: any[]) => {
    if (!selectedAirClub) {
      alert('Please select an air club first');
      return;
    }

    if (prices.length === 0) {
      alert('No pricing available for this plan');
      return;
    }

    try {
      setSubscribing(product.id);
      
      // Use the first price (usually the monthly price)
      const priceId = prices[0].id;
      
      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          airClubId: selectedAirClub.id,
          planName: product.name,
          aircraftLimit: product.metadata?.aircraft_limit || 1
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = url;
      
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Failed to start subscription process. Please try again.');
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products & Pricing</h1>
          <p className="text-muted-foreground">
            View available products and pricing plans for your air club.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Products & Pricing</h1>
        <p className="text-muted-foreground">
          View available products and pricing plans for your air club.
        </p>
        {!selectedAirClub && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ Please select an air club from the dropdown to subscribe to a plan.
            </p>
          </div>
        )}
      </div>

      {useStripeProducts ? (
        // Show Stripe products if available
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stripeProducts.map(({ product, prices }) => {
            console.log(`Product ${product.name}:`, product);
            console.log(`Prices for ${product.name}:`, prices);
            return (
            <Card key={product.id} className="relative">
              {product.metadata.featured === 'true' && (
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                  <Star className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {product.name}
                  {!product.active && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {product.description || 'No description available'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pricing */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Pricing</h4>
                  {prices.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No pricing available</p>
                  ) : (
                    <div className="space-y-1">
                      {prices.map((price: any) => (
                        <div key={price.id} className="flex justify-between items-center text-sm">
                          <span>
                            {price.recurring ? (
                              `${price.recurring.interval_count} ${price.recurring.interval}${price.recurring.interval_count > 1 ? 's' : ''}`
                            ) : (
                              'One-time'
                            )}
                          </span>
                          <span className="font-medium">
                            {formatPrice(price.unit_amount, price.currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Features */}
                {product.metadata.features && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Features</h4>
                    <div className="space-y-1">
                      {product.metadata.features.split(',').map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {getFeatureIcon(feature.trim())}
                          <span>{feature.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleSubscribe(product, prices)}
                    disabled={subscribing === product.id}
                  >
                    {subscribing === product.id ? 'Processing...' : 'Subscribe'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
          })}
        </div>
      ) : (
        // Show predefined plans as fallback
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {predefinedPlans.map((plan) => (
            <Card key={plan.id} className="relative">
              {plan.popular && (
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {plan.name}
                </CardTitle>
                <CardDescription>
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pricing */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Pricing</h4>
                  <div className="flex justify-between items-center text-sm">
                    <span>Monthly</span>
                    <span className="font-medium text-lg">{plan.price}/month</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Features</h4>
                  <div className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {getFeatureIcon(feature)}
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Aircraft Limit */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Aircraft Limit</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Plane className="h-4 w-4" />
                    <span>
                      {plan.aircraftLimit === 999 ? 'Unlimited' : `${plan.aircraftLimit} aircraft`}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => {
                      if (!selectedAirClub) {
                        alert('Please select an air club first');
                        return;
                      }
                      alert('This plan is not yet available for subscription. Please contact support.');
                    }}
                  >
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 