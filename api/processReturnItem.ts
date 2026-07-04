/**
 * api/processReturnItem.ts
 * -------------------------
 * Route HTTP exposée par Vercel à l'URL : /api/processReturnItem
 * Appelée en POST par l'employé du magasin quand un article est rapporté.
 *
 * Exemple de corps de requête (JSON) :
 * {
 *   "rentalId": "rnt_001",
 *   "isDamaged": false
 * }
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processReturnItem } from '../src/functions/processReturnItem';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Méthode non autorisée. Utilisez POST.' });
  }

  try {
    const { rentalId, isDamaged } = req.body;

    if (!rentalId || typeof isDamaged !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Champs manquants ou invalides : rentalId (string) et isDamaged (boolean) sont requis.',
      });
    }

    const result = await processReturnItem(rentalId, isDamaged);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Erreur processReturnItem:', error);
    return res.status(500).json({ success: false, message: error.message || 'Erreur interne du serveur.' });
  }
}
