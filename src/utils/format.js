export function formatDate(date) {
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(new Date(date));
}
