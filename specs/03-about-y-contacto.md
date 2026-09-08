# SPEC 03 — Acerca de y formulario de contacto con envío real

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 02
> **Fecha:** 2026-09-07
> **Objetivo:** Portar `references/templates/home-about/about.jsx` a la ruta `/about` y hacer que su formulario de contacto envíe el mensaje por correo de verdad a través de Resend.

## Por qué existe esta spec

La tanda de plantillas `references/templates/home-about/` traía dos pantallas nuevas. SPEC 02 portó la primera, la landing. Esta porta la segunda: el **Acerca de**, que incluye un formulario de contacto.

En la plantilla ese formulario es decorativo — valida que los tres campos no estén vacíos y pinta una terminal de éxito sin llamar a ningún servidor. Aquí el envío es real: el mensaje llega a una bandeja de correo mediante Resend. Es el primer código de servidor del proyecto y su primera dependencia de producción.

### Corrección a SPEC 02

SPEC 02 afirma en su alcance que el Acerca de arrastra los bloques CSS `GAMEPAD` y `Theme variants` (unas 470 líneas) y que por eso se aplazaba. Es incorrecto: ninguna plantilla usa esas clases — cero coincidencias de `gp-` o `class="gp"` en los `.jsx` de `references/templates/` y en `arcade-vault-standalone.html`. El Acerca de solo necesita el bloque `ABOUT PAGE` (líneas 1071–1150 de `references/templates/home-about/styles.css`). Los dos bloques de gamepad quedan **fuera del proyecto**, no aplazados a otra spec.

## Alcance

**Dentro:**

- Nueva ruta `/about` con las dos secciones de `about.jsx`: hero con misión y tres destacados, y sección de contacto con su formulario, separadas por el divisor de píxeles animado.
- Enlace `Acerca de` en la navegación de escritorio y en el panel móvil.
- Port del bloque CSS `ABOUT PAGE` a `app/globals.css`.
- Server Action que valida el mensaje y lo envía con Resend.
- Variables de entorno para la clave de API, el remitente y el destinatario, más un `.env.example` que las documente.
- Estados que la plantilla no tiene y el envío real exige: carga, error de envío y error de configuración.
- Honeypot antispam.

**Fuera de alcance (para futuras specs):**

- Los bloques CSS `GAMEPAD` y `Theme variants`. No los usa nadie; no entran nunca.
- Correo de acuse de recibo al visitante. Solo se envía el aviso al equipo.
- Persistir los mensajes recibidos. No hay base de datos.
- Rate limiting con almacén de estado (por IP o por sesión). Aquí solo hay honeypot y validación.
- Verificación de dominio propio en Resend.
- Backend, base de datos y autenticación real: siguen fuera, como en SPEC 01 y 02.
- Tests. El repositorio sigue sin framework de tests.

## Mapa de rutas

| Ruta | Estado |
| --- | --- |
| `/` | Landing (SPEC 02), sin cambios |
| `/games` | Biblioteca, sin cambios |
| `/juegos/[id]` y `/juegos/[id]/jugar` | Sin cambios |
| `/salon` | Sin cambios |
| `/auth` | Sin cambios |
| `/about` | **Nueva** |

La ruta va en inglés, `/about`, por coherencia con `/games`, que se fijó en SPEC 02. La inconsistencia con `/juegos` y `/salon` sigue siendo consciente y se resolverá, si se resuelve, en la spec que unifique el idioma de las rutas.

En `components/nav.tsx` el enlace se coloca **después** de `Salón de la Fama`, como en `references/templates/home-about/nav.jsx:20`, en los dos menús, con `isAbout = pathname === "/about"`.

## Estrategia de estilos

Se mantiene la regla de SPEC 01 y 02: `app/globals.css` es la capa de tema y replica `references/templates/*/styles.css` sección a sección, en el mismo orden y con el mismo comentario de cabecera. El bloque nuevo se anexa al final sin reescribirse a utilidades de Tailwind.

| Bloque en `home-about/styles.css` | Líneas | Clases |
| --- | --- | --- |
| `/* ===== ABOUT PAGE ===== */` | 1071–1150 | `.about`, `.about-hero`, `.about-title`, `.about-mission`, `.highlight-row`, `.highlight`, `.hl-icon`, `.hl-text`, `.about-divider`, `.div-bar`, `.div-pixels`, `@keyframes pxblink`, `.about-contact`, `.contact-grid`, `.contact-intro`, `.contact-title`, `.contact-sub`, `.contact-tips`, `.tip`, `.tip-led`, `.contact-form`, `.contact-form.shake`, `@keyframes shake`, `.contact-form textarea`, `.btn.press`, `.terminal-success`, `.term-bar`, `.dot`, `.term-title`, `.term-body`, `.line`, `.prompt`, `.dim`, `.success`, `.caret` |

De la cola del bloque se omite `.divider`, que **ya existe** en `app/globals.css`.

`.field`, `.field label` y `.field input` también existen ya (`app/globals.css:843`), portadas en SPEC 01 desde el bloque `auth`. El formulario de contacto las reutiliza tal cual; lo único nuevo para los campos es el estilo de `textarea`.

No hacen falta tokens nuevos: el bloque usa solo variables ya declaradas (`--cyan`, `--magenta`, `--yellow`, `--green`, `--ink`, `--ink-dim`, `--ink-faint`, `--bg`, `--bg-2`, `--line`, `--pixel`, `--mono`). **No se toca `:root` ni el bloque `@theme inline`**, y no se crea `tailwind.config.js`.

## Modelo de datos

Esta funcionalidad no añade datos de escaparate a `app/data.ts`: los textos del Acerca de son literales de la plantilla y viven en el componente, igual que los de la landing.

Sí añade un tipo de estado para el formulario, en `app/actions/contact.ts` junto a la acción que lo devuelve:

```ts
export interface ContactState {
  status: "idle" | "ok" | "invalid" | "error";
  message?: string;   // texto a mostrar cuando status es "invalid" o "error"
  sentName?: string;  // nombre a mostrar en la terminal de éxito
  values?: {          // lo escrito, para repoblar el formulario tras un fallo
    name: string;
    email: string;
    message: string;
  };
}
```

`"idle"` es solo el estado inicial que recibe `useActionState`; la acción nunca lo devuelve. Se separan `"invalid"` (validación de servidor: falta un campo, correo mal formado, texto demasiado largo) de `"error"` (fallo de envío o de configuración) porque el formulario los trata distinto: el primero sacude y señala el campo, el segundo muestra la fila de error sin sacudir.

`values` existe por una razón concreta: al completarse una Server Action, React reinicia el `<form>` y los campos no controlados se vacían. Devolviendo lo escrito y pasándolo como `defaultValue` de cada campo, un fallo no obliga a reescribir el mensaje. En el camino `"ok"` se omite, porque ahí el formulario se sustituye por la terminal.

Los tres destacados del hero se declaran como constante local tipada en `components/about.tsx`, con `kind` como unión (`"HEART" | "BROWSER" | "PLANT"`), igual que se hizo con `FeatureIcon` en SPEC 02.

## Configuración y variables de entorno

Tres variables, ninguna con prefijo `NEXT_PUBLIC_`: solo se leen en servidor.

| Variable | Contenido |
| --- | --- |
| `RESEND_API_KEY` | Clave de API de Resend |
| `CONTACT_FROM_EMAIL` | Dirección remitente |
| `CONTACT_TO_EMAIL` | Dirección que recibe los mensajes |

`.gitignore` ya ignora `.env*`, así que la clave real vive en `.env.local` y nunca se versiona. Ese mismo patrón ignora también `.env.example`, así que hay que **añadir una excepción a `.gitignore`** justo debajo:

```gitignore
# env files (can opt-in for committing if needed)
.env*
!.env.example
```

Sin esa línea el archivo de ejemplo no se puede versionar y el criterio de aceptación correspondiente es imposible de cumplir.

La plantilla, con la clave vacía:

```bash
# Clave de API de Resend. Pégala en .env.local, nunca aquí.
RESEND_API_KEY=
# Remitente. Debe pertenecer a un dominio verificado en Resend;
# alternativa sin dominio propio: onboarding@resend.dev
CONTACT_FROM_EMAIL=nrv23@gmail.com
# Destinatario de los mensajes del formulario de contacto.
CONTACT_TO_EMAIL=nrv23@gmail.com
```

Las tres variables se documentan también en `CLAUDE.md`, porque sin ellas el formulario no funciona y `.env.local` no viaja con el repositorio.

Las dos direcciones sí quedan versionadas dentro de `.env.example`. Es deliberado: no son secretos, son la configuración por defecto del proyecto, y ponerlas ahí evita tener que preguntarlas cada vez que alguien lo clone. Lo que **nunca** se versiona es `RESEND_API_KEY`, ni ninguna dirección escrita dentro de un `.ts` o `.tsx`.

### Aviso sobre el remitente

Resend rechaza como `from` cualquier dirección cuyo dominio no esté verificado en la cuenta, y `gmail.com` no se puede verificar. Es previsible que `CONTACT_FROM_EMAIL=nrv23@gmail.com` devuelva un error de dominio no verificado en el primer envío real.

El código no fija ninguna dirección: lee la variable. Si Resend la rechaza, hay dos salidas **sin tocar código**:

1. Poner `onboarding@resend.dev` en `CONTACT_FROM_EMAIL`. Es el remitente de pruebas de Resend; funciona sin dominio propio, pero solo entrega a la dirección dueña de la API key.
2. Verificar un dominio propio en Resend y usar una dirección suya.

El correo del visitante viaja siempre en `replyTo`, así que responder desde la bandeja funciona en los tres casos.

## Contrato de la Server Action

`app/actions/contact.ts`, con `"use server"` en la cabecera del módulo:

```ts
export async function sendContactMessage(
  prev: ContactState,
  formData: FormData,
): Promise<ContactState>;
```

La firma con `prev` como primer parámetro es la que exige `useActionState` (`node_modules/next/dist/docs/01-app/02-guides/forms.md:194`).

**Validación**, en este orden:

1. Honeypot: campo oculto `website`. Si trae contenido, se devuelve `status: "ok"` con `sentName` puesto al nombre recibido (o `"PLAYER"` si viene vacío) y **sin enviar nada**. Un bot no debe distinguir el rechazo del éxito, y la terminal necesita un nombre que mostrar.
2. `name`, `email` y `message` recortados con `trim()` y obligatorios → `status: "invalid"`.
3. `email` validado con expresión regular → `status: "invalid"`.
4. Longitudes máximas: nombre 80 caracteres, mensaje 2000 → `status: "invalid"`.
5. Configuración: si falta cualquiera de las tres variables de entorno, `status: "error"` con «Servicio de correo no configurado».

Todo retorno con `"invalid"` o `"error"` incluye `values` con lo que el visitante había escrito.

**Envío:**

```ts
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({
  from: process.env.CONTACT_FROM_EMAIL,
  to: process.env.CONTACT_TO_EMAIL,
  replyTo: email,
  subject: `[Arcade Vault] Mensaje de ${name}`,
  text: /* nombre, correo y mensaje en texto plano */,
});
```

Envío real desde el primer día: nada de simulación ni de un `console.log` en lugar de la llamada. Mientras `RESEND_API_KEY` esté vacía el formulario mostrará el error de configuración; en cuanto la clave esté en `.env.local` y se reinicie `next dev`, envía de verdad sin cambiar una línea.

**Errores.** La acción nunca lanza: cualquier fallo se captura y sale como un `ContactState`. El error que devuelva Resend se registra en el servidor con `console.error` y llega a la interfaz como texto genérico, sin filtrar detalles de la API ni de la clave.

## Plan de implementación

Cada paso deja la aplicación compilando (`npm run build`).

1. Anexar a `app/globals.css` el bloque `/* ===== ABOUT PAGE ===== */`, omitiendo `.divider`. Prueba manual: `npm run dev` levanta y las seis pantallas existentes no cambian de aspecto.
2. Crear `components/highlight-icon.tsx` con los tres SVG pixel (`HEART`, `BROWSER`, `PLANT`) y `kind` tipado como unión, siguiendo el patrón de `components/feature-icon.tsx`. Prueba manual: el build compila.
3. Crear `components/about.tsx` (`"use client"`, necesita `IntersectionObserver`) con el hero, los tres destacados y el divisor animado, llamando a `useReveal()` de `components/use-reveal.ts` — que ya existe y **no se reescribe**. Crear `app/about/page.tsx` con `export const metadata` de título `Acerca de · Arcade Vault`. Prueba manual: `/about` muestra título, misión y los tres destacados.
4. Añadir el enlace `Acerca de` a `components/nav.tsx`, después de `Salón de la Fama`, en el menú de escritorio y en el panel móvil, con `isAbout`. Prueba manual: el enlace aparece en ambos menús, navega a `/about` y se marca activo.
5. `npm install resend` (fijando la versión mayor instalada en `package.json`, para que la forma del SDK no cambie sola), añadir `!.env.example` a `.gitignore`, crear `.env.example` y documentar las tres variables en `CLAUDE.md`. Prueba manual: `npm run build` compila y `git status` lista `.env.example` como archivo nuevo.
6. Crear `app/actions/contact.ts` con la validación, el honeypot y el envío descritos arriba. Prueba manual: el build compila; la acción todavía no se llama desde ningún sitio.
7. Crear `components/contact-form.tsx` (`"use client"`) con `useActionState`: los tres campos con `defaultValue` desde `state.values`, el honeypot oculto, el `onSubmit` que cancela y sacude cuando falta algo, el botón deshabilitado mientras `pending`, la terminal de éxito con el nombre en mayúsculas y su botón «ENVIAR OTRO MENSAJE», y la fila de error para `"invalid"` y `"error"`. Prueba manual: el build compila.
8. Montar `<ContactForm />` dentro de la sección de contacto de `components/about.tsx`. Prueba manual: `/about` completo; enviar con campos vacíos sacude el formulario, enviar con datos válidos y sin clave muestra el error de configuración.
9. Comparación visual contra la plantilla siguiendo el procedimiento de `CLAUDE.md`: copiar `references/templates/home-about/*` a `public/__ref/`, abrirla junto a `http://localhost:3000/about`, capturar escritorio y móvil en `.playwright-mcp/` y **borrar `public/__ref/`** al terminar.

## Detalles de comportamiento a replicar

- **Revelado por scroll.** El divisor y la sección de contacto llevan `.reveal`; el hero no, igual que en la plantilla. `useReveal` ya hace el resto.
- **Retardos escalonados.** Los tres destacados usan `transitionDelay: (i * 80) + "ms"` y los 24 píxeles del divisor `animationDelay: (i * 80) + "ms"`. Valores calculados en runtime: el atributo `style` está permitido aquí por la misma excepción que conceden SPEC 01 y 02.
- **Sacudida.** `shake` se activa 400 ms cuando falta algún campo, exactamente como en `about.jsx:22`. Esa validación es de cliente y **no** llega al servidor. Mecanismo concreto: el formulario usa `action={formAction}` y además un `onSubmit` que, si algún campo está vacío, llama a `preventDefault()` y activa `shake`; React solo dispara la Server Action cuando el evento no se ha cancelado. Los campos **no** llevan `required` de HTML, porque el mensaje nativo del navegador sustituiría a la sacudida de la plantilla.
- **Campos repoblados.** Cada `input` y el `textarea` reciben `defaultValue={state.values?.…}`. Sin eso, React vacía el formulario al terminar la acción y un fallo de envío obligaría a reescribir el mensaje entero.
- **Terminal de éxito.** Se conservan las cuatro líneas del log y el nombre en mayúsculas. El botón «ENVIAR OTRO MENSAJE» vuelve al formulario vacío.
- **Divisor.** Es decorativo: lleva `aria-hidden="true"`, como en la plantilla.
- **Textos.** En español, literales de la plantilla, sin reescribir.
- **Errores.** La fila de error no existe en la plantilla; se añade con el mismo lenguaje visual (fuente `--pixel`, color de neón de aviso) y sin tocar el bloque CSS portado más de lo necesario. Se muestra tanto en `"invalid"` como en `"error"`; la sacudida solo acompaña al primero.

## Criterios de aceptación

- [ ] `npm run build` y `npm run lint` terminan sin errores ni warnings.
- [ ] `/about` muestra el título en degradado, la misión y los tres destacados en magenta, cian y verde, cada uno con su icono pixel.
- [ ] Al hacer scroll, el divisor y la sección de contacto aparecen con la transición `.reveal.in`.
- [ ] El divisor anima sus 24 píxeles con retardo escalonado.
- [ ] La navegación muestra `Acerca de` en escritorio y en el panel móvil, y lo marca activo solo en `/about`.
- [ ] Enviar con cualquiera de los tres campos vacío sacude el formulario y **no** produce ninguna petición al servidor.
- [ ] Enviar con un correo mal formado devuelve error de validación sin enviar nada.
- [ ] Mientras se envía, el botón está deshabilitado.
- [ ] Un envío correcto muestra la terminal con el nombre en mayúsculas, y «ENVIAR OTRO MENSAJE» devuelve el formulario vacío.
- [ ] Con la clave configurada, el mensaje llega a `CONTACT_TO_EMAIL` y responder al correo escribe a la dirección del visitante.
- [ ] Sin `RESEND_API_KEY`, la aplicación arranca y el formulario muestra «Servicio de correo no configurado» en vez de romperse.
- [ ] Si Resend falla, se muestra un error genérico, los tres campos conservan lo escrito y ningún detalle de la API aparece en el navegador.
- [ ] Un error de validación de servidor también conserva lo escrito en los tres campos.
- [ ] Rellenar el campo honeypot muestra la terminal de éxito y **no** envía ningún correo.
- [ ] A 375 px de ancho ninguna sección desborda horizontalmente.
- [ ] No hay advertencias de hidratación en la consola en `/about`.
- [ ] `RESEND_API_KEY` no aparece con valor en ningún archivo versionado, y ninguna dirección de correo está escrita dentro de un `.ts` o `.tsx`.
- [ ] `.env.example` aparece en `git status` como archivo nuevo —es decir, `.gitignore` tiene la excepción `!.env.example`— y `.env.local` sigue ignorado.
- [ ] No existe `tailwind.config.js`, no se añadió ninguna hoja de estilos aparte de `app/globals.css`, y la única dependencia nueva es `resend`.
- [ ] Comparada contra `references/templates/home-about/arcade-vault-standalone.html`, la pantalla coincide en fondo, tipografías, neones y espaciado en escritorio y en móvil.

## Decisiones

- **Sí:** pantalla y envío en la misma spec. El formulario es la mitad del Acerca de; portarlo simulado y darle backend después dejaría un botón que no hace nada y obligaría a reescribir el componente entero en la spec siguiente.
- **Sí:** la ruta es `/about`. Coherente con `/games`, que fijó el usuario en SPEC 02.
- **No:** `/acerca-de`. Habría casado con `/juegos` y `/salon`, pero el proyecto ya eligió inglés para las rutas nuevas.
- **Sí:** Server Action en vez de Route Handler. No expone endpoint HTTP público, Next 16 cifra los identificadores de acción y compara `Origin` con `Host` como protección CSRF (`node_modules/next/dist/docs/01-app/02-guides/server-actions.md:82`). Un `/api/contact` abierto sería un formulario de spam gratis.
- **Sí:** paquete `resend`. Es la primera dependencia de producción del proyecto y está justificada: tipada y con errores estructurados. Hacer `fetch` a la API a mano ahorraría la dependencia a cambio de tipar la respuesta y los errores nosotros.
- **Sí:** `useActionState`. Es el patrón que documenta Next 16 para mostrar errores y estado de envío (`docs/01-app/02-guides/forms.md:192`), y da `pending` sin estado manual.
- **Sí:** validación duplicada en cliente y en servidor. La de cliente conserva la sacudida de la plantilla y evita viajes inútiles; la de servidor es la que de verdad protege, porque la acción se puede invocar sin pasar por la interfaz.
- **Sí:** el remitente y el destinatario son variables de entorno. El usuario fijó `nrv23@gmail.com`, pero Resend puede rechazarlo como remitente por dominio no verificado; con una variable se cambia sin tocar código ni volver a desplegar la lógica.
- **No:** incrustar las direcciones en `app/actions/contact.ts`. Quedarían versionadas y cambiarlas exigiría un commit.
- **Sí:** honeypot. Es la única mitigación antispam que cabe sin almacén de estado y sin dependencias.
- **No:** rate limiting por IP. Necesita un almacén compartido (Redis o similar) que el proyecto no tiene; va en su propia spec.
- **No:** correo de acuse de recibo al visitante. Duplica el coste de envío y abre la puerta a usar el formulario para mandar correo a terceros.
- **Sí:** el CSS nuevo se anexa tal cual a `app/globals.css`. Misma razón que en SPEC 02: el archivo replica `styles.css` sección a sección y romper esa correspondencia dificultaría las comparaciones futuras.
- **No:** portar los bloques `GAMEPAD` y `Theme variants`. Ninguna plantilla los usa; SPEC 02 se equivocó al darlos por necesarios para esta pantalla.
- **No:** reescribir `.field` para el formulario de contacto. Ya está en `app/globals.css` desde SPEC 01 y la plantilla lo reutiliza igual.
- **Sí:** `components/about.tsx` es cliente. `useReveal` necesita `IntersectionObserver`, que solo existe en el navegador.
- **Sí:** trocear en `about.tsx`, `highlight-icon.tsx` y `contact-form.tsx`. Mismo criterio que en SPEC 02: los SVG y la máquina de estados del formulario fuera de la composición.
- **Sí:** `ContactState` devuelve `values` con lo escrito. React vacía el formulario al completarse una Server Action; sin esto, cualquier fallo obligaría a reescribir el mensaje entero.
- **No:** hacer los campos controlados con `useState`. Resolvería lo mismo, pero duplicaría el estado que ya lleva la acción y obligaría a sincronizar dos fuentes de verdad por un caso que solo ocurre al fallar.
- **Sí:** `"invalid"` y `"error"` son estados distintos. El formulario los pinta distinto —uno sacude, el otro no— y mezclarlos obligaría a adivinar la causa desde el texto del mensaje.
- **No:** usar `required` de HTML en los campos. Es más barato, pero el aviso nativo del navegador sustituiría a la sacudida, que es justo el detalle de la plantilla que esta spec porta.
- **Sí:** `.env.example` versionado con las dos direcciones dentro. No son secretos y son la configuración por defecto; lo que nunca se versiona es la clave.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `from: nrv23@gmail.com` será rechazado por Resend si ese dominio no está verificado, y `gmail.com` no puede estarlo. | El remitente es una variable de entorno: se cambia a `onboarding@resend.dev` o a un dominio propio sin tocar código. `.env.example` documenta las dos salidas. |
| Con `onboarding@resend.dev` como remitente, Resend solo entrega a la dirección dueña de la API key. | Queda documentado como limitación conocida del modo de pruebas, no como un fallo de la implementación. **Confirmado contra la API real durante la implementación:** la cuenta de esta clave es `navemen23@hotmail.com`, así que mientras no haya dominio verificado `CONTACT_TO_EMAIL` debe ser esa dirección; con `nrv23@gmail.com` la API responde 403. |
| La clave vive en `.env.local`, que está ignorado; quien clone el repositorio no sabrá qué configurar. | `.env.example` versionado y las tres variables documentadas en `CLAUDE.md`. |
| Es el primer código de servidor del proyecto: un fallo no controlado en la acción rompería la pantalla. | La acción captura todo y siempre devuelve un `ContactState`; nunca lanza. Hay un criterio de aceptación para el caso sin clave. |
| Sin rate limiting real, el formulario es abusable como emisor de spam. | Honeypot y validación de longitud como mitigación mínima; el límite por IP va en otra spec y queda anotado. |
| El mensaje de error de Resend podría filtrar detalles de la cuenta o de la clave si se muestra tal cual. | El error se registra con `console.error` en servidor y a la interfaz solo llega un texto genérico. |
| `.gitignore` ignora `.env*`, lo que incluye `.env.example`: sin excepción, el archivo de ejemplo nunca llega al repositorio y nadie sabe qué configurar. | El paso 5 añade `!.env.example` y un criterio de aceptación comprueba que `git status` lo lista. |
| El nombre de los campos del SDK de Resend cambió entre versiones mayores (`reply_to` → `replyTo`). Instalar sin fijar la mayor puede romper el envío en una reinstalación futura. | El paso 5 fija la versión mayor en `package.json` y el envío se prueba a mano en cuanto haya clave. |
| La comparación visual del paso 9 depende del MCP de Playwright, que en la sesión de redacción de esta spec estaba caído (`CONNECTION_CLOSED`). | Reconectar el MCP antes de ese paso. Si sigue caído, la comparación se hace a ojo y el criterio de aceptación correspondiente queda pendiente, anotado en el commit. |

## Lo que **no** entra en esta spec

- Los bloques CSS `GAMEPAD` y `Theme variants`: no los usa ninguna plantilla y no entran nunca.
- Correo de acuse de recibo al visitante.
- Persistencia de los mensajes recibidos.
- Rate limiting por IP o por sesión.
- Verificación de un dominio propio en Resend.
- Backend, base de datos y autenticación real.
- Tests automatizados.
- Unificar el idioma de las rutas.

Cada uno de esos puntos, si entra, va en su propia spec.
