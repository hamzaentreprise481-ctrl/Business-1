# Rental App – Backend (prêt pour Vercel)

Backend pour une application mobile de location de vêtements de marque à petits prix, à partir des stocks d'invendus de magasins partenaires (ex : Nike, Zara).

## Principe général

Disponible → Loué → Rendu (OK ou abîmé) → répète jusqu'à 0 cycle → Vendu en déstockage

## Routes disponibles une fois déployé

- GET /api/health : vérifie que le déploiement fonctionne
- POST /api/createRental : crée une nouvelle location
- POST /api/processReturnItem : traite le retour d'un article
- /api/checkOverdueRentals : appelée automatiquement chaque nuit à 3h (cron)

## Configuration nécessaire sur Vercel

Dans Project Settings > Environment Variables, ajoute :
- STRIPE_SECRET_KEY : ta clé secrète Stripe
- FIREBASE_SERVICE_ACCOUNT_JSON : le contenu complet du fichier JSON de clé de service Firebase (en une seule ligne)

## Déploiement

1. Importe ce dépôt sur Vercel
2. Ajoute les 2 variables d'environnement ci-dessus
3. Déploie
4. Teste d'abord /api/health (ne nécessite aucune config Stripe/Firebase)
