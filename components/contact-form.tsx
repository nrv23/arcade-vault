"use client";

import { useActionState, useState } from "react";
import type { FormEvent } from "react";
import { sendContactMessage, type ContactState } from "@/app/actions/contact";

const INITIAL: ContactState = { status: "idle" };

// Duración de la sacudida, igual que en la plantilla.
const SHAKE_MS = 400;

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContactMessage,
    INITIAL,
  );
  const [shake, setShake] = useState(false);
  // `useActionState` no expone un reinicio del estado, así que "ENVIAR OTRO
  // MENSAJE" se resuelve aquí: se oculta la terminal y se remonta el
  // formulario con una `key` nueva para que salga vacío.
  const [reset, setReset] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Validación de cliente: conserva la sacudida de la plantilla y evita un
  // viaje al servidor. Cancelar el submit impide que React dispare la acción.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    setDismissed(false);
    const data = new FormData(e.currentTarget);
    const filled = ["name", "email", "message"].every((field) =>
      String(data.get(field) ?? "").trim(),
    );
    if (!filled) {
      e.preventDefault();
      setShake(true);
      setTimeout(() => setShake(false), SHAKE_MS);
    }
  };

  if (state.status === "ok" && !dismissed) {
    return (
      <ContactSuccess
        name={state.sentName ?? "PLAYER"}
        onReset={() => {
          setDismissed(true);
          setReset((n) => n + 1);
        }}
      />
    );
  }

  const showError = state.status === "invalid" || state.status === "error";

  return (
    <form
      key={reset}
      className={"contact-form" + (shake ? " shake" : "")}
      action={formAction}
      onSubmit={onSubmit}
    >
      <div className="field">
        <label htmlFor="contact-name">NOMBRE</label>
        <input
          id="contact-name"
          name="name"
          defaultValue={state.values?.name}
          placeholder="px_kai"
        />
      </div>
      <div className="field">
        <label htmlFor="contact-email">CORREO ELECTRÓNICO</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          defaultValue={state.values?.email}
          placeholder="jugador@vault.gg"
        />
      </div>
      <div className="field">
        <label htmlFor="contact-message">MENSAJE</label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          defaultValue={state.values?.message}
          placeholder="Cuéntanos qué tienes en mente…"
        />
      </div>

      {/* Honeypot: invisible para una persona, tentador para un bot. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">No rellenes este campo</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {showError && (
        <div className="contact-error pixel" role="alert">
          {state.message}
        </div>
      )}

      <button className="btn xl press w-full" type="submit" disabled={pending}>
        {pending ? "▶  ENVIANDO…" : "▶  ENVIAR MENSAJE"}
      </button>
    </form>
  );
}

function ContactSuccess({
  name,
  onReset,
}: {
  name: string;
  onReset: () => void;
}) {
  return (
    <div className="terminal-success">
      <div className="term-bar">
        <span className="dot r" />
        <span className="dot y" />
        <span className="dot g" />
        <span className="term-title">VAULT-OS // TERMINAL</span>
      </div>
      <div className="term-body">
        <div className="line">
          <span className="prompt">vault@arcade:~$</span> ./send_message
          --to=team
        </div>
        <div className="line dim">[OK] Conectando con servidor…</div>
        <div className="line dim">[OK] Validando contenido…</div>
        <div className="line dim">[OK] Transmitiendo paquete…</div>
        <div className="line success">
          &gt; MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS,{" "}
          {name.toUpperCase()}.<span className="caret">_</span>
        </div>
        <div className="mt-[18px]">
          <button className="btn ghost" type="button" onClick={onReset}>
            ENVIAR OTRO MENSAJE
          </button>
        </div>
      </div>
    </div>
  );
}
