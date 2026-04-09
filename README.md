# Qonto Quittance

Automated rent receipt (quittance de loyer) generation from Qonto bank transfers.

## How it works

1. Polls the Qonto API for incoming credit transfers
2. Matches transactions by sender IBAN and amount
3. Generates a PDF rent receipt
4. Sends it by email via Gmail SMTP
5. Tracks processed transactions to avoid duplicates

## Setup

### Prerequisites

- Node.js 22+
- A Qonto account with API access (Settings > Integrations > API)
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords)

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

## Usage

### Run locally

```bash
npm start
```

### Dry run (generates PDF without sending email)

```bash
npm run start:dry
```

### GitHub Actions (automated)

The workflow runs daily at 8:00 UTC. Configure all env vars as [repository secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions).

You can also trigger it manually from the Actions tab.

## License

MIT
