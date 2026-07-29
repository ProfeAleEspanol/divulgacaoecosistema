"use client";

import { FormEvent, useState } from "react";
import { siteContent } from "@/data/site-content";
import { InterestLead, submitInterestLead } from "@/lib/submit-interest";

type FormStatus =
  | { state: "idle"; message: "" }
  | { state: "submitting"; message: string }
  | {
      state: "success";
      message: string;
      mode: "api" | "whatsapp";
      reference: string;
      href?: string;
    }
  | { state: "error"; message: string };

const initialStatus: FormStatus = { state: "idle", message: "" };

export function InterestForm() {
  const [status, setStatus] = useState<FormStatus>(initialStatus);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.reportValidity()) {
      return;
    }

    const data = new FormData(form);
    const payload: InterestLead = {
      name: String(data.get("name") ?? "").trim(),
      whatsapp: String(data.get("whatsapp") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      cityState: String(data.get("cityState") ?? "").trim(),
      profession: String(data.get("profession") ?? "").trim(),
      aiLevel: String(data.get("aiLevel") ?? "").trim(),
      project: String(data.get("project") ?? "").trim(),
      immersiveInterest: String(data.get("immersiveInterest") ?? "").trim(),
      periodPreference: String(data.get("periodPreference") ?? "").trim(),
      notes: String(data.get("notes") ?? "").trim(),
      consent: data.get("consent") === "on",
    };

    setStatus({ state: "submitting", message: "Enviando interesse..." });

    try {
      const result = await submitInterestLead(payload);
      if (result.mode === "whatsapp" && result.href) {
        window.open(result.href, "_blank", "noopener,noreferrer");
      }
      setStatus({
        state: "success",
        message: siteContent.form.successMessage,
        mode: result.mode,
        reference: result.reference,
        href: result.href,
      });
      form.reset();
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar o formulário agora.",
      });
    }
  }

  return (
    <form
      className="grid gap-5 rounded-[8px] border border-graphite-900/10 bg-white p-5 shadow-soft sm:p-7"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Nome" name="name" autoComplete="name" required />
        <Field
          label="WhatsApp"
          name="whatsapp"
          autoComplete="tel"
          placeholder="DDD + número"
          required
        />
        <Field
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <Field
          label="Empresa ou instituição"
          name="cityState"
          autoComplete="organization"
          required
        />
        <Field
          label="Cargo ou área de atuação"
          name="profession"
          autoComplete="organization-title"
          required
        />
        <Select label="Nível atual de uso de IA" name="aiLevel" required>
          {siteContent.form.aiLevels.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </div>

      <TextArea
        label="O que sua empresa quer desenvolver ou resolver com IA?"
        name="project"
        rows={4}
        required
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Select label="Frente de maior interesse" name="immersiveInterest" required>
          {siteContent.form.immersiveInterests.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <Select label="Melhor momento para conversar" name="periodPreference" required>
          {siteContent.form.periodPreferences.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </div>

      <TextArea label="Observações ou contexto adicional" name="notes" rows={3} />

      <label className="flex gap-3 rounded-[8px] border border-graphite-900/10 bg-graphite-50 p-4 text-sm leading-6 text-graphite-700">
        <input
          className="mt-1 h-4 w-4 accent-inema-blue"
          type="checkbox"
          name="consent"
          required
        />
        <span>
          Autorizo o contato da equipe INEMA pelos dados informados para receber
          informações sobre o ecossistema, propostas, treinamentos, imersivos e
          projetos com IA.
        </span>
      </label>

      {status.state !== "idle" ? (
        <div
          className={`rounded-[8px] border p-4 text-sm leading-6 ${
            status.state === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : status.state === "success"
                ? "border-inema-teal/30 bg-inema-teal/10 text-graphite-800"
                : "border-inema-blue/20 bg-inema-blue/10 text-graphite-800"
          }`}
          role="status"
        >
          <p>{status.message}</p>
          {status.state === "success" && status.mode === "whatsapp" && status.href ? (
            <a
              className="mt-2 inline-flex font-bold text-inema-blue hover:text-graphite-950"
              href={status.href}
              target="_blank"
              rel="noreferrer"
            >
              Abrir WhatsApp novamente
            </a>
          ) : null}
          {status.state === "success" ? (
            <p className="mt-2 font-semibold">Protocolo: {status.reference}</p>
          ) : null}
        </div>
      ) : null}

      <button
        className="rounded-[8px] bg-graphite-950 px-6 py-4 text-base font-bold text-white shadow-soft transition hover:bg-inema-blue disabled:cursor-not-allowed disabled:opacity-70"
        type="submit"
        disabled={status.state === "submitting"}
      >
        {status.state === "submitting" ? "Preparando..." : "Falar com a Tiza"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-graphite-800">
      {label}
      <input
        className="min-h-12 rounded-[8px] border border-graphite-900/12 bg-white px-4 text-base font-normal text-graphite-950 shadow-line transition placeholder:text-graphite-300 focus:border-inema-blue"
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
    </label>
  );
}

function Select({
  label,
  name,
  required,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-graphite-800">
      {label}
      <select
        className="min-h-12 rounded-[8px] border border-graphite-900/12 bg-white px-4 text-base font-normal text-graphite-950 shadow-line transition focus:border-inema-blue"
        name={name}
        required={required}
        defaultValue=""
      >
        <option value="" disabled>
          Selecione
        </option>
        {children}
      </select>
    </label>
  );
}

function TextArea({
  label,
  name,
  rows,
  required,
}: {
  label: string;
  name: string;
  rows: number;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-graphite-800">
      {label}
      <textarea
        className="min-h-28 resize-y rounded-[8px] border border-graphite-900/12 bg-white px-4 py-3 text-base font-normal leading-7 text-graphite-950 shadow-line transition placeholder:text-graphite-300 focus:border-inema-blue"
        name={name}
        rows={rows}
        required={required}
      />
    </label>
  );
}
