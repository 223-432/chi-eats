import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function About() {
  return <InfoPage eyebrow="Our story" title="A world of food, one table." paragraphs={[
    'CHI EATS is a recipe discovery and meal-planning experience powered by TheMealDB API.',
    'Explore recipe information, ingredients, instructions, and cuisine filters. Nigerian meal searches show results only when TheMealDB returns them.',
    'TheMealDB provides recipe and food information, not restaurant inventory. CHI EATS does not sell food or connect to restaurants, grocery inventory, delivery partners, or payment processors.',
  ]} />;
}

export function Contact() {
  const { notify } = useApp();
  const [sent, setSent] = useState(false);
  function submit(event) {
    event.preventDefault();
    setSent(true);
    notify('Thanks. This demo contact form does not send or store messages.');
    event.currentTarget.reset();
  }
  return <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">We’re listening</p><h1 className="mt-2 text-4xl font-black">Contact CHI EATS</h1><p className="mt-3 text-sm text-[#777]">This prototype form demonstrates the contact experience; it does not transmit messages.</p><form onSubmit={submit} className="mt-7 space-y-4 rounded-2xl border border-[#E8E8E8] bg-white p-6"><label className="grid gap-1 text-sm font-bold">Your name<input required className="rounded-xl border border-[#E8E8E8] px-4 py-3 font-normal" /></label><label className="grid gap-1 text-sm font-bold">Email<input required type="email" className="rounded-xl border border-[#E8E8E8] px-4 py-3 font-normal" /></label><label className="grid gap-1 text-sm font-bold">Message<textarea required rows="5" className="rounded-xl border border-[#E8E8E8] px-4 py-3 font-normal" /></label>{sent && <p role="status" className="text-sm text-[#176B45]">Your message was not sent; this is a local demo.</p>}<button className="rounded-xl bg-[#176B45] px-5 py-3 font-bold text-white">Preview message</button></form></section>;
}

export function FAQ() {
  const faqs = [
    ['Is CHI EATS a real delivery service?', 'No. CHI EATS provides recipe discovery and meal planning. It does not connect to restaurants, grocery inventory, or delivery providers.'],
    ['Can I order a recipe?', 'No. TheMealDB recipe information is not a purchasable menu item. Meal plans are saved locally and do not place orders.'],
    ['Are nutrition facts exact?', 'Nutrition information is an estimate based on available recipe data and may vary.'],
    ['How do I keep my favorites or meal plan?', 'Recipe IDs and meal plans are stored in this browser. Clearing browser data removes them.'],
    ['Where does recipe information come from?', 'Recipe search, images, ingredient details, and instructions are retrieved from TheMealDB.'],
  ];
  return <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">Good to know</p><h1 className="mt-2 text-4xl font-black">Frequently asked questions</h1><div className="mt-7 space-y-3">{faqs.map(([question, answer]) => <details key={question} className="rounded-2xl border border-[#E8E8E8] bg-white p-5"><summary className="cursor-pointer font-bold">{question}</summary><p className="mt-3 text-sm leading-6 text-[#777]">{answer}</p></details>)}</div></section>;
}

export function PrivacyPolicy() {
  return <InfoPage eyebrow="Your data" title="Privacy policy" paragraphs={[
    'Recipe favorites, meal-plan recipe IDs, demo account names and emails, and optional saved contact addresses may be stored in your browser local storage.',
    'TheMealDB API is accessed directly from client browser code using its public test key.',
    'Do not enter real payment card information, sensitive personal details, or passwords you use elsewhere. Demo passwords are not stored, but the local demo account is not secure authentication.',
    'Local data can be removed by clearing this site’s browser storage. No order, payment, delivery, or contact form is transmitted to CHI EATS or a restaurant.',
  ]} />;
}

export function Terms() {
  return <InfoPage eyebrow="Prototype terms" title="Terms of use" paragraphs={[
    'CHI EATS is a recipe discovery and meal-planning interface. It is not a food retailer, restaurant ordering service, grocery inventory, or delivery service.',
    'TheMealDB recipes are informational and cannot be purchased through this application. Saving a meal plan only stores recipe IDs in your browser.',
    'Nutrition values are estimates from available recipe data and should not be treated as medical or dietary advice.',
  ]} />;
}

function InfoPage({ eyebrow, title, paragraphs }) {
  return <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">{eyebrow}</p><h1 className="mt-2 text-4xl font-black">{title}</h1><div className="mt-6 space-y-4 text-base leading-7 text-[#636a63]">{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><Link to="/recipes" className="mt-7 inline-block rounded-xl bg-[#176B45] px-5 py-3 font-bold text-white">Explore recipes</Link></section>;
}
