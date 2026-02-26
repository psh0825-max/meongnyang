'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: '홈', icon: '📖', activeIcon: '📖' },
  { href: '/new', label: '새 일기', icon: '📷', activeIcon: '📷' },
  { href: '/profile', label: '프로필', icon: '🐾', activeIcon: '🐾' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-colors ${
                active ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <span className="text-xl">{active ? tab.activeIcon : tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
