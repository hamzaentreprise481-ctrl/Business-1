/**
 * Types représentant le schéma des collections Firestore.
 * Sert de "contrat" entre le code et la base de données.
 */

// ---------- Collection: stores ----------
export interface Store {
  store_id: string;
  name: string;
  brand: string;
  commission_rate_fixed: number; // en euros, ex: 0.50
  bank_account_id: string; // ID du compte Stripe Connect du magasin
  address: string;
  created_at: FirebaseFirestore.Timestamp;
}

// ---------- Collection: items ----------
export type ItemStatus = 'DISPONIBLE' | 'LOUE' | 'A_VENDRE' | 'DETRUIT_PERDU';

export interface Item {
  item_id: string;
  store_id: string;
  name: string;
  brand: string;
  size: string;
  initial_cycles: number; // durée de vie fixée à la création, jamais modifiée
  current_cycles: number; // décrémenté à chaque retour OK
  rental_price: number; // en euros
  deposit_amount: number; // en euros
  status: ItemStatus;
  photos: string[];
  created_at: FirebaseFirestore.Timestamp;
  updated_at: FirebaseFirestore.Timestamp;
}

// ---------- Collection: rentals ----------
export type DepositStatus = 'HELD' | 'CAPTURED' | 'RELEASED';
export type ReturnStatus = 'EN_COURS' | 'RETOURNE_OK' | 'RETOURNE_ABIME' | 'EN_LITIGE';

export interface Rental {
  rental_id: string;
  user_id: string;
  item_id: string;
  store_id: string;
  start_date: FirebaseFirestore.Timestamp;
  end_date: FirebaseFirestore.Timestamp;
  rental_price_paid: number;
  deposit_stripe_payment_intent_id: string;
  deposit_status: DepositStatus;
  return_status: ReturnStatus;
  commission_platform?: number;
  store_revenue?: number;
  created_at: FirebaseFirestore.Timestamp;
  updated_at?: FirebaseFirestore.Timestamp;
}
