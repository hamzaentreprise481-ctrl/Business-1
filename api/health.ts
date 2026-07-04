/**
 * api/health.ts
 * -------------
 * Route de test très simple à l'URL : /api/health
 * Permet de vérifier que le déploiement Vercel fonctionne,
 * sans dépendre de Firebase ou Stripe.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    success: true,
    message: 'Le backend fonctionne correctement ✅',
    timestamp: new Date().toISOString(),
  });
}
