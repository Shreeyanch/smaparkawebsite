export default function maskEmail(email) {
  if (!email) return "";

  const emailStr = String(email);
  const [localPart, domain] = emailStr.split("@");

  if (!localPart || !domain || localPart.length <= 3) {
    return emailStr;
  }

  return `${localPart.slice(0, 3)}***@${domain}`;
}
