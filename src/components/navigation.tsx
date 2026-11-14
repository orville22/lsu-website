'use client';
import Link from 'next/link';
import { readDraft, writeDraft } from '@/lib/browser-storage';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowUpRight, Menu, X, Sun, Moon, FlaskConical, Search } from 'lucide-react';
const links = [
  ['/learn', 'Learn'],
  ['/practice', 'Practice'],
  ['/cases', 'Clinical cases'],
  ['/watch', 'Watch'],
];
export function Navigation() {
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
          <span className="brand-mark">
            <FlaskConical size={24} />
          </span>
          <span>
            lab science
            <span className="brand-second">
              unfiltered<span className="brand-dot">.</span>
            </span>
          </span>
        </Link>
        <nav aria-label="Main navigation" className={open ? 'main-nav open' : 'main-nav'}>
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={path.startsWith(href) ? 'active' : ''}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link href="/#about" onClick={() => setOpen(false)}>
            About LSU
          </Link>
        </nav>
        <div className="nav-actions">
          <Link href="/learn#search" className="icon-button" aria-label="Search lessons">
            <Search size={19} />
          </Link>
          <button
            className="icon-button theme-toggle"
            onClick={toggle}
            aria-label={dark ? 'Use light theme' : 'Use dark theme'}
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <Link href="/practice" className="button button-small nav-cta">
            Let’s practise <ArrowUpRight size={16} />
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
