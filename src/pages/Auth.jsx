import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function AuthShell({ children, title, subtitle }) {
  return <section className="mx-auto max-w-md px-4 py-12"><div className="rounded-3xl border border-[#E8E8E8] bg-white p-6 shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">CHI EATS account</p><h1 className="mt-2 text-3xl font-black">{title}</h1><p className="mt-2 text-sm text-[#777]">{subtitle}</p>{children}<p className="mt-6 rounded-xl bg-[#FFF9F0] p-3 text-xs leading-5 text-[#777]">Demo authentication only. This prototype stores your account name and email locally, never your password. It does not provide secure authentication.</p></div></section>;
}

export function Login() {
  const { user, login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  if (user && !location.state?.from) return <Navigate to="/profile" replace />;
  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = login({ email: form.get('email'), password: form.get('password') });
    if (!result.ok) return setError(result.message);
    navigate(location.state?.from || '/profile', { replace: true });
  }
  return <AuthShell title="Welcome back" subtitle="Sign in to your local demo account."><form onSubmit={submit} className="mt-6 space-y-4"><label className="grid gap-1 text-sm font-bold">Email<input required type="email" name="email" autoComplete="email" className="rounded-xl border border-[#E8E8E8] px-4 py-3 font-normal" /></label><label className="grid gap-1 text-sm font-bold">Password<input required type="password" name="password" autoComplete="current-password" className="rounded-xl border border-[#E8E8E8] px-4 py-3 font-normal" /></label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button className="w-full rounded-xl bg-[#176B45] px-4 py-3 font-bold text-white">Sign in</button></form><p className="mt-5 text-sm text-[#777]">New here? <Link to="/register" state={location.state} className="font-bold text-[#176B45]">Create a demo account</Link></p></AuthShell>;
}

export function Register() {
  const { user, register } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  if (user && !location.state?.from) return <Navigate to="/profile" replace />;
  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = register({ name: form.get('name'), email: form.get('email'), password: form.get('password') });
    if (!result.ok) return setError(result.message);
    navigate(location.state?.from || '/profile', { replace: true });
  }
  return <AuthShell title="Create your account" subtitle="Use a local demo profile to save recipe favorites and meal plans."><form onSubmit={submit} className="mt-6 space-y-4"><label className="grid gap-1 text-sm font-bold">Full name<input required name="name" autoComplete="name" className="rounded-xl border border-[#E8E8E8] px-4 py-3 font-normal" /></label><label className="grid gap-1 text-sm font-bold">Email<input required type="email" name="email" autoComplete="email" className="rounded-xl border border-[#E8E8E8] px-4 py-3 font-normal" /></label><label className="grid gap-1 text-sm font-bold">Password<input required minLength="6" type="password" name="password" autoComplete="new-password" className="rounded-xl border border-[#E8E8E8] px-4 py-3 font-normal" /><span className="text-xs font-normal text-[#777]">Used only for this demo form; never stored or verified by a server.</span></label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button className="w-full rounded-xl bg-[#176B45] px-4 py-3 font-bold text-white">Create demo account</button></form><p className="mt-5 text-sm text-[#777]">Already registered? <Link to="/login" className="font-bold text-[#176B45]">Log in</Link></p></AuthShell>;
}
