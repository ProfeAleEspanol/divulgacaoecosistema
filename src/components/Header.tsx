"use client";

import { useState } from "react";
import { siteContent } from "@/data/site-content";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-graphite-900/10 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <a
          href="#topo"
          className="flex items-center gap-3 rounded-[8px] text-graphite-950"
          aria-label="Voltar ao início"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-graphite-950 text-sm font-bold tracking-[0.12em] text-inema-gold">
            IN
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold tracking-[0.16em]">
              {siteContent.brand.logoText}
            </span>
            <span className="block text-xs font-medium uppercase tracking-[0.18em] text-graphite-500">
              {siteContent.brand.descriptor}
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {siteContent.navigation.map((item) => (
            <a
              key={item.href}
              className="text-sm font-semibold text-graphite-700 transition hover:text-inema-blue"
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="#formulario"
            className="rounded-[8px] bg-graphite-950 px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-inema-blue"
          >
            {siteContent.hero.primaryCta}
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] border border-graphite-900/10 bg-white text-graphite-950 lg:hidden"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
            <span
              className={`h-0.5 rounded-full bg-current transition ${
                isOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 rounded-full bg-current transition ${
                isOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 rounded-full bg-current transition ${
                isOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-graphite-900/10 bg-white px-5 py-5 lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2" aria-label="Menu móvel">
            {siteContent.navigation.map((item) => (
              <a
                key={item.href}
                className="rounded-[8px] px-3 py-3 text-base font-semibold text-graphite-800 hover:bg-graphite-50"
                href={item.href}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#formulario"
              className="mt-2 rounded-[8px] bg-graphite-950 px-5 py-3 text-center text-sm font-bold text-white"
              onClick={() => setIsOpen(false)}
            >
              {siteContent.hero.primaryCta}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
