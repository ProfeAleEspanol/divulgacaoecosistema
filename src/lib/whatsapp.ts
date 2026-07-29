export function getWhatsAppHref(phone: string, message: string) {
  const normalized = phone.replace(/\D/g, "");

  if (!normalized) {
    return null;
  }

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
