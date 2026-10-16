export function formatMoney(amount) {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

// Reports send dates as "YYYY-MM-DD"; format in UTC so the day doesn't shift
export function formatDate(isoDay) {
  return new Date(isoDay).toLocaleDateString('en-US', { timeZone: 'UTC' })
}
