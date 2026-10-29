import { Link } from 'react-router-dom';

export default function NotFound() {
  return <section className="mx-auto max-w-3xl px-4 py-24 text-center"><p className="text-7xl font-black text-[#176B45]">404</p><h1 className="mt-3 text-3xl font-black">This page isn’t on the menu</h1><p className="mt-3 text-[#777]">The page may have moved or the link may be incorrect.</p><Link to="/" className="mt-6 inline-block rounded-xl bg-[#176B45] px-5 py-3 font-bold text-white">Back to CHI EATS</Link></section>;
}
