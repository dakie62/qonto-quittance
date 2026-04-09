import "dotenv/config";

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const config = {
  qonto: {
    slug: required("QONTO_SLUG"),
    secretKey: required("QONTO_SECRET_KEY"),
    iban: required("QONTO_IBAN"),
  },
  tenant: {
    iban: required("TENANT_IBAN"),
    emails: required("TENANT_EMAILS").split(",").map((e) => e.trim()),
    names: required("TENANT_NAMES"), // e.g. "M. Evann DUVERGNE et Mme Lennie GRUCHET"
  },
  landlord: {
    companyName: required("LANDLORD_COMPANY_NAME"),
    legalForm: optional("LANDLORD_LEGAL_FORM", "SCI"),
    capital: optional("LANDLORD_CAPITAL", "155 000 €"),
    address: required("LANDLORD_ADDRESS"),
    siret: required("LANDLORD_SIRET"),
    rcs: required("LANDLORD_RCS"),
    tva: optional("LANDLORD_TVA", ""),
    representative: required("LANDLORD_REPRESENTATIVE"),
    city: optional("LANDLORD_CITY", "Lille"),
  },
  property: {
    address: required("PROPERTY_ADDRESS"),
    description: optional("PROPERTY_DESCRIPTION", ""),
  },
  rentAmount: Number(required("RENT_AMOUNT")),
  gmail: {
    user: required("GMAIL_USER"),
    appPassword: required("GMAIL_APP_PASSWORD"),
  },
  dryRun: process.env.DRY_RUN === "true",
};
