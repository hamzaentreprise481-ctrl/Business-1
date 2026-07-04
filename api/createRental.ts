/**
 * api/createRental.ts
 * --------------------
 * Route HTTP exposée par Vercel à l'URL : /api/createRental
 * Appelée en POST depuis l'application mobile quand l'utilisateur loue un article.
 *
 * Exemple de corps de requête (JSON) :
 * {
 *   "userId": "usr_001",
 *   "itemId": "itm_001",
 *   "durationDays": 3,
 *   "stripePaymentMethodId": "pm_xxx"
 * }
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRental } from '../src/functions/createRental';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // On n'accepte que les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée. Utilisez POST.' });
  }

  try {
    const { userId, itemId, durationDays, stripePaymentMethodId } = req.body;

    // Vérification simple que tous les champs nécessaires sont présents
    if (!userId || !itemId || !durationDays || !stripePaymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'Champs manquants : userId, itemId, durationDays, stripePaymentMethodId sont requis.',
      });
    }

    const result = await createRental(userId, itemId, durationDays, stripePaymentMethodId);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Erreur createRental:', error);
    return res.status(500).json({ success: false, message: error.message || 'Erreur interne du serveur.' });
  }
}
