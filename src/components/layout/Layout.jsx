import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { Toast } from '../common/Notice';

export default function Layout() {
  return <div className="min-h-screen bg-[#FFF9F0] text-[#202820]"><Header /><main className="min-h-[60vh]"><Outlet /></main><Footer /><Toast /></div>;
}
