import type { ReactNode } from "react";

type SectionShellProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  tone?: "light" | "mist" | "dark";
};

export function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
  tone = "light",
}: SectionShellProps) {
  const toneClass =
    tone === "dark"
      ? "bg-graphite-950 text-white"
      : tone === "mist"
        ? "bg-inema-mist text-graphite-950"
        : "bg-white text-graphite-950";

  return (
    <section id={id} className={`scroll-mt-24 py-20 sm:py-24 ${toneClass}`}>
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p
              className={`mb-4 text-sm font-bold uppercase tracking-[0.18em] ${
                tone === "dark" ? "text-inema-gold" : "text-inema-blue"
              }`}
            >
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-balance text-3xl font-bold tracking-normal sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          {description ? (
            <p
              className={`mt-5 text-lg leading-8 ${
                tone === "dark" ? "text-white/74" : "text-graphite-700"
              }`}
            >
              {description}
            </p>
          ) : null}
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
