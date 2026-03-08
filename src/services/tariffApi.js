import axios from 'axios';
import { format } from 'date-fns';

const TARIFF_URL = 'https://api.energidataservice.dk/dataset/datahubpricelist';

// Fixed Energinet system charges (DKK/kWh, excl. VAT) — updated 2025
const TRANSMISSIONS_NETTARIF = 0.061; // ChargeTypeCode 40000
const SYSTEMTARIF = 0.074;            // ChargeTypeCode 41000
const ELAFGIFT = 0.720;               // Electricity tax (EA-001) 2025

export const VAT = 1.25;

/**
 * Fetch hourly residential grid tariffs for a DSO.
 * Returns an array of 24 numbers (DKK/kWh, excl. VAT), one per hour.
 * Falls back to [0,...] if fetching fails so the app still works.
 */
export async function fetchGridTariffs(gln) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

  const response = await axios.get(TARIFF_URL, {
    params: {
      limit: 100,
      start: today,
      end: tomorrow,
      filter: JSON.stringify({ GLN_Number: gln, ChargeType: 'D03' }),
      sort: 'ValidFrom desc',
    },
    timeout: 10000,
  });

  const records = response.data.records;
  if (!records || records.length === 0) return Array(24).fill(0);

  // Deduplicate by ChargeTypeCode, keep most recent
  const byCode = new Map();
  for (const r of records) {
    if (!byCode.has(r.ChargeTypeCode)) byCode.set(r.ChargeTypeCode, r);
  }
  const unique = [...byCode.values()];

  // Pick the residential (C-net) tariff:
  // 1. Look for "Nettarif C" in Note (exact match preferred)
  // 2. Look for ChargeTypeCode containing "C" and matching a tariff pattern
  // 3. Fall back to the record with the highest Price7 (peak price) — residential is highest per-unit
  let tariffRecord = unique.find((r) => r.Note && r.Note.toLowerCase() === 'nettarif c');
  if (!tariffRecord) {
    tariffRecord = unique.find(
      (r) => r.Note && r.Note.toLowerCase().includes('nettarif c') && r.Price7
    );
  }
  if (!tariffRecord) {
    tariffRecord = unique.find(
      (r) => r.ChargeTypeCode && /^DT_C|_C$|^C$/.test(r.ChargeTypeCode) && r.Price7
    );
  }
  if (!tariffRecord) {
    // fallback: highest peak price among records that have Price7 (hourly tariff, not subscription)
    const withPeak = unique.filter((r) => r.Price7 && r.Price7 > 0);
    if (withPeak.length > 0) {
      tariffRecord = withPeak.reduce((best, r) => (r.Price7 > best.Price7 ? r : best));
    }
  }
  if (!tariffRecord) return Array(24).fill(0);

  // Extract Price1–Price24 into an array indexed by hour (0=midnight)
  return Array.from({ length: 24 }, (_, i) => tariffRecord[`Price${i + 1}`] || 0);
}

/**
 * Calculates the true consumer price (incl. VAT) for each hour.
 * spotPrices: array of { hour, priceDKK, ... }
 * gridTariffs: array of 24 DKK/kWh values (excl. VAT) from fetchGridTariffs
 */
export function applyTariffs(spotPrices, gridTariffs) {
  if (!gridTariffs || gridTariffs.length === 0) return spotPrices;

  const fixedCharges = TRANSMISSIONS_NETTARIF + SYSTEMTARIF + ELAFGIFT;

  return spotPrices.map((p) => {
    const gridTariff = gridTariffs[p.hour] || 0;
    const totalExclVat = p.priceDKK + gridTariff + fixedCharges;
    return {
      ...p,
      truePriceDKK: totalExclVat * VAT,
      gridTariff,
      fixedCharges,
    };
  });
}
