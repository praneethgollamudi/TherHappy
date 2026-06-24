'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, BookOpen, Wind, LifeBuoy, BarChart2, Heart } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/breathe', label: 'Breathe', icon: Wind },
  { href: '/insights', label: 'Insights', icon: BarChart2 },
  { href: '/resources', label: 'Resources', icon: LifeBuoy },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col bg-white/80 backdrop-blur-xl border-r border-lavender-100 z-50 shadow-xl shadow-lavender-100/30">
        <div className="p-6 border-b border-lavender-100">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-lavender-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-lavender-200/50 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gradient">TherHappy</span>
              <p className="text-xs text-slate-400 font-normal">Your wellness space</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                  ${active
                    ? 'bg-lavender-100 text-lavender-700 shadow-sm'
                    : 'text-slate-500 hover:bg-lavender-50 hover:text-lavender-600'
                  }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-lavender-600' : 'text-slate-400'}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-lavender-50 to-pink-50 border border-lavender-100">
          <p className="text-xs font-semibold text-lavender-700 mb-1">Need help now?</p>
          <p className="text-xs text-slate-500 mb-2">Crisis support is available 24/7.</p>
          <a
            href="tel:988"
            className="block text-center text-xs font-bold text-white bg-gradient-to-r from-lavender-600 to-pink-500 rounded-lg py-2 hover:opacity-90 transition-opacity"
          >
            Call 988
          </a>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-lavender-100 bottom-nav">
        <div className="flex items-center justify-around px-2 pt-2 pb-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all
                  ${active ? 'text-lavender-600' : 'text-slate-400'}`}
              >
                <div className={`p-1.5 rounded-lg transition-all ${active ? 'bg-lavender-100' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
