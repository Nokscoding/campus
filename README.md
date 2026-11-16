# CAMPUS — Marketplace étudiante (site public)

CAMPUS by NKS Services SARLU, Lubumbashi, RDC. Site Next.js déployé sur Vercel.

Site public : https://campus-marketplace-smoky-one.vercel.app

## Fonctionnel
- Navigation mobile-first, illustration et logo CAMPUS stockés dans Cloudinary.
- Catégories indexables, recherche par titre, fiches de produits, sitemap et robots.
- Inscription/connexion Supabase Auth et profil étudiant (université, téléphone).
- Dépôt d'annonce avec 1 à 5 photos : bucket Supabase Storage **campus-listing-photos**.
- Modération obligatoire avant publication ; aucune annonce fictive en production.
- Demande de réservation, devis de livraison accepté par l'acheteur, suivi de commande.
- Rapport d'inspection et photos privées consultables après contrôle.
- Reçu de paiement cash consultable et imprimable après encaissement réel.

## Infrastructure
- Base partagée NKS : `hdsjpsrvoiwqfjuehdkt`, uniquement les tables `campus_*`.
- Cloudinary : assets graphiques officiels (logo / illustrations).
- Supabase Storage : photos d'annonces et preuves d'inspection privées. Les photos produit utilisent Supabase Storage pour permettre des uploads sécurisés et authentifiés ; leur migration future vers Cloudinary nécessitera une configuration serveur de signature Cloudinary, pas un secret côté navigateur.
- Vercel : déploiement GitHub automatique.

## Variables d'environnement
```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://hdsjpsrvoiwqfjuehdkt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé publishable du projet>
```
Ne jamais exposer les clés `service_role` ni les secrets Cloudinary dans `NEXT_PUBLIC_`.

## Exploitation
Avant d'ouvrir les transactions aux étudiants, créer un compte administrateur dans l'ERP, recruter/former des agents et effectuer des tests réels du retrait, de la prise en charge, des photos d'inspection, de l'encaissement et des reversements. La simple réussite d'un build Vercel ne constitue pas une validation opérationnelle.

Il reste à valider les CGU, la protection des données, les règles de responsabilité et la politique de litiges.
