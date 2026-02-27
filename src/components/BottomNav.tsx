'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      <div className="max-w-md mx-auto flex justify-around items-center" style={{ height: 64, paddingTop: 4 }}>
        <Link href="/" className={`nav-item ${pathname === '/' ? 'nav-item-active' : 'nav-item-inactive'}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill={pathname === '/' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span style={{ fontSize: 10, fontWeight: 700, marginTop: 2 }}>홈</span>
        </Link>

        <Link href="/new" className="nav-center-btn" aria-label="새 일기">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </Link>

        <Link href="/profile" className={`nav-item ${pathname === '/profile' ? 'nav-item-active' : 'nav-item-inactive'}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill={pathname === '/profile' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span style={{ fontSize: 10, fontWeight: 700, marginTop: 2 }}>프로필</span>
        </Link>
      </div>
    </nav>
  );
}
