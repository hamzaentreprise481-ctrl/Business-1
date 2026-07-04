/**
 * processReturnItem.ts
 * --------------------
 * Se déclenche quand un vêtement est rapporté au magasin.
 *
 * Logique en 2 branches :
 * - Si dégradé  -> on encaisse la caution, l'article est détruit/perdu.
 * - Si OK       -> on libère la caution, on décrémente le cycle de vie de
 *                  l'article, on calcule la commission plateforme, et si
 *                  le compteur atteint 0, l'article passe en vente déstockage.
 */
import { db, FieldValue } from '../config/firebaseAdmin';
import { stripe, PLATFORM_COMMISSION } from '../config/stripe';
import { Item, Rental } from '../schemas/types';

export async function processReturnItem(rentalId: string, isDamaged: boolean) {
  const rentalRef = db.collection('rentals').doc(rentalId);
  const rentalSnap = await rentalRef.get();

  if (!rentalSnap.exists) {
    throw new Error(`Location ${rentalId} introuvable`);
  }

  const rental = rentalSnap.data() as Rental;

  // Garde-fou d'idempotence : si cette location a déjà été traitée
  // (retry réseau, double clic support), on ne refait rien.
  if (rental.return_status !== 'EN_COURS') {
    return {
      success: false,
      message: `Cette location a déjà été traitée (statut actuel : ${rental.return_status}).`,
    };
  }

  const itemRef = db.collection('items').doc(rental.item_id);
  const itemSnap = await itemRef.get();
  const item = itemSnap.data() as Item;

  return db.runTransaction(async (tx) => {
    if (isDamaged) {
      // --- CAS 1 : ARTICLE ENDOMMAGÉ ---
      await stripe.paymentIntents.capture(rental.deposit_stripe_payment_intent_id);

      tx.update(itemRef, {
        status: 'DETRUIT_PERDU',
        updated_at: FieldValue.serverTimestamp(),
      });

      tx.update(rentalRef, {
        deposit_status: 'CAPTURED',
        return_status: 'RETOURNE_ABIME',
        updated_at: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        action: 'DEPOSIT_CAPTURED',
        newItemStatus: 'DETRUIT_PERDU',
      };
    } else {
      // --- CAS 2 : ARTICLE RENDU EN BON ÉTAT ---
      await stripe.paymentIntents.cancel(rental.deposit_stripe_payment_intent_id);

      const newCycles = item.current_cycles - 1;
      const newStatus = newCycles <= 0 ? 'A_VENDRE' : 'DISPONIBLE';

      tx.update(itemRef, {
        current_cycles: newCycles,
        status: newStatus,
        updated_at: FieldValue.serverTimestamp(),
      });

      const storeRevenue = rental.rental_price_paid - PLATFORM_COMMISSION;

      tx.update(rentalRef, {
        deposit_status: 'RELEASED',
        return_status: 'RETOURNE_OK',
        commission_platform: PLATFORM_COMMISSION,
        store_revenue: storeRevenue,
        updated_at: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        action: 'DEPOSIT_RELEASED',
        newItemStatus: newStatus,
        remainingCycles: newCycles,
        commission: PLATFORM_COMMISSION,
        storeRevenue,
      };
    }
  });
}
