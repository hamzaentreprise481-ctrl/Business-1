/**
 * checkOverdueRentals.ts
 * ----------------------
 * Fonction planifiée (à exécuter chaque nuit via un Cron Job Vercel).
 *
 * Logique : cherche toutes les locations "en cours" dont la date de fin est
 * dépassée depuis plus de GRACE_PERIOD_DAYS jours, et prend automatiquement
 * la caution en pénalité de retard.
 */
import { db, FieldValue } from '../config/firebaseAdmin';
import { stripe, GRACE_PERIOD_DAYS } from '../config/stripe';
import { Rental } from '../schemas/types';

export async function checkOverdueRentals() {
  const now = new Date();
  const graceLimit = new Date();
  graceLimit.setDate(now.getDate() - GRACE_PERIOD_DAYS);

  const overdueRentals = await db
    .collection('rentals')
    .where('return_status', '==', 'EN_COURS')
    .where('end_date', '<', graceLimit)
    .get();

  let processedCount = 0;

  for (const doc of overdueRentals.docs) {
    const rental = doc.data() as Rental;

    try {
      await stripe.paymentIntents.capture(rental.deposit_stripe_payment_intent_id);

      await doc.ref.update({
        deposit_status: 'CAPTURED',
        return_status: 'EN_LITIGE',
        updated_at: FieldValue.serverTimestamp(),
      });

      processedCount++;
    } catch (err) {
      console.error(`Erreur lors du traitement de la location ${rental.rental_id} :`, err);
    }
  }

  return { processed: processedCount, total: overdueRentals.size };
}
