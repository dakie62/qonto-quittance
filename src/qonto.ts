import { config } from "./config.js";

export interface QontoTransaction {
  transaction_id: string;
  amount: number;
  amount_cents: number;
  currency: string;
  side: "credit" | "debit";
  operation_type: string;
  status: string;
  settled_at: string;
  emitted_at: string;
  label: string;
  reference: string;
  income?: {
    counterparty_account_number: string;
    counterparty_account_number_format: string;
  };
}

interface QontoResponse {
  transactions: QontoTransaction[];
  meta: {
    current_page: number;
    next_page: number | null;
    total_pages: number;
    per_page: number;
  };
}

const BASE_URL = "https://thirdparty.qonto.com/v2";

async function fetchTransactions(page = 1): Promise<QontoResponse> {
  const params = new URLSearchParams({
    iban: config.qonto.iban,
    side: "credit",
    "operation_type[]": "income",
    "status[]": "completed",
    page: String(page),
    per_page: "100",
  });

  const res = await fetch(`${BASE_URL}/transactions?${params}`, {
    headers: {
      Authorization: `${config.qonto.slug}:${config.qonto.secretKey}`,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Qonto API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<QontoResponse>;
}

function normalizeIban(iban: string): string {
  return iban.replace(/\s/g, "").toUpperCase();
}

export async function getMatchingTransactions(): Promise<QontoTransaction[]> {
  const matching: QontoTransaction[] = [];
  let page = 1;
  const tenantIban = normalizeIban(config.tenant.iban);

  while (true) {
    const data = await fetchTransactions(page);

    for (const tx of data.transactions) {
      const counterpartyIban = tx.income?.counterparty_account_number;
      if (
        counterpartyIban &&
        normalizeIban(counterpartyIban) === tenantIban &&
        tx.amount === config.rentAmount
      ) {
        matching.push(tx);
      }
    }

    if (!data.meta.next_page) break;
    page = data.meta.next_page;
  }

  return matching;
}
