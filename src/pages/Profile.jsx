import { useState } from 'react';
import { useApp } from '../context/AppContext';
import AccountNav from '../components/account/AccountNav';

export default function Profile() {
  const { user, updateProfile, notify } = useApp();
  const [name, setName] = useState(user.name);
  function submit(event) {
    event.preventDefault();
    if (!name.trim()) return notify('Name cannot be empty.');
    updateProfile({ name });
    notify('Profile updated on this device.');
  }
  return <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">Demo account</p><h1 className="mt-2 text-3xl font-black">Your profile</h1><p className="mt-2 text-sm text-[#777]">Account data is stored in this browser only and is not verified by a server.</p><div className="mt-6"><AccountNav /></div><form onSubmit={submit} className="rounded-2xl border border-[#E8E8E8] bg-white p-6"><label className="grid max-w-lg gap-2 text-sm font-bold">Name<input value={name} onChange={(event) => setName(event.target.value)} className="rounded-xl border border-[#E8E8E8] px-4 py-3 font-normal" /></label><p className="mt-4 text-sm"><b>Email:</b> {user.email}</p><button className="mt-5 rounded-xl bg-[#176B45] px-5 py-3 font-bold text-white">Save profile</button></form></section>;
}
