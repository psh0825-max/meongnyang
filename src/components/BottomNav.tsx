'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : 'text-gray-400'}`}>
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-bold">홈</span>
        </Link>

        <Link href="/new" className="nav-center">
          <span>✍️</span>
        </Link>

        <Link href="/profile" className={`nav-item ${pathname === '/profile' ? 'active' : 'text-gray-400'}`}>
          <span className="text-xl">🐾</span>
          <span className="text-[10px] font-bold">프로필</span>
        </Link>
      </div>
    </nav>
  );
}
