/**
 * createRental.ts
 * ---------------
 * Se déclenche quand un utilisateur clique sur "Louer" dans l'application.
 *
 * Logique en 3 étapes :
 * 1. Vérifier que l'article est disponible (dans une transaction pour éviter
 *    que 2 personnes louent le même article en même temps).
 * 2. Encaisser le petit paiement de location + bloquer la caution (sans débit) via Stripe.
 * 3. Créer la fiche de location et verrouiller l'article.
 */
import { db, FieldValue } from '../config/firebaseAdmin';
import { stripe } from '../config/stripe';
import { Item, Rental } from '../schemas/types';

export async function createRental(
  userId: string,
  itemId: string,
  durationDays: number,
  stripePaymentMethodId: string
) {
  const itemRef = db.collection('items').doc(itemId);

  // Transaction Firestore : garantit qu'un seul utilisateur peut réserver
  // l'article à la fois, même en cas de clics simultanés.
  return db.runTransaction(async (tx) => {
    const itemSnap = await tx.get(itemRef);
    if (!itemSnap.exists) {
      throw new Error(`Article ${itemId} introuvable.`);
    }
    const item = itemSnap.data() as Item;

    // Étape 1 : vérifier la disponibilité
    if (item.status !== 'DISPONIBLE') {
      throw new Error("Cet article n'est plus disponible.");
    }

    // Étape 2a : encaisser le paiement de location (réel, débité immédiatement)
    const rentalPayment = await stripe.paymentIntents.create({
      amount: Math.round(item.rental_price * 100), // Stripe travaille en centimes
      currency: 'eur',
      payment_method: stripePaymentMethodId,
      customer: userId,
      confirm: true,
      off_session: true,
    });

    // Étape 2b : bloquer la caution SANS débiter
    // "capture_method: manual" = réservation façon caution d'hôtel
    const depositHold = await stripe.paymentIntents.create({
      amount: Math.round(item.deposit_amount * 100),
      currency: 'eur',
      payment_method: stripePaymentMethodId,
      customer: userId,
      confirm: true,
      off_session: true,
      capture_method: 'manual',
    });

    // Étape 3 : calculer les dates de location
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + durationDays);

    // Étape 4 : créer la fiche de location
    const rentalRef = db.collection('rentals').doc();
    const newRental: Rental = {
      rental_id: rentalRef.id,
      user_id: userId,
      item_id: itemId,
      store_id: item.store_id,
      start_date: startDate as any,
      end_date: endDate as any,
      rental_price_paid: item.rental_price,
      deposit_stripe_payment_intent_id: depositHold.id,
      deposit_status: 'HELD',
      return_status: 'EN_COURS',
      created_at: FieldValue.serverTimestamp() as any,
    };
    tx.set(rentalRef, newRental);

    // Étape 5 : verrouiller l'article pour empêcher une double location
    tx.update(itemRef, {
      status: 'LOUE',
      updated_at: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      rentalId: rentalRef.id,
      rentalPaymentId: rentalPayment.id,
      depositHoldId: depositHold.id,
    };
  });
}
