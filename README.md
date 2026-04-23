# fighter90.github.io

Интерактивное персональное портфолио-приложение, собираемое в статический артефакт и хостящееся на GitHub Pages. Содержит AI-ассистента поверх DeepSeek V3, двуязычный UI (RU/EN), параллакс-анимации и SPA-роутинг.

[![Demo](https://img.shields.io/badge/demo-fighter90.github.io-blue?style=flat-square)](https://fighter90.github.io)
[![Proxy](https://img.shields.io/badge/proxy-fighter90--chat--proxy-000000?style=flat-square&logo=vercel)](https://github.com/Fighter90/fighter90-chat-proxy)
[![Built with Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-blueviolet?style=flat-square)](https://claude.ai/code)

---

## Оглавление

1. [Обзор](#обзор)
2. [Стек технологий](#стек-технологий)
3. [Архитектура](#архитектура)
   - [Высокоуровневая схема](#высокоуровневая-схема)
   - [AI-ассистент и прокси](#ai-ассистент-и-прокси)
   - [Двуязычность (i18n)](#двуязычность-i18n)
   - [SPA-роутинг на GitHub Pages](#spa-роутинг-на-github-pages)
4. [Структура проекта](#структура-проекта)
5. [Быстрый старт](#быстрый-старт)
6. [Конфигурация](#конфигурация)
7. [Сборка и деплой](#сборка-и-деплой)
8. [Безопасность](#безопасность)
9. [Acceptance checks](#acceptance-checks)

---

## Обзор

Приложение — single-page React-сайт, собираемый Vite в статический `dist/`. CI публикует артефакт в GitHub Pages. Клиентский бандл не содержит секретов: LLM-вызовы уходят в отдельную Vercel Edge Function ([fighter90-chat-proxy](https://github.com/Fighter90/fighter90-chat-proxy)), которая хранит OpenRouter-ключ и SYSTEM_PROMPT на стороне сервера.

### Ключевые свойства

- **Статическая сборка** — GitHub Pages, без runtime-сервера на стороне сайта.
- **Два языка** — RU/EN с переключателем, автоопределением по `navigator.language`, persist в `localStorage`.
- **AI-чат** — `FloatingChat` с SSE-стримингом, серверным system prompt, локальным fallback при отсутствии/недоступности прокси.
- **SPA-роутинг** — `public/404.html` сохраняет полный URL (`pathname + search + hash`) и отдаёт управление клиенту через `history.replaceState`.
- **Параллакс и анимации** — CSS-анимации + позиционирование за курсором мыши в Hero-секции.

---

## Стек технологий

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide_Icons-F56565?style=flat&logoColor=white)
![DeepSeek](https://img.shields.io/badge/DeepSeek_V3-000000?style=flat&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter-6366F1?style=flat&logoColor=white)
![Vercel Edge](https://img.shields.io/badge/Vercel_Edge-000000?style=flat&logo=vercel&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=flat&logo=github&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=githubactions&logoColor=white)

---

## Архитектура

### Высокоуровневая схема

```text
                ┌───────────────────────────────────────────┐
                │   GitHub (Fighter90/fighter90.github.io)  │
                │   ─────────────────────────────────────── │
                │   src/**  →  vite build  →  dist/**       │
                └────────────────────┬──────────────────────┘
                                     │  push to main
                                     ▼
                ┌───────────────────────────────────────────┐
                │   GitHub Actions (.github/workflows/       │
                │                    deploy.yml)            │
                │   npm ci → tsc → vite build → artifact    │
                └────────────────────┬──────────────────────┘
                                     │  actions/deploy-pages
                                     ▼
                ┌───────────────────────────────────────────┐
                │   GitHub Pages  (fighter90.github.io)     │
                │   ─────────────────────────────────────── │
                │   Static HTML/JS/CSS + 404.html SPA shim  │
                └────────────────────┬──────────────────────┘
                                     │  user opens chat, POST /api/chat
                                     ▼
                ┌───────────────────────────────────────────┐
                │   Vercel Edge Function                    │
                │   fighter90-chat-proxy.vercel.app         │
                │   ─────────────────────────────────────── │
                │   CORS allowlist + rate limit             │
                │   Prepends server-side SYSTEM_PROMPT      │
                │   Authorization: Bearer $OPENROUTER_KEY   │
                └────────────────────┬──────────────────────┘
                                     │  SSE passthrough
                                     ▼
                ┌───────────────────────────────────────────┐
                │   OpenRouter → deepseek/deepseek-chat-v3  │
                └───────────────────────────────────────────┘
```

### AI-ассистент и прокси

**Клиент** ([src/components/FloatingChat.tsx](src/components/FloatingChat.tsx)):

- Плавающий чат в правом нижнем углу, lazy-loaded чанк в бандле.
- Сообщения хранятся в local state (`useState`), история отправляется на сервер массивом `{ role, content }[]`.
- Стрим из SSE парсится вручную: `getReader()` → `TextDecoder` → построчный разбор `data: {...}` → извлечение `choices[0].delta.content` → `onChunk(token)`.
- При ошибке сети/прокси или пустом `VITE_CHAT_PROXY_URL` — автоматический fallback на локальные ответы по ключевым словам (`localFallback`), чтобы чат всегда отвечал хоть чем-то.
- Markdown-подобный рендер (`ChatMarkdown`): `**bold**`, заголовки, списки, auto-linkify URL/email/@handles — через React-элементы, без `dangerouslySetInnerHTML`.

**Прокси** ([fighter90-chat-proxy/api/chat.ts](https://github.com/Fighter90/fighter90-chat-proxy/blob/main/api/chat.ts)):

- Vercel Edge Function (`runtime: 'edge'`) — близко к пользователю, холодный старт ~миллисекунды.
- Проверяет `Origin` по allowlist: `https://fighter90.github.io`, `http://localhost:5173`. Иначе `403`.
- Per-IP rate limit: 20 запросов в минуту, sliding window в `Map` (сбрасывается на cold start — устраивает текущий трафик).
- Принимает `POST { messages: [...] }`, берёт последние 20, дописывает серверный `SYSTEM_PROMPT` как `role: system`, форвардит в `openrouter.ai/api/v1/chat/completions` с `stream: true`.
- `response.body` отдаётся клиенту as-is → тот же SSE-формат. Upstream-ошибка → `502`.

**Последовательность вызова:**

```text
FloatingChat.sendToLLM(userText)
  │
  ├─ push userMsg → messages
  ├─ setIsStreaming(true)
  │
  ├─ CHAT_PROXY_URL пуст?
  │   └─ yes → await localFallback → done
  │
  ├─ fetch(CHAT_PROXY_URL, { method, body: { messages }, signal })
  │     ▼
  │   [Vercel Edge /api/chat]
  │     │ origin allowlist → rate limit → slice(-20)
  │     │ upstream.fetch(openrouter, stream: true)
  │     └ return upstream.body  (SSE passthrough)
  │     ▼
  ├─ reader.read() loop
  │   → decode → split '\n'
  │   → parse JSON → delta.content → onChunk(token)
  │   → setStreamText(fullText)   // live UI update
  │
  ├─ [DONE] or reader done
  │   → push assistantMsg { text: fullText } → messages
  │
  └─ catch → localFallback
```

### Двуязычность (i18n)

- Весь переводимый контент лежит в [src/i18n.ts](src/i18n.ts) — плоский объект `{ ru: {...}, en: {...} }`.
- [src/contexts/LangContext.tsx](src/contexts/LangContext.tsx) предоставляет `useLang()` → `{ lang, setLang }`.
- Определение языка при первой загрузке:
  1. `?lang=ru|en` из URL — высший приоритет;
  2. `localStorage['lang']`;
  3. `navigator.language.startsWith('ru')` → `ru`, иначе `en`.
- Переключатель ([src/components/LangSwitcher.tsx](src/components/LangSwitcher.tsx)) пишет в `localStorage` и ставит `<html lang>`.

### Публикации LinkedIn (`LinkedInEmbed`)

Четыре LinkedIn-поста на странице рендерятся через [src/components/LinkedInEmbed.tsx](src/components/LinkedInEmbed.tsx). Компонент сознательно устойчив к региональной блокировке LinkedIn:

1. **Lazy-mount через `IntersectionObserver`** (`rootMargin: 200px`) — iframe не монтируется, пока пользователь не доскроллит до секции.
2. **Тайм-аут `6000 ms` на `onLoad`.** Если iframe не успел подгрузиться, состояние переключается в `failed`, iframe размонтируется.
3. **Fallback-карточка.** В состоянии `failed` рендерится нейтральная карточка с LinkedIn-иконкой, заголовком поста, датой и кнопкой «Открыть в LinkedIn». Без проб сети, без детекции страны — просто «не дождались `onLoad` → показываем ссылку».
4. **`sandbox` + `referrerPolicy="strict-origin-when-cross-origin"`** на iframe. Контент постов не имеет доступа к родительскому origin.
5. **Код-сплит через `React.lazy()`** — `LinkedInEmbed` уходит в отдельный chunk и не влияет на время до интерактивности главной страницы.

Единственный источник данных о публикациях — `publications: [{ embedUrl, postUrl, title, date, height }]` в [src/i18n.ts](src/i18n.ts) (по одному массиву на локаль). Чтобы добавить/удалить пост — достаточно отредактировать i18n, JSX трогать не нужно.

### SPA-роутинг на GitHub Pages

GitHub Pages не знает про клиентский роутинг: запрос `/any/path` без соответствующего файла возвращает `404.html`. Workaround:

1. [public/404.html](public/404.html) на старте сохраняет **полный URL** (`pathname + search + hash`) в `sessionStorage['redirect']` и делает `window.location.replace('/')`.
2. [src/main.tsx](src/main.tsx) читает `sessionStorage['redirect']` **до** `createRoot().render(...)` и восстанавливает URL через `window.history.replaceState(null, '', redirect)`.
3. Приложение инициализируется уже на правильном URL → `LangContext.detectLang()` видит `?lang=…`, компоненты видят `#hash`.

**Важно**: порядок `replaceState` → `render` критичен. Иначе `LangProvider` прочитает `window.location.search` слишком рано (пустой) и выберет язык по `navigator.language`.

---

## Структура проекта

```text
.
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI: npm ci → tsc → vite build → deploy-pages
│
├── public/                       # копируется в dist/ как есть
│   ├── 404.html                  # SPA-shim, сохраняет URL в sessionStorage
│   ├── favicon.svg               # + favicon.ico, apple-touch-icon, android-chrome-*
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── llms.txt                  # hint для AI-краулеров
│   ├── og-image.png              # OpenGraph превью
│   ├── foto-avatar.webp          # основное фото
│   ├── foto-avatar-sm.webp       # уменьшенное фото для чата
│   ├── testimonial-*.jpg         # сканы отзывов (lightbox)
│   ├── Emelyanov_Sergey_CV.pdf
│   ├── Sergey_Emelyanov_CV_EN.pdf
│   ├── Webguru_Portfolio_RU.pdf
│   ├── Webguru_Portfolio_EN.pdf
│   └── fonts/                    # Space Grotesk + DM Sans (self-hosted)
│
├── src/
│   ├── App.tsx                   # Hero, Story, Experience, Portfolio, Education,
│   │                             # Skills, Testimonials, Publications, Contact
│   ├── GlobalNav.tsx             # фиксированный sidebar + theme toggle
│   ├── main.tsx                  # createRoot + SPA-redirect recovery
│   ├── i18n.ts                   # словарь переводов RU/EN
│   ├── index.css                 # Tailwind v4 + CSS variables + keyframes
│   │
│   ├── contexts/
│   │   └── LangContext.tsx       # React Context: язык, localStorage, detect
│   │
│   └── components/
│       ├── LangSwitcher.tsx      # RU/EN toggle со SVG-флагами
│       ├── FloatingChat.tsx      # AI-чат: прокси + SSE + fallback + Linkify
│       └── LinkedInEmbed.tsx     # lazy iframe + 6s timeout + fallback-карточка
│
├── index.html                    # Vite entry, мета-теги, JSON-LD
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── eslint.config.js
└── README.md
```

### Ключевые файлы по назначению

| Файл | За что отвечает |
|---|---|
| [src/main.tsx](src/main.tsx) | React entry, восстановление SPA-URL перед рендером |
| [src/App.tsx](src/App.tsx) | Все основные секции страницы |
| [src/components/FloatingChat.tsx](src/components/FloatingChat.tsx) | Клиентская часть AI-ассистента, `callLLM`, fallback |
| [src/contexts/LangContext.tsx](src/contexts/LangContext.tsx) | Язык и автоопределение |
| [src/i18n.ts](src/i18n.ts) | Единственный источник локализованного контента |
| [public/404.html](public/404.html) | SPA-redirect с сохранением `search + hash` |
| [.github/workflows/deploy.yml](.github/workflows/deploy.yml) | CI/CD в GitHub Pages |

---

## Быстрый старт

```bash
git clone https://github.com/Fighter90/fighter90.github.io.git
cd fighter90.github.io
npm install
npm run dev
```

Dev-сервер поднимется на `http://localhost:5173`.

### Команды npm

| Скрипт | Что делает |
|---|---|
| `npm run dev` | Vite dev-сервер c HMR |
| `npm run build` | `tsc -b` + `vite build` → `dist/` |
| `npm run preview` | Локальный preview продакшн-бандла |
| `npm run lint` | ESLint по `src/**` |

---

## Конфигурация

Все клиентские настройки — через Vite env-переменные с префиксом `VITE_*`.

| Переменная | Обязательна? | По умолчанию | Назначение |
|---|---|---|---|
| `VITE_CHAT_PROXY_URL` | нет | `https://fighter90-chat-proxy.vercel.app/api/chat` | URL прокси. Пустая строка → `FloatingChat` сразу идёт в `localFallback`. |

**Пример локального запуска против своего прокси:**

```bash
VITE_CHAT_PROXY_URL=https://my-proxy.example.com/api/chat npm run build
```

**Что точно НЕ делать:**

- Не добавлять `VITE_OPENROUTER_KEY` или любой другой live-секрет. Vite инлайнит всё, что попадает в `import.meta.env.VITE_*`, в публичный JS — это утечка.
- Не класть `.env` в коммиты. В [.gitignore](.gitignore) уже прописаны `.env`, `.env.local`, `.env*.local`.

---

## Сборка и деплой

### Основной сайт → GitHub Pages

Триггер: `push` в `main` или ручной `workflow_dispatch`.

Пайплайн [.github/workflows/deploy.yml](.github/workflows/deploy.yml):

```text
actions/checkout@v4
  → actions/setup-node@v4  (Node 20, npm cache)
  → npm ci
  → npm run build           # tsc -b && vite build → dist/
  → actions/upload-pages-artifact@v3   (path: dist)
  → actions/deploy-pages@v4
```

Никаких секретов в workflow не пробрасывается.

### Прокси → Vercel

Прокси живёт в отдельном репозитории: [Fighter90/fighter90-chat-proxy](https://github.com/Fighter90/fighter90-chat-proxy).

1. Импорт в Vercel → Framework Preset `Other`.
2. Environment Variable: `OPENROUTER_KEY` (Production + Preview).
3. Deploy. Production URL: `https://fighter90-chat-proxy.vercel.app`.

Деплой прокси не связан с пайплайном основного сайта — они независимы. Обновление прокси → `git push` в его репо → Vercel автоматически пересобирает Edge Function.

---

## Безопасность

### Принципы

1. **Ни одного секрета в клиентском бандле.** Любой `VITE_*` попадает в публичный JS. LLM-ключи и system-промпты держим только на сервере.
2. **Allowlist по Origin**, а не по User-Agent/Referer (последние легко подделать).
3. **Rate limit на стороне прокси** — защита от абуза чужого ключа, даже если кто-то нашёл эндпоинт.
4. **Никакого `dangerouslySetInnerHTML`, `eval`, `new Function`** в клиентском коде. Markdown из ответа LLM рендерится через React-узлы.
5. **`.env` не трекается** — проверено в [.gitignore](.gitignore) и `git log --all -S sk-or-`.
6. **Content-Security-Policy** прописана `<meta http-equiv>` в `index.html`: `frame-src` ограничен `www.linkedin.com`; `connect-src` — `'self'`, прокси и `openrouter.ai`; `object-src 'none'`; `frame-ancestors 'self'`. `Referrer-Policy: strict-origin-when-cross-origin` тоже прописан мета-тегом.
7. **Регулярный `npm audit`.** В CI/локально — `npm audit` на `high`-уровне. Текущее состояние: `0 vulnerabilities` после апгрейда Vite ≥ 7.3.2 и зависимых транзитивных пакетов.

### Инварианты, которые проверяет билд

После `npm run build` в `dist/`:

```bash
grep -rE 'sk-or-|openrouter\.ai|SYSTEM_PROMPT' dist/ && echo FAIL || echo OK
```

Должно печатать `OK`.

### Ротация OpenRouter-ключа

1. В [OpenRouter dashboard → Keys](https://openrouter.ai/keys) создать **новый** ключ.
2. В Vercel → `fighter90-chat-proxy` → Settings → Environment Variables обновить `OPENROUTER_KEY` + нажать Redeploy.
3. После успешного Redeploy отозвать (`Revoke`) старый ключ.

Старый ключ нельзя отзывать до смены — иначе будет окно нерабочего чата.

---

## Acceptance checks

Быстрый чек-лист, чтобы убедиться, что всё работает:

```bash
# 1. Нет утечек в бандле
npm run build
grep -rE 'sk-or-|openrouter\.ai|Sergey Emelyanov.s AI portfolio assistant' dist/ && echo FAIL || echo OK

# 2. В CI нет упоминаний старого секрета
grep -n 'VITE_OPENROUTER_KEY' .github/workflows/deploy.yml && echo FAIL || echo OK

# 3. Прокси отвечает SSE с правильного Origin
curl -N -X POST https://fighter90-chat-proxy.vercel.app/api/chat \
  -H 'content-type: application/json' \
  -H 'origin: https://fighter90.github.io' \
  -d '{"messages":[{"role":"user","content":"Say OK."}]}'

# 4. Прокси режет левый Origin
curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  https://fighter90-chat-proxy.vercel.app/api/chat \
  -H 'content-type: application/json' \
  -H 'origin: https://evil.example.com' \
  -d '{"messages":[{"role":"user","content":"hi"}]}'
# expect: 403

# 5. 404.html сохраняет search и hash
# Открыть https://fighter90.github.io/any/missing?lang=en#contact
# После редиректа URL должен быть тем же, язык — en.
```
