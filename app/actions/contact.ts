"use server";

import { Resend } from "resend";

/**
 * Estado del formulario de contacto, devuelto por `sendContactMessage` y
 * consumido con `useActionState` en `components/contact-form.tsx`.
 *
 * `"idle"` es solo el estado inicial: la acción nunca lo devuelve.
 * `"invalid"` (validación) y `"error"` (envío o configuración) se separan
 * porque el formulario los pinta distinto: el primero sacude, el segundo no.
 */
export interface ContactState {
  status: "idle" | "ok" | "invalid" | "error";
  message?: string;
  sentName?: string;
  /**
   * Lo que el visitante había escrito. React vacía el `<form>` al completarse
   * una Server Action, así que sin esto un fallo obligaría a reescribirlo todo.
   */
  values?: {
    name: string;
    email: string;
    message: string;
  };
}

// Un módulo `"use server"` solo puede exportar funciones async, así que el
// estado inicial vive en el componente que lo consume, no aquí.

const MAX_NAME = 80;
const MAX_MESSAGE = 2000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function sendContactMessage(
  prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const honeypot = String(formData.get("website") ?? "").trim();

  const values = { name, email, message };

  // Honeypot: un bot no debe distinguir el rechazo del éxito, así que se
  // responde igual que un envío correcto pero sin enviar nada.
  if (honeypot) {
    return { status: "ok", sentName: name || "PLAYER" };
  }

  if (!name || !email || !message) {
    return {
      status: "invalid",
      message: "Rellena los tres campos antes de enviar.",
      values,
    };
  }

  if (!EMAIL_RE.test(email)) {
    return {
      status: "invalid",
      message: "El correo electrónico no tiene un formato válido.",
      values,
    };
  }

  if (name.length > MAX_NAME) {
    return {
      status: "invalid",
      message: `El nombre no puede pasar de ${MAX_NAME} caracteres.`,
      values,
    };
  }

  if (message.length > MAX_MESSAGE) {
    return {
      status: "invalid",
      message: `El mensaje no puede pasar de ${MAX_MESSAGE} caracteres.`,
      values,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !from || !to) {
    return {
      status: "error",
      message: "Servicio de correo no configurado.",
      values,
    };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `[Arcade Vault] Mensaje de ${name}`,
      text: `Nombre: ${name}\nCorreo: ${email}\n\n${message}\n`,
    });

    // El detalle del error se queda en el servidor: a la interfaz solo va un
    // texto genérico, sin filtrar nada de la cuenta ni de la clave.
    if (error) {
      console.error("[contacto] Resend devolvió un error:", error);
      return {
        status: "error",
        message: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
        values,
      };
    }
  } catch (err) {
    console.error("[contacto] Fallo al llamar a Resend:", err);
    return {
      status: "error",
      message: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
      values,
    };
  }

  return { status: "ok", sentName: name };
}
