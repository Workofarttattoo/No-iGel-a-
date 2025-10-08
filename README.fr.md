# Base44 : Guide Express

Bienvenue dans Base44. Ce document s’adresse à **tout le monde**. Il décrit ce que fait l’application, comment la configurer et comment la maintenir sans jargon inutile.

---

## 1. À quoi sert Base44 ?
- **Application mobile (iOS & Android)** : permet à des adultes vérifiés de discuter avec les personas Venice.ai sans publicité ni filtres intrusifs.
- **Backend Node.js** : vérifie l’âge, enregistre l’image du recto du document, dialogue avec Venice.ai et gère abonnements + historiques.

Les deux briques doivent être actives pour que l’expérience fonctionne.

---

## 2. Vocabulaire
| Terme | Explication |
|-------|-------------|
| **Venice.ai** | Plateforme d’IA qui génère les réponses. |
| **Persona** | Profil prédéfini (ex : hacker repenti) avec un ton et des règles. |
| **Onboarding** | Photo du recto de la pièce, confirmation d’être majeur et acceptation du disclaimer. |
| **Paywall / Abonnement** | Nécessaire pour chatter. Pour l’instant, un bouton de démonstration simule l’achat. |
| **JWT / Tokens** | Jetons d’accès générés après l’onboarding pour prouver l’authentification. |

---

## 3. Préparation
### 3.1 Outils
- [Node.js 20+](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- Simulateur iOS (Xcode) et/ou émulateur Android (Android Studio)
- Base Postgres (locale ou hébergée)
- Facultatif : bucket S3 pour stocker les documents

### 3.2 Secrets à récupérer
| Secret | Où le trouver |
|--------|---------------|
| Clé API Venice.ai | Tableau de bord Venice.ai → API Keys |
| Secret JWT | `openssl rand -base64 48` ou votre gestionnaire de mots de passe |
| URL Postgres | Fournisseur de la base (ex : `postgres://utilisateur:mdp@host:5432/base44`) |
| Bucket + région S3 | Créez un bucket chiffré dans AWS |
| Secret webhook (optionnel) | Stripe ou RevenueCat |

---

## 4. Mise en place du backend
1. Éditez `backend/.env` :
   ```env
   VENICE_API_KEY=votre_cle
   VENICE_PROFILE_ID=h4ck3r
   PORT=4000
   DATABASE_URL=postgres://utilisateur:mdp@host:5432/base44
   JWT_SECRET=chaine_aleatoire
   AWS_REGION=us-west-2
   ID_BUCKET=base44-id-assets
   STRIPE_WEBHOOK_SECRET=secret_optionnel
   ```
2. Installez et compilez :
   ```bash
   cd backend
   npm install
   npm run build
   ```
3. Démarrez le serveur :
   ```bash
   npm run dev
   ```

> Message `listen EPERM` ? Cela signifie que l’environnement bloque le port. Lancez la commande sur votre propre poste.

---

## 5. Application mobile
1. Dans `mobile/app.json`, renseignez `extra.apiBaseUrl` avec l’URL du backend (ex : `http://localhost:4000`).
2. Installez les dépendances :
   ```bash
   cd mobile
   npm install
   npx tsc --noEmit
   ```
3. Lancez Expo :
   ```bash
   npm start
   ```
4. Pressez `i` (simulateur iOS) ou `a` (émulateur Android). Sur un appareil physique, scannez le QR code avec Expo Go.

---

## 6. Parcours utilisateur
1. Autoriser la caméra.
2. Photographier le recto du document et accepter l’avertissement.
3. Dans le paywall, appuyer sur “Activate Secure Access” (démo pour l’instant).
4. Accéder à la galerie, choisir un persona.
5. Chatter en direct.
6. Besoin d’effacer ? “Activate Panic Wipe”.

---

## 7. Gestes quotidiens
| Action | Commande |
|--------|----------|
| Démarrer le backend | `cd backend && npm run dev`
| Démarrer l’app | `cd mobile && npm start`
| Ajouter un persona | Modifier `backend/src/services/personaService.ts`
| Régler la modération | Modifier `backend/src/utils/safety.ts`
| Consulter les incidents | Aujourd’hui : regarder les logs |
| Réinitialiser un appareil | Bouton “Activate Panic Wipe” |

---

## 8. Dépannage
- **Backend refuse de démarrer** : vérifier `.env`, droits sur le port et connexion Postgres.
- **L’app ne se connecte pas** : vérifier l’URL `apiBaseUrl` et la connectivité réseau.
- **Échec de l’upload** : vérifier les permissions de la caméra et la taille (< 8 Mo).
- **Abonnement perdu** : le backend stocke en mémoire ; répétez l’activation.
- **Modération trop stricte** : ajustez les listes dans `safety.ts`.

---

## 9. Avant la prod
1. Remplacer les structures en mémoire par des tables Postgres.
2. Stocker les documents sur S3 chiffré avec politique de rétention.
3. Intégrer les paiements réels et valider les reçus.
4. Installer monitoring, alertes, audits de modération.
5. Publier la politique de confidentialité et effectuer des tests de sécurité.

---

## 10. Besoin d’aide ?
- Partagez les logs backend + Expo.
- Fournissez captures d’écran de la configuration.
- Décrivez précisément les étapes qui posent problème.

Vous êtes prêt·e à faire tourner Base44 en toute confiance !
