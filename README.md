# Receipt-generation

Génération automatique de quittances de loyer à partir des virements reçus sur [Qonto](https://qonto.com).

## Fonctionnement

Le script interroge l'API Qonto, identifie les virements correspondant au loyer (par IBAN et montant), puis pour chaque nouveau paiement :

1. Génère une **quittance de loyer en PDF** (format A4, conforme)
2. L'envoie par **email** au(x) locataire(s) via Gmail SMTP
3. Enregistre la transaction pour ne pas la traiter deux fois

Un mode **dry-run** permet de tester sans envoyer d'email : les PDF sont simplement générés et sauvegardés en local. Il suffit de passer la variable d'environnement `DRY_RUN=true`.

## Architecture

```
src/
├── index.ts      Orchestrateur — lance le flow complet
├── config.ts     Chargement et validation des variables d'environnement
├── qonto.ts      Client API Qonto — récupère et filtre les transactions
├── receipt.ts    Génération du PDF avec PDFKit
├── email.ts      Envoi par email via Nodemailer (Gmail SMTP)
└── tracker.ts    Suivi des transactions déjà traitées
```

Le fichier `data/processed.json` stocke les identifiants des transactions déjà traitées. Il est consulté à chaque exécution pour éviter les doublons.

## Intégration continue

Le workflow GitHub Actions (`.github/workflows/check-rent.yml`) automatise entièrement le processus :

- **Déclenchement** : tous les jours à 8h UTC (10h heure de Paris), ou manuellement depuis l'onglet Actions
- **Exécution** : installe les dépendances, lance le script avec les secrets du dépôt
- **Persistance** : après chaque run, le fichier `processed.json` est commité et poussé automatiquement sur le dépôt, pour que les prochaines exécutions sachent quelles transactions ont déjà été traitées

Les variables d'environnement sont configurées en tant que [repository secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions) sur GitHub.

## Prérequis

- **Node.js 22+**
- Un compte **Qonto** avec accès API (`Paramètres > Intégrations > API`)
- Un compte **Gmail** avec un [mot de passe d'application](https://myaccount.google.com/apppasswords) (la vérification en 2 étapes doit être activée)

## Variables d'environnement

### Qonto

| Variable | Description |
|---|---|
| `QONTO_SLUG` | Identifiant de l'organisation Qonto |
| `QONTO_SECRET_KEY` | Clé secrète API |
| `QONTO_IBAN` | IBAN du compte Qonto à surveiller |

### Locataire

| Variable | Description |
|---|---|
| `TENANT_IBAN` | IBAN du locataire (pour identifier les virements) |
| `RENT_AMOUNT` | Montant du loyer attendu (en euros) |
| `TENANT_NAMES` | Nom(s) du/des locataire(s) affiché(s) sur la quittance |
| `TENANT_EMAILS` | Adresse(s) email du/des locataire(s), séparées par des virgules |

### Bailleur

| Variable | Description |
|---|---|
| `LANDLORD_COMPANY_NAME` | Nom de la société |
| `LANDLORD_LEGAL_FORM` | Forme juridique (défaut : `SCI`) |
| `LANDLORD_CAPITAL` | Capital social (défaut : `155 000 €`) |
| `LANDLORD_ADDRESS` | Adresse du siège social |
| `LANDLORD_SIRET` | Numéro SIRET |
| `LANDLORD_RCS` | Numéro RCS |
| `LANDLORD_TVA` | Numéro de TVA intracommunautaire (optionnel) |
| `LANDLORD_REPRESENTATIVE` | Nom et qualité du représentant légal |
| `LANDLORD_CITY` | Ville pour la mention "Fait à..." (défaut : `Lille`) |

### Bien loué

| Variable | Description |
|---|---|
| `PROPERTY_ADDRESS` | Adresse du bien |
| `PROPERTY_DESCRIPTION` | Description du bien (optionnel) |

### Gmail

| Variable | Description |
|---|---|
| `GMAIL_USER` | Adresse email Gmail |
| `GMAIL_APP_PASSWORD` | Mot de passe d'application Google (16 caractères) |

## Licence

MIT
