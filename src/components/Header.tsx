import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

interface HeaderProps {
  user: {name: string} | null;
  onLogout: () => void;
  onLoginClick?: () => void;
}

export const Header = ({ user, onLogout, onLoginClick }: HeaderProps) => {
  const navLinks = [
    { label: 'Pricing', href: '#' },
    { label: 'Docs', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'cto bench', href: '#' },
    { label: 'New', href: '#', isNew: true },
  ];

  return (
    <header className="sticky top-0 z-50 flex h-[64px] items-center justify-between border-b border-b-transparent bg-cto-cream/80 backdrop-blur-md px-6 xl:px-10">
      {/* Logo */}
      <div className="w-80 flex items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold tracking-tight text-cto-black">cto.new</span>
        </Link>
      </div>

      {/* Navigation (Center) */}
      <nav className="flex-1 hidden xl:flex items-center justify-center space-x-8">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-sm font-medium text-cto-black/50 hover:text-cto-black transition-colors flex items-center"
          >
            {link.label}
            {link.isNew && (
              <span className="ml-1 rounded-full bg-cto-blue/10 px-1.5 py-0.5 text-[10px] text-cto-blue uppercase font-bold">
                New
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Actions (Right) */}
      <div className="w-80 flex items-center justify-end space-x-4">
        {user ? (
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-sm font-bold text-cto-blue hover:text-blue-700 mr-2">
              Dashboard
            </Link>
            <span className="text-sm font-medium text-cto-black/70">Hi, {user.name}</span>
            <Button
              onClick={onLogout}
              variant="ghost"
              className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 h-8"
            >
              Sign out
            </Button>
          </div>
        ) : (
          <div className="hidden xl:flex items-center space-x-4">
            <button
              onClick={onLoginClick}
              className="text-sm font-medium text-cto-black/50 hover:text-cto-black transition-colors"
            >
              Sign in
            </button>
            <Button
              onClick={onLoginClick}
              className="rounded-[10px] bg-cto-black px-4 py-2 text-sm font-medium text-cto-white hover:bg-cto-black/90 h-auto"
            >
              Sign up
            </Button>
          </div>
        )}
        
        {/* Mobile Menu Toggle (Simplified) */}
        <button className="xl:hidden p-2 text-cto-black/50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
};
