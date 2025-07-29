'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Plane, Users, Calendar, Shield } from 'lucide-react';
import { getStripeProducts, getStripePrices } from '@/lib/payments/stripe';

interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  metadata: Record<string, string>;
  created: number;
}

interface StripePrice {
  id: string;
  product: string;
  active: boolean;
  currency: string;
  unit_amount: number | null;
  recurring: {
    interval: string;
    interval_count: number;
  } | null;
  metadata: Record<string, string>;
}

interface ProductWithPricing {
  product: StripeProduct;
  prices: StripePrice[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        // Fetch products and prices from API
        const [productsResponse, pricesResponse] = await Promise.all([
          fetch('/api/stripe/products'),
          fetch('/api/stripe/prices')
        ]);

        if (!productsResponse.ok || !pricesResponse.ok) {
          throw new Error('Failed to fetch products');
        }

        const productsData = await productsResponse.json();
        const pricesData = await pricesResponse.json();

        // Group prices by product
        const productsWithPricing = productsData.map((product: StripeProduct) => ({
          product,
          prices: pricesData.filter((price: StripePrice) => price.product === product.id)
        }));

        setProducts(productsWithPricing);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
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
      default:
        return <Check className="h-4 w-4" />;
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

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products & Pricing</h1>
          <p className="text-muted-foreground">
            View available products and pricing plans for your air club.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
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
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground">No products found.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map(({ product, prices }) => (
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
                      {prices.map((price) => (
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

                {/* Metadata */}
                {Object.keys(product.metadata).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Details</h4>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {Object.entries(product.metadata)
                        .filter(([key]) => !['features', 'featured'].includes(key))
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Button className="w-full" variant="outline">
                    View Details
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