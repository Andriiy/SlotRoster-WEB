'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { withAirClub } from '@/lib/auth/middleware';

export const checkoutAction = withAirClub(async (formData, airClub) => {
  const priceId = formData.get('priceId') as string;
  await createCheckoutSession({ airClub: airClub, priceId });
});

export const customerPortalAction = withAirClub(async (_, airClub) => {
  const portalSession = await createCustomerPortalSession(airClub);
  redirect(portalSession.url);
});
