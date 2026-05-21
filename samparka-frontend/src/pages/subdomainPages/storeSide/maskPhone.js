export default function maskPhone(phone) {
  if (phone === null || phone === undefined) return "";

  const phoneStr = String(phone); // convert number → string

  if (phoneStr.length < 6) return phoneStr;

  return `${phoneStr.slice(0, 2)}****${phoneStr.slice(-4)}`;
}
