import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/common/Notice';
import AccountNav from '../components/account/AccountNav';

const emptyAddress = { label: 'Home', recipient: '', phone: '', street: '', city: '', isDefault: false };

export default function Addresses() {
  const { addresses, saveAddress, deleteAddress, notify } = useApp();
  const [form, setForm] = useState(emptyAddress);
  const [error, setError] = useState('');
  function submit(event) {
    event.preventDefault();
    const result = saveAddress(form);
    if (!result.ok) return setError(result.message);
    setError('');
    setForm(emptyAddress);
    notify('Address saved locally.');
  }
  return <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">Account</p><h1 className="mt-2 text-3xl font-black">Saved addresses</h1><p className="mt-2 text-sm text-[#777]">These optional contact details stay on this device and are not connected to delivery or ordering.</p><div className="mt-6"><AccountNav /></div><div className="grid gap-6 md:grid-cols-2"><form onSubmit={submit} className="space-y-3 rounded-2xl border border-[#E8E8E8] bg-white p-5"><h2 className="mb-2 text-lg font-bold">Add contact details</h2>{[['label','Label'],['recipient','Recipient name'],['phone','Phone'],['street','Street'],['city','City']].map(([key, label]) => <label key={key} className="grid gap-1 text-xs font-bold">{label}<input required={key !== 'label'} value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="rounded-lg border border-[#E8E8E8] px-3 py-2 text-sm font-normal" /></label>)}<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isDefault} onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))} />Set as default</label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button className="rounded-lg bg-[#176B45] px-4 py-2 text-sm font-bold text-white">Save details</button></form><div className="space-y-3">{addresses.length ? addresses.map((address) => <article key={address.id} className="flex items-start justify-between gap-3 rounded-2xl border border-[#E8E8E8] bg-white p-5"><div><h2 className="font-bold">{address.label} {address.isDefault && <span className="ml-2 rounded-full bg-[#E2F5E9] px-2 py-1 text-xs text-[#176B45]">Default</span>}</h2><p className="mt-2 text-sm text-[#777]">{address.recipient}<br />{address.street}, {address.city}<br />{address.phone}</p></div><button aria-label={`Delete ${address.label} address`} onClick={() => deleteAddress(address.id)} className="text-[#777] hover:text-red-600"><Trash2 size={18} /></button></article>) : <EmptyState title="No saved details" message="You do not need a saved address to discover recipes or build meal plans." />}</div></div></section>;
}
