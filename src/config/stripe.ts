/**
 * Initialisation du client Stripe.
 * Centralisé ici pour ne pas répéter la clé API partout.
 */
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY manquante. Ajoutez-la dans les variables d'environnement Vercel (ou dans .env en local)."
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

// Commission fixe prélevée par la plateforme sur chaque location réussie
export const PLATFORM_COMMISSION = 0.5; // en euros

// Nombre de jours de tolérance avant de considérer une location "en retard"
export const GRACE_PERIOD_DAYS = 2;
