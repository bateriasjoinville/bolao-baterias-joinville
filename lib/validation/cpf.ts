const CPF_BLOCKED = new Set([
  "00000000000",
  "11111111111",
  "22222222222",
  "33333333333",
  "44444444444",
  "55555555555",
  "66666666666",
  "77777777777",
  "88888888888",
  "99999999999",
]);

export function isValidCPF(digits: string): boolean {
  if (digits.length !== 11) return false;
  if (!/^\d{11}$/.test(digits)) return false;
  if (CPF_BLOCKED.has(digits)) return false;

  const digit = (i: number) => digits.charCodeAt(i) - 48;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += digit(i) * (10 - i);
  let dv1 = (sum * 10) % 11;
  if (dv1 === 10) dv1 = 0;
  if (dv1 !== digit(9)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += digit(i) * (11 - i);
  let dv2 = (sum * 10) % 11;
  if (dv2 === 10) dv2 = 0;
  if (dv2 !== digit(10)) return false;

  return true;
}
