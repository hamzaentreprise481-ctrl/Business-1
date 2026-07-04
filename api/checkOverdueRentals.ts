/**
 * api/checkOverdueRentals.ts
 * ----------------------------
 * Route HTTP exposée par Vercel à l'URL : /api/checkOverdueRentals
 * Pensée pour être appelée automatiquement chaque nuit par un Vercel Cron Job
 * (configuré dans vercel.json), mais peut aussi être testée manuellement en GET.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkOverdueRentals } from '../src/functions/checkOverdueRentals';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const result = await checkOverdueRentals();
    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    console.error('Erreur checkOverdueRentals:', error);
    return res.status(500).json({ success: false, message: error.message || 'Erreur interne du serveur.' });
  }
}
