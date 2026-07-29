import Image from "next/image";
import { Header } from "@/components/Header";
import { InterestForm } from "@/components/InterestForm";
import { SectionShell } from "@/components/SectionShell";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { LinkKey, siteContent } from "@/data/site-content";
import { getWhatsAppHref } from "@/lib/whatsapp";

export default function Home() {
  return (
    <>
      <Header />
      <main id="topo">
        <Hero />
        <OverviewSection />
        <BusinessSection />
        <MethodSection />
        <ProjectsSection />
        <PracticalBuildSection />
        <PresenceSection />
        <FounderSection />
        <EcosystemSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 section-grid opacity-70" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-inema-mist to-transparent" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.94fr_1.06fr] lg:px-8 lg:py-24">
        <div className="flex min-w-0 flex-col justify-center">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-inema-blue">
            {siteContent.hero.eyebrow}
          </p>
          <h1 className="text-balance text-4xl font-bold tracking-normal text-graphite-950 sm:text-5xl lg:text-6xl">
            {siteContent.hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-graphite-700 sm:text-xl">
            {siteContent.hero.subtitle}
          </p>
          <p className="mt-5 text-sm font-bold uppercase tracking-[0.16em] text-graphite-500">
            {siteContent.hero.support}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#formulario"
              className="rounded-[8px] bg-graphite-950 px-6 py-4 text-center text-base font-bold text-white shadow-soft transition hover:bg-inema-blue"
            >
              {siteContent.hero.primaryCta}
            </a>
            <a
              href="#ecossistema"
              className="rounded-[8px] border border-graphite-900/15 bg-white px-6 py-4 text-center text-base font-bold text-graphite-950 shadow-line transition hover:border-inema-blue hover:text-inema-blue"
            >
              {siteContent.hero.secondaryCta}
            </a>
          </div>
          <div className="mt-10 rounded-[8px] border border-graphite-900/10 bg-white/86 p-5 shadow-line">
            <p className="text-sm font-semibold leading-6 text-graphite-700">
              Uma apresentação única para empresas entenderem o que o INEMA já
              reúne: educação, comunidade, treinamentos, imersivos, conteúdo e
              construção prática com Inteligência Artificial.
            </p>
          </div>
        </div>

        <figure className="relative min-w-0">
          <div className="absolute -left-5 top-8 h-24 w-24 border-l border-t border-inema-gold/60" aria-hidden="true" />
          <div className="absolute -bottom-5 right-6 h-24 w-24 border-b border-r border-inema-teal/50" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-[8px] border border-graphite-900/10 bg-graphite-950 shadow-soft">
            <Image
              src={siteContent.media.heroImage.src}
              alt={siteContent.media.heroImage.alt}
              width={1680}
              height={944}
              className="aspect-[16/10] h-full w-full object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-graphite-950/62 via-transparent to-transparent" />
            <figcaption className="absolute bottom-0 left-0 right-0 p-4 text-xs leading-5 text-white/80">
              {siteContent.media.heroImage.caption}
            </figcaption>
          </div>
        </figure>
      </div>
    </section>
  );
}

function OverviewSection() {
  return (
    <SectionShell
      id="visao-geral"
      eyebrow="Visão geral"
      title={siteContent.quickIntro.title}
      description={siteContent.quickIntro.text.join(" ")}
      tone="mist"
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[8px] bg-graphite-950 p-8 text-white">
          <p className="text-xl font-semibold leading-9">
            {siteContent.positioning.statement}
          </p>
          <div className="mt-8 grid gap-3">
            {siteContent.positioning.selectedPhrases.map((phrase) => (
              <span
                key={phrase}
                className="rounded-[8px] border border-white/12 px-4 py-3 text-sm font-semibold text-white/82"
              >
                {phrase}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {siteContent.quickIntro.bring.map((item) => (
            <SimpleCard key={item} title={item} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function BusinessSection() {
  return (
    <SectionShell
      id="empresas"
      eyebrow="Para empresas"
      title="Uma estrutura para educar pessoas, organizar oportunidades e construir aplicações reais com IA."
      description="O INEMA ajuda empresas a sair da curiosidade dispersa e avançar para diagnóstico, capacitação, comunidade, imersão e execução prática."
      tone="dark"
    >
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <h3 className="text-xl font-bold text-white">
            Quando o INEMA pode ajudar
          </h3>
          <div className="mt-5 grid gap-4">
            {siteContent.problems.map((problem) => (
              <div
                key={problem}
                className="rounded-[8px] border border-white/12 bg-white/[0.04] p-5"
              >
                <p className="font-semibold leading-7 text-white/86">
                  {problem}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">O que o ecossistema entrega</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {siteContent.valueItems.map((item) => (
              <div
                key={item}
                className="rounded-[8px] border border-white/12 bg-white/[0.04] p-5"
              >
                <p className="text-sm font-semibold leading-6 text-white/86">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function MethodSection() {
  return (
    <SectionShell
      id="metodo"
      eyebrow="Método"
      title="Três movimentos para transformar IA em prática"
      description="As frentes podem variar conforme a empresa, mas a lógica central combina clareza, educação e construção contínua."
      tone="mist"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {siteContent.methodology.map((movement, index) => (
          <article
            key={movement.title}
            className="rounded-[8px] border border-graphite-900/10 bg-white p-7 shadow-line"
          >
            <span className="text-sm font-bold uppercase tracking-[0.16em] text-inema-blue">
              Movimento {index + 1}
            </span>
            <h3 className="mt-4 text-2xl font-bold text-graphite-950">
              {movement.title}
            </h3>
            <p className="mt-4 leading-7 text-graphite-700">
              {movement.description}
            </p>
            <ul className="mt-6 grid gap-3">
              {movement.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm font-semibold text-graphite-700"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-inema-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function ProjectsSection() {
  return (
    <SectionShell
      id="projetos"
      eyebrow="Caminhos possíveis"
      title="O ecossistema conecta educação, comunidade e construção"
      description="A mesma estrutura pode apoiar desde um primeiro contato com IA até programas de capacitação, imersivos e projetos aplicados."
    >
      <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-[8px] bg-graphite-950 p-7 text-white shadow-soft">
          <h3 className="text-xl font-bold">Frentes do INEMA</h3>
          <div className="mt-5 grid gap-3">
            {siteContent.immersiveTypes.map((item) => (
              <span key={item} className="text-sm font-semibold leading-6 text-white/80">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {siteContent.projectExamples.map((project) => (
            <SimpleCard key={project} title={project} tone="subtle" />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function PracticalBuildSection() {
  return (
    <SectionShell
      id="construcao"
      eyebrow="Execução"
      title={siteContent.vibeCode.title}
      description={siteContent.vibeCode.description}
      tone="mist"
    >
      <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="rounded-[8px] bg-graphite-950 p-8 text-white angled-lines">
          <p className="text-xl font-semibold leading-9">
            {siteContent.vibeCode.plainLanguage}
          </p>
          <p className="mt-6 text-sm leading-6 text-white/72">
            O formato pode ser ajustado para palestra aplicada, treinamento,
            imersivo, mentoria de projeto ou construção acompanhada.
          </p>
          <a
            href="#formulario"
            className="mt-8 inline-flex rounded-[8px] bg-inema-gold px-5 py-3 text-sm font-bold text-graphite-950 transition hover:bg-white"
          >
            Quero conversar sobre minha empresa
          </a>
        </div>
        <div className="grid gap-5">
          {siteContent.vibeCode.days.map((day) => (
            <article
              key={day.title}
              className="rounded-[8px] border border-graphite-900/10 bg-white p-6 shadow-line"
            >
              <h3 className="text-xl font-bold text-graphite-950">{day.title}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {day.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-[8px] bg-graphite-50 px-3 py-2 text-sm font-semibold text-graphite-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function PresenceSection() {
  return (
    <SectionShell
      id="presencial"
      eyebrow="Presencial"
      title={siteContent.canela.title}
      description={siteContent.canela.description}
      tone="dark"
    >
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <blockquote className="rounded-[8px] border border-white/12 bg-white/[0.04] p-8 text-2xl font-semibold leading-10 text-white">
          “{siteContent.canela.quote}”
        </blockquote>
        <div className="grid gap-4">
          {siteContent.canela.items.map((item) => (
            <div key={item} className="rounded-[8px] border border-white/12 p-5">
              <p className="font-semibold leading-7 text-white/84">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function FounderSection() {
  return (
    <SectionShell
      id="nei"
      eyebrow="Condução"
      title={siteContent.nei.title}
      description={siteContent.nei.description}
      tone="mist"
    >
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[8px] bg-white p-7 shadow-line">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-inema-blue">
            {siteContent.nei.role}
          </p>
          <p className="mt-5 text-lg font-semibold leading-8 text-graphite-800">
            {siteContent.nei.experienceSummary}
          </p>
          <div className="mt-7 border-t border-graphite-900/10 pt-6">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-graphite-500">
              Experiência prática
            </p>
            <ul className="mt-4 grid gap-3">
              {siteContent.nei.experienceItems.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm font-semibold leading-6 text-graphite-700"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-inema-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {siteContent.nei.bullets.map((item) => (
            <SimpleCard key={item} title={item} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function EcosystemSection() {
  const whatsappHref = getWhatsAppHref(
    siteContent.contacts.whatsappNumber,
    "Olá, Tiza. Quero acessar ou entender melhor as frentes do Ecossistema INEMA.",
  );

  return (
    <SectionShell
      id="ecossistema"
      eyebrow="Ecossistema"
      title="As frentes que concentram o movimento INEMA"
      description="A empresa pode começar pelo conteúdo aberto, aprofundar nas trilhas, acompanhar a comunidade ou conversar sobre um formato personalizado."
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {siteContent.ecosystem.map((item) => {
          const href = siteContent.links[item.hrefKey as LinkKey];
          const fallbackHref = href ?? whatsappHref;

          return (
            <article
              key={item.name}
              className="rounded-[8px] border border-graphite-900/10 bg-white p-6 shadow-line"
            >
              <h3 className="text-xl font-bold text-graphite-950">{item.name}</h3>
              <p className="mt-4 text-sm leading-7 text-graphite-700">
                {item.description}
              </p>
              {fallbackHref ? (
                <a
                  className="mt-5 inline-flex text-sm font-bold text-inema-blue hover:text-graphite-950"
                  href={fallbackHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  {href ? "Acessar" : "Solicitar acesso"}
                </a>
              ) : null}
            </article>
          );
        })}
      </div>
      <p className="mt-6 text-sm leading-6 text-graphite-600">
        Alguns acessos e formatos dependem do objetivo da empresa e devem ser
        alinhados em conversa com a equipe INEMA.
      </p>
    </SectionShell>
  );
}

function FaqSection() {
  return (
    <SectionShell
      id="faq"
      eyebrow="Perguntas frequentes"
      title="Respostas diretas antes da primeira conversa"
      tone="mist"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {siteContent.faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-[8px] border border-graphite-900/10 bg-white p-5 shadow-line"
          >
            <summary className="cursor-pointer list-none text-lg font-bold text-graphite-950">
              <span className="inline-flex w-full items-start justify-between gap-4">
                {faq.question}
                <span className="mt-1 text-inema-blue transition group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-4 leading-7 text-graphite-700">{faq.answer}</p>
          </details>
        ))}
      </div>
    </SectionShell>
  );
}

function ContactSection() {
  return (
    <section id="formulario" className="scroll-mt-24 bg-white py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-inema-blue">
            Contato comercial
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-normal text-graphite-950 sm:text-4xl lg:text-5xl">
            {siteContent.form.title}
          </h2>
          <p className="mt-5 text-lg leading-8 text-graphite-700">
            {siteContent.form.description}
          </p>
          <a
            href={`mailto:${siteContent.contacts.email}`}
            className="mt-8 inline-flex rounded-[8px] border border-graphite-900/15 px-5 py-3 text-sm font-bold text-graphite-950 hover:border-inema-blue hover:text-inema-blue"
          >
            {siteContent.contacts.email}
          </a>
        </div>
        <InterestForm />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-graphite-950 py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-base font-bold tracking-[0.16em]">
            {siteContent.brand.name}
          </p>
          <p className="mt-2 text-sm text-white/62">
            Inteligência Artificial, educação, comunidade e construção prática.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-white/72">
          {siteContent.navigation.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-white">
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function SimpleCard({
  title,
  tone = "default",
}: {
  title: string;
  tone?: "default" | "subtle";
}) {
  return (
    <article
      className={`rounded-[8px] border border-graphite-900/10 p-5 shadow-line ${
        tone === "subtle" ? "bg-graphite-50" : "bg-white"
      }`}
    >
      <p className="font-semibold leading-7 text-graphite-800">{title}</p>
    </article>
  );
}
