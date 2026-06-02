# Equis UD - Ingeniería Económica

Una plataforma web interactiva de cálculo y conversión financiera diseñada específicamente para la materia de **Ingeniería Económica** en la **Universidad Distrital Francisco José de Caldas**.

Esta herramienta permite a los estudiantes y profesionales realizar simulaciones de capitalización, tablas de amortización y conversiones entre tasas de interés (nominales y efectivas) de manera ágil e intuitiva.

## 🚀 Características Principales

- **Conversión de Tasas**: Transforma fácilmente tasas de interés nominales a efectivas y viceversa.
- **Tablas de Amortización**: Genera esquemas de pago detallados para préstamos, visualizando abonos a capital, intereses y saldos finales por período.
- **Simulación de Capitalización**: Calcula el crecimiento de ahorros o inversiones mediante depósitos periódicos e intereses acumulados.
- **Interactividad en Tiempo Real**: Desarrollada con React para cálculos instantáneos, dinámicos y sin recarga de página.
- **Experiencia de Usuario Fluida**: Animaciones suaves integradas con `animejs` para mejorar la visualización y comprensión de los datos financieros.
- **Educación Financiera**: Incluye secciones explicativas y gráficas de apoyo para acompañar de forma didáctica el aprendizaje de la asignatura.

## 🛠️ Tecnologías Utilizadas

El proyecto está construido con un enfoque moderno de desarrollo web (Jamstack), combinando un gran rendimiento con una experiencia de desarrollo robusta:

- **[Astro](https://astro.build/)** - Framework principal y orquestador del proyecto (SSG/SSR).
- **[React 19](https://react.dev/)** - Biblioteca base para la construcción de la interfaz de calculadora y componentes interactivos.
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Framework de utilidades CSS para un diseño ágil, limpio y responsivo.
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estricto que asegura la fiabilidad en la lógica y fórmulas matemáticas.
- **[Anime.js](https://animejs.com/)** - Biblioteca ligera para el manejo de animaciones complejas en la UI.
- **[Vercel](https://vercel.com/)** - Adaptador integrado de forma nativa (`@astrojs/vercel`) para un despliegue optimizado en la nube.

## 📋 Requisitos Previos

Antes de comenzar a explorar o modificar el código, asegúrate de tener instalado en tu entorno local:

- **Node.js**: Versión `>= 22.12.0` (requerido por la configuración de motores en `package.json`).
- **npm**: Gestor de paquetes que viene por defecto con Node.js.

## ⚙️ Instalación

1. Clona este repositorio en tu máquina local:
   ```bash
   git clone https://github.com/drezzgo/Ingenieria-Economica.git
   cd Ingenieria-Economica
   ```

2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```

## 💻 Uso y Comandos de Desarrollo

La aplicación dispone de scripts configurados para facilitar el proceso de desarrollo. Ejecuta los siguientes comandos desde la raíz del proyecto en tu terminal:

| Comando | Acción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local en `http://localhost:4321`. |
| `npm run build` | Construye la versión optimizada para producción en el directorio `dist/`. |
| `npm run preview` | Levanta un servidor local que previsualiza el build generado (útil antes de desplegar). |
| `npm run astro ...` | Acceso directo a la CLI de Astro (por ejemplo, `npm run astro check`). |

## 📁 Estructura del Proyecto

El código fuente sigue una arquitectura estructurada y bien organizada:

```text
/
├── public/                # Archivos estáticos servidos directamente (favicon, imágenes)
├── src/
│   ├── components/        # Componentes interactivos de React (MainCalculator.tsx, Rosenchart.tsx, etc.)
│   ├── layouts/           # Envolturas y plantillas base globales de Astro (Layout.astro)
│   ├── lib/               # Lógica de negocio core y motores matemáticos financieros (finance.ts)
│   ├── pages/             # Sistema de enrutamiento basado en archivos; rutas de la aplicación (index.astro)
│   └── styles/            # Estilos y variables CSS globales (si aplica)
├── astro.config.mjs       # Configuración general de Astro y sus integraciones (React, Tailwind, Vercel)
├── package.json           # Declaración de dependencias, scripts de utilidad y requerimientos de Node
└── tsconfig.json          # Reglas del compilador de TypeScript
```

## 🌐 Despliegue a Producción

Este proyecto está preconfigurado para ser desplegado sin fricciones en **Vercel**:

1. Aloja tu código o haz un fork hacia tu proveedor de Git (GitHub, GitLab, Bitbucket).
2. Conecta ese repositorio desde tu panel (Dashboard) de Vercel.
3. Vercel detectará Astro automáticamente y usará el adaptador configurado (`@astrojs/vercel`) realizando de forma automática `npm run build` durante el proceso de despliegue.

## 🤝 Contribución

¡Las contribuciones para expandir las capacidades de esta herramienta educativa siempre son bienvenidas! Para colaborar:

1. Haz un **Fork** del proyecto.
2. Crea una rama para tu mejora o corrección (`git checkout -b feature/nueva-formula`).
3. Haz *commit* de tus cambios detallando tu aporte (`git commit -m 'Añade fórmula de valor presente con gradiente'`).
4. Sube tus cambios (`git push origin feature/nueva-formula`).
5. Abre un **Pull Request** para revisión.

> **Nota para Desarrolladores:** Si vas a agregar o modificar lógica de cálculo matemático, por favor hazlo dentro de `src/lib/finance.ts` y asegúrate de mantener las interfaces estrictas de TypeScript para evitar fallos en el renderizado de los componentes.

## 📄 Licencia

Al tratarse de una herramienta académica, revisa el repositorio si se especifica algún tipo de distribución, uso comercial o retención de derechos. En ausencia de un archivo LICENSE explícito, se recomienda preguntar al autor original antes de su redistribución o comercialización.

## 👨‍💻 Autor y Créditos

- **Desarrollo y Diseño:** Andrés Góngora
- **Redes Sociales / Contacto:** Todas mis redes utilizan el usuario **@drezzgo** (incluyendo [GitHub](https://github.com/drezzgo)).
