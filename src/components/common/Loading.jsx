export default function Loading({ label = 'Loading CHI EATS...' }) {
  return (
    <div className="flex min-h-[45vh] flex-col items-center justify-center gap-4 text-[#176B45]" role="status">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-[#E2F5E9] border-t-[#176B45]" />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}
