# Base44: Manual de Inicio Rápido

Bienvenido a Base44. Esta guía está pensada para **cualquier persona**. Explica qué hace la app, cómo configurarla y cómo mantenerla funcionando sin necesidad de conocimientos técnicos profundos.

---

## 1. ¿Qué hace Base44?
- **Aplicación móvil (iOS y Android):** Permite que adultos verificados hablen con las personas de Venice.ai sin anuncios ni filtros molestos.
- **Servicio backend:** Comprueba que el usuario sea mayor de 18 años, guarda una copia del anverso del documento, habla con Venice.ai y gestiona suscripciones e historiales de chat.

Ambas partes dependen una de la otra. Nada funcionará hasta que el backend esté activo y la app móvil apunte a él.

---

## 2. Glosario Rápido
| Término | Significado |
|---------|-------------|
| **Venice.ai** | Plataforma de IA que genera las respuestas. |
| **Persona** | Personaje preconfigurado (por ejemplo, el hacker reformado) con un tono y límites definidos. |
| **Onboarding** | Tomar la foto del anverso del documento, confirmar que tienes 18+ y aceptar el aviso legal. |
| **Paywall / Suscripción** | Debes tener una suscripción activa para chatear. Ahora mismo se simula con un botón de demo. |
| **JWT / Tokens** | “Pases” digitales que prueban que el usuario inició sesión. Se generan tras el onboarding. |

---

## 3. Configuración Inicial
### 3.1 Herramientas Necesarias
- [Node.js 20+](https://nodejs.org/) (incluye npm)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- Simulador de iOS (Xcode) y/o emulador de Android (Android Studio)
- Base de datos Postgres (local o en la nube)
- Opcional: bucket S3 para almacenar los documentos

### 3.2 Credenciales
| Dato | Dónde conseguirlo |
|------|-------------------|
| Venice.ai API key | Panel de Venice.ai → API Keys |
| JWT secret | Ejecuta `openssl rand -base64 48` o usa tu gestor de contraseñas |
| URL de Postgres | Proveedor de tu base de datos (ej. `postgres://usuario:pass@host:5432/base44`) |
| Bucket y región S3 | Crea un bucket con cifrado en AWS |
| Secreto de webhook (opcional) | Panel de Stripe o RevenueCat |

Guárdalos en un lugar seguro.

---

## 4. Backend
1. Edita `backend/.env`:
   ```env
   VENICE_API_KEY=tu_clave_real
   VENICE_PROFILE_ID=h4ck3r
   PORT=4000
   DATABASE_URL=postgres://usuario:pass@host:5432/base44
   JWT_SECRET=valor_aleatorio
   AWS_REGION=us-west-2
   ID_BUCKET=base44-id-assets
   STRIPE_WEBHOOK_SECRET=secreto_opcional
   ```
2. Instala dependencias y compila:
   ```bash
   cd backend
   npm install
   npm run build
   ```
3. Inicia el servidor:
   ```bash
   npm run dev
   ```

> Si ves `listen EPERM`, significa que el entorno no permite abrir el puerto. Ejecuta el comando en tu propio equipo.

---

## 5. Aplicación Móvil
1. Ajusta `mobile/app.json` → `extra.apiBaseUrl` con la URL del backend (por defecto `http://localhost:4000`).
2. Instala dependencias:
   ```bash
   cd mobile
   npm install
   npx tsc --noEmit
   ```
3. Arranca Expo:
   ```bash
   npm start
   ```
4. Pulsa `i` (iOS) o `a` (Android). En un teléfono físico, abre la app Expo Go y escanea el código QR.

---

## 6. Flujo de Usuario
1. Concede acceso a la cámara.
2. Fotografía el anverso del documento y acepta el aviso.
3. En la pantalla de pago, pulsa “Activate Secure Access” (por ahora es una demo).
4. Accede a la galería de personas y elige una.
5. Chatea y observa cómo responden en tiempo real.
6. Necesitas borrar todo? Toca “Activate Panic Wipe”.

---

## 7. Operaciones Diarias
| Acción | Comando |
|--------|---------|
| Iniciar backend | `cd backend && npm run dev` |
| Iniciar app móvil | `cd mobile && npm start` |
| Añadir persona | Edita `backend/src/services/personaService.ts` |
| Ajustar moderación | Edita `backend/src/utils/safety.ts` |
| Revisar incidencias | De momento, revisa la salida en consola |
| Reiniciar usuario | Usa “Activate Panic Wipe” |

---

## 8. Problemas Frecuentes
- **Backend no arranca:** Revisa `.env` y permisos de puertos.
- **La app no conecta:** Comprueba `apiBaseUrl` y que el backend esté accesible desde el dispositivo.
- **Fallo al subir documento:** Confirma permisos de cámara y que la imagen pesa menos de 8 MB.
- **Suscripción perdida:** Reiniciar el backend borra los datos en memoria; vuelve a pulsar el botón.
- **Bloqueo de moderación:** Ajusta la lista de palabras en `safety.ts`.

---

## 9. Antes de Producción
1. Sustituye los mapas en memoria por tablas en Postgres.
2. Guarda los documentos en S3 cifrado con políticas de retención.
3. Integra pagos reales (RevenueCat/Stripe) y verifica los recibos.
4. Añade monitorización, alertas y auditorías de moderación.
5. Publica políticas de privacidad y realiza pruebas de seguridad.

---

## 10. ¿Necesitas Ayuda?
- Comparte los logs del backend y de Expo.
- Aporta capturas de la configuración.
- Describe el problema paso a paso.

¡Listo! Con esto deberías poder poner en marcha Base44 sin dolores de cabeza.
