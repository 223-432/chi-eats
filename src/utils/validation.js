export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export function normalizeAddress(address) {
  return {
    id: address.id || `address-${Date.now()}`,
    label: String(address.label || 'Home').trim(),
    recipient: String(address.recipient || '').trim(),
    phone: String(address.phone || '').trim(),
    street: String(address.street || '').trim(),
    city: String(address.city || '').trim(),
    isDefault: Boolean(address.isDefault),
  };
}
