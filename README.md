# KnowledgeQuest

**KnowledgeQuest** est une application web full‑stack JavaScript permettant la création, la gestion et le passage de QCM (Questionnaires à Choix Multiples) extraits de documents PDF. Elle inclut une interface utilisateur riche, une API REST sécurisée et des outils d'analyse avancée (statistiques, graphiques, AI‑powered generation).

---

## Table des Matières

1. [Description Générale](#description-générale)
2. [Fonctionnalités Principales](#fonctionnalités-principales)
3. [Stack Technologique](#stack-technologique)
4. [Architecture & Structure du Projet](#architecture--structure-du-projet)
   - [Arborescence Complète](#arborescence-complète)
   - [Détail des Répertoires et Fichiers](#détail-des-répertoires-et-fichiers)
5. [Modèles de Données (Mongoose)](#modèles-de-données-mongoose)
6. [Configuration & Variables d'Environnement](#configuration--variables-denvironnement)
7. [Installation & Lancement](#installation--lancement)
   - [Backend](#backend)
   - [Frontend](#frontend)
8. [Utilisation](#utilisation)
   - [Flux Utilisateur](#flux-utilisateur)
   - [Exemples d'Appels API (cURL)](#exemples-dappels-api-curl)
9. [Sécurité & Bonnes Pratiques](#sécurité--bonnes-pratiques)
10. [Tests & Qualité](#tests--qualité)
11. [Contribuer](#contribuer)

---

## Description Générale

KnowledgeQuest permet aux étudiants de générer facilement des QCM à partir de documents PDF, de créer ces derniers manuellement, de passer ces tests en ligne et d'analyser les performances individuelles ou globales via un tableau de bord interactif.

---

## Fonctionnalités Principales

- **Authentification & Autorisation**  
  - Inscription / connexion par email + mot de passe  
  - OAuth 2.0 avec Google et Microsoft  
  - Protection des routes avec JWT  
  - Rôles: `user`, `admin`

- **Gestion de Documents PDF**  
  - Upload sécurisé via Multer  
  - Stockage local sous `/BackEnd/uploads`  
  - Extraction de texte avec `pdf-parse`

- **Génération & CRUD QCM**  
  - Création manuelle de QCM (titre, matière, thème, questions/réponses)  
  - (Possibilité d'intégration future d'un générateur automatique via OpenAI)  
  - Mise à jour et suppression de QCM

- **Passage de Tests & Sessions**  
  - Interface de test dynamique  
  - Suivi des réponses utilisateur et calcul de score  
  - Sauvegarde de chaque session avec durée, score, réponses

- **Statistiques & Dashboard**  
  - Progression hebdomadaire  
  - Statistiques par matière et thème  
  - Statistiques agrégées (pour admins)

- **Gestion des Matières / Thèmes**  
  - Liste publique des matières  
  - CRUD des matières / thèmes (admin)

- **Frontend Modulaire**  
  - Pages HTML statiques  
  - Composants JS réutilisables (sidebar, modals, cards)  
  - Services API (fetch wrappers)  
  - Graphiques via Chart.js

- **Observabilité & Sécurité**  
  - Logs HTTP (Morgan), logs applicatifs (Winston)  
  - En‑têtes sécurisées (Helmet), compression, CORS flexible

---

## Stack Technologique

| Côté         | Technologies principales                                           |
|--------------|--------------------------------------------------------------------|
| **Backend**  | Node.js, Express.js, MongoDB (Mongoose), Multer, `pdf-parse`, JWT, Firebase Admin SDK, OpenAI SDK |
| **Frontend** | HTML5, CSS3, JavaScript ES6+, Chart.js, Fetch API                |
| **Outils**   | dotenv, helmet, cors, compression, morgan, winston, nodemon       |

---

## Architecture & Structure du Projet

### Arborescence Complète

KnowledgeQuest/
├─ BackEnd/
│  ├─ config/                # Configuration DB & Firebase
│  │   ├─ database.js        # Options Mongoose
│  │   └─ firebaseServiceAccount.json
│  ├─ controllers/           # Logique métier par domaine
│  │   ├─ authController.js
│  │   ├─ userController.js
│  │   ├─ qcmController.js
│  │   ├─ sessionController.js
│  │   ├─ statsController.js
│  │   ├─ subjectController.js
│  │   └─ documentController.js
│  ├─ middleware/
│  │   └─ auth.js           # Vérification JWT + rôle
│  ├─ models/                # Schémas Mongoose
│  │   ├─ User.js
│  │   ├─ Qcm.js
│  │   ├─ Session.js
│  │   ├─ Stats.js
│  │   ├─ Subject.js
│  │   └─ Document.js
│  ├─ routes/                # Déclaration endpoints
│  │   └─ *.js (authRoutes, userRoutes, qcmRoutes, ...)
│  ├─ utils/
│  │   ├─ db.js             # Connexion DB
│  │   ├─ firebaseAdmin.js  # Initialisation Firebase
│  │   └─ logger.js         # Winston logger
│  ├─ uploads/              # Stockage des PDF uploadés
│  ├─ server.js             # Entrée Express (middleware, routes)
│  ├─ .env                  # Variables d'environnement
│  └─ testConnection.js     # Script de test DB

├─ FrontEnd/
│  ├─ pages/
│  │   ├─ *.html            # Interfaces (login, dashboard, profile...)
│  │   ├─ js/               # Logiciel front (app, router, services)
│  │   └─ style/            # CSS modulaires
│  ├─ utils/                # Helpers front (auth, forms, upload)
│  ├─ package.json          # Dépendances & scripts
│  └─ node_modules/

└─ FinalKnowledgeQuest.zip  # Archive du projet7

### Détail des Répertoires et Fichiers

- **BackEnd/config/**
  - `database.js` : paramètres de connexion Mongoose (pool, timeouts)
  - `firebaseServiceAccount.json` : clé service account Firebase

- **BackEnd/controllers/**
  - `authController.js` : register, login, OAuth Google/Microsoft, JWT
  - `userController.js` : gestion profil, mot de passe, historique tests, admin users
  - `qcmController.js` : CRUD QCM
  - `sessionController.js` : création et récupération des sessions de test
  - `statsController.js` : stats user & agrégées
  - `subjectController.js` : récupération et gestion des matières/thèmes
  - `documentController.js` : upload, lecture et téléchargement PDF

- **BackEnd/middleware/auth.js**
  - Vérifie l'existence et la validité du JWT
  - Injecte `req.user` et contrôle d'accès (role admin)

- **BackEnd/models/**
  - Schémas Mongoose détaillant champs, validations, relations (dans section suivante)

- **BackEnd/routes/**
  - Fichiers `*Routes.js` exposant les endpoints et appliquant le middleware `protect`

- **BackEnd/utils/**
  - `db.js` : abstraction connexion MongoDB
  - `logger.js` : configuration Winston (fichiers de logs, niveaux)

- **FrontEnd/pages/**
  - Fichiers HTML statiques pour chaque vue
  - Sous-dossiers `js/` (composants, services, router) et `style/` (CSS)

- **FrontEnd/utils/**
  - Helpers JS : gestion auth (token), upload doc, error handling, graphiques

---

## Modèles de Données (Mongoose)

- **User**
  - `name` (String, required)
  - `email` (String, unique, required)
  - `passwordHash` (String, required)
  - `role` (String, enum [`user`,`admin`], default `user`)
  - `domain` (String)
  - `settings` (Object)

- **Qcm**
  - `title` (String, required)
  - `subject` (String, required)
  - `topic` (String, required)
  - `questions` (Array of { question, choices, correctIndex })

- **Session**
  - `user` (ObjectId -> User)
  - `qcm` (ObjectId -> Qcm)
  - `score` (Number)
  - `duration` (Number, secondes)
  - `answers` (Array)
  - `createdAt` (Date)

- **Stats**
  - `user` (ObjectId)
  - `weeklyProgress` (Array)
  - `subjectStats` (Object)

- **Subject**
  - `name` (String)
  - `domain` (String)
  - `topics` (Array de String)

- **Document**
  - `filename` (String)
  - `originalName` (String)
  - `uploadedBy` (ObjectId)
  - `extractedText` (String)
  - `createdAt` (Date)

---

## Configuration & Variables d'Environnement

Copier `.env.example` en `.env` et configurer :

NODE_ENV=development       # development | production
PORT=5000                  # Port du serveur Express
MONGODB_URI=<URI MongoDB>   # ex: mongodb+srv://...
JWT_SECRET=<clé secrète>   # pour signer JWT (30d)
OPENAI_API_KEY=<clé API>    # pour intégration AI future
MICROSOFT_CLIENT_ID=…       # OAuth Azure
MICROSOFT_CLIENT_SECRET=…   # OAuth Azure
MICROSOFT_REDIRECT_URI=…    # ex: http://localhost:5000/api/auth/microsoft/callback

Le fichier `config/firebaseServiceAccount.json` contient les identifiants Firebase.

---

## Installation & Lancement

### Backend

cd KnowledgeQuest/BackEnd
npm install
# Copiez .env, modifiez-le
npm run dev    # nodemon en dev
npm start      # en production

### Frontend

cd KnowledgeQuest/FrontEnd
npm install   # si dépendances JS nécessaires
npx live-server --port=5500  # ou tout serveur HTTP statique
# Accéder à http://localhost:5500

---

## Utilisation

### Flux Utilisateur

1. **Inscription / Connexion**  
   - Email/password ou OAuth Google/Microsoft  
2. **Profil**  
   - Mise à jour du nom, domaine, mot de passe  
3. **Upload Document**  
   - Sélection d'un PDF → extraction de texte  
4. **Création QCM**  
   - Définir titre, matière, thème, questions  
5. **Passage Test**  
   - Répondre aux questions, soumettre → score instantané  
6. **Dashboard & Stats**  
   - Graphiques hebdomadaires, statistiques par matière  
7. **Administration** (si role=admin)  
   - CRUD matières, utilisateurs, stats globaux


### Exemples d'Appels API (cURL)

- **Se connecter**

curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email":"user@ex.com","password":"pwd123" }'

- **Créer un QCM**

curl -X POST http://localhost:5000/api/qcms/ \
  -H "Authorization: Bearer <votre_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Test JS",
    "subject":"Informatique",
    "topic":"JavaScript",
    "questions":[
      { "question":"Qu'est-ce qu'une closure ?", "choices":["a","b","c"], "correctIndex":2 }
    ]
  }'

- **Récupérer les Stats**

curl http://localhost:5000/api/stats/ \
  -H "Authorization: Bearer <token>"

---

## Sécurité & Bonnes Pratiques

- Stockage des secrets en variables d'environnement
- Validation des inputs et gestion d'erreurs centralisée
- Headers sécurisés avec `helmet`
- CORS restreint selon besoin
- Compression des réponses HTTP
- Journalisation (HTTP + application)

---

## Tests & Qualité

- **Connexion DB**  
  `node testConnection.js` vérifie la connexion MongoDB.
- **Lint & Format**  
  Intégrer ESLint / Prettier pour le front si souhaité.
- **Tests Unitaires**  
  (À ajouter – frameworks comme Mocha/Chai ou Jest)

---

## Contribuer

1. Forkez ce dépôt  
2. Créez une branche (`git checkout -b feature/xyz`)  
3. Commitez vos modifications (`git commit -m "feat: description"`)  
4. Pushez et ouvrez une Pull Request  
5. Passez les revues et merge!  
6. Merci pour votre contribution 🎉
