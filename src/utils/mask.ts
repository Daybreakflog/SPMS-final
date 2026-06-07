export function maskPhone(phone: string | undefined | null): string {
  if (!phone) return '-';
  if (phone.length < 7) return phone;
  return phone.replace(/(\d{3})\d{4}(\d+)/, '$1****$2');
}

export function maskIdCard(idCard: string | undefined | null): string {
  if (!idCard) return '-';
  if (idCard.length <= 6) return idCard;
  const start = idCard.slice(0, 3);
  const end = idCard.slice(-4);
  const masked = '*'.repeat(idCard.length - 7);
  return `${start}${masked}${end}`;
}
