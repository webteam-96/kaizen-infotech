'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, PlusCircle, ExternalLink, LogOut } from 'lucide-react';
import { AdminGate } from '@/components/admin/AdminGate';
import { ADMIN_SESSION_KEY } from '@/lib/blog/config';

function NavLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-[length:var(--text-sm)] font-medium transition-colors ${
        active
          ? 'bg-[var(--color-accent-primary)] text-white'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
      }`}
    >
      {icon} {label}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lock = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    window.location.reload();
  };

  return (
    <AdminGate>
      <div className="min-h-screen bg-[var(--color-bg-secondary)]">
        <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
            <div className="flex items-center gap-2">
              <span className="text-[length:var(--text-base)] font-extrabold tracking-tight text-[var(--color-text-primary)]">
                Kaizen<span className="text-[var(--red-brand)]">·</span>Admin
              </span>
              <nav className="ml-4 hidden items-center gap-1 sm:flex">
                <NavLink href="/admin/blogs" icon={<LayoutGrid size={16} />} label="Manage Blogs" active={pathname === '/admin/blogs'} />
                <NavLink href="/admin/blogs/new" icon={<PlusCircle size={16} />} label="New Post" active={pathname === '/admin/blogs/new'} />
              </nav>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/blog"
                target="_blank"
                className="flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2 text-[length:var(--text-sm)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                <ExternalLink size={15} /> View blog
              </Link>
              <button
                type="button"
                onClick={lock}
                className="flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2 text-[length:var(--text-sm)] text-[var(--color-text-secondary)] hover:text-[var(--red-brand)]"
              >
                <LogOut size={15} /> Lock
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </AdminGate>
  );
}
