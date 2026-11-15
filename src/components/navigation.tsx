'use client';
import Link from 'next/link';
import { readDraft, writeDraft } from '@/lib/browser-storage';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowUpRight, Menu, X, Sun, Moon, Search } from 'lucide-react';
import { BrandMark } from './brand-mark';
export type NavLink = { href: string; label: string; external?: boolean };
export function Navigation({
  links,
  cta,
  search,
}: {
  links: NavLink[];
  cta: NavLink;
  /** Show the lesson search shortcut (only once lessons exist). */
  search: boolean;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const enabled = readDraft('lsu-theme') === 'dark';
    setDark(enabled);
    document.documentElement.dataset.theme = enabled ? 'dark' : 'light';
  }, []);
  function toggle() {
    const v = !dark;
    setDark(v);
    document.documentElement.dataset.theme = v ? 'dark' : 'light';
    writeDraft('lsu-theme', v ? 'dark' : 'light');
  }
  return (
    <header className="site-header">
      <div className="container nav-bar">
        <Link href="/" className="brand" aria-label="Lab Science Unfiltered home">
          <BrandMark />
          <span>
            lab science
            <span className="brand-second">
              unfiltered<span className="brand-dot">.</span>
            </span>
          </span>
        </Link>
        <nav aria-label="Main navigation" className={open ? 'main-nav open' : 'main-nav'}>
          {links.map(({ href, label, external }) =>
            external ? (
              <a key={href} href={href} target="_blank" rel="noreferrer">
                {label} <ArrowUpRight size={14} />
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                className={path.startsWith(href) ? 'active' : ''}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ),
          )}
        </nav>
        <div className="nav-actions">
          {search && (
            <Link href="/learn#search" className="icon-button" aria-label="Search lessons">
              <Search size={19} />
            </Link>
          )}
          <button
            className="icon-button theme-toggle"
            onClick={toggle}
            aria-label={dark ? 'Use light theme' : 'Use dark theme'}
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <Link href={cta.href} className="button button-small nav-cta">
            {cta.label} <ArrowUpRight size={16} />
          </Link>
          <button
            className="icon-button mobile-menu"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
