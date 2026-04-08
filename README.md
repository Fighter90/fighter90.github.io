# fighter90.github.io

> Интерактивное портфолио Senior Software Engineer (PHP/Go) с 14+ годами опыта в высоконагруженных системах

[![Сайт](https://img.shields.io/badge/demo-fighter90.github.io-blue?style=flat-square)](https://fighter90.github.io)
[![Built with Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-blueviolet?style=flat-square)](https://claude.ai/code)

---

## Проблема

Статичное резюме в PDF не показывает, что ты умеешь строить. Оно описывает навыки — но не доказывает их.

## Решение

Интерактивное портфолио, которое **демонстрирует навыки на практике**: двуязычный интерфейс (RU/EN), тёмная/светлая тема, анимированный hero с dot grid, sticky-навигация с подсветкой секций, портфолио веб-сервисов, SEO-оптимизация и деплой на GitHub Pages.

**Ключевые фичи:**
- **Двуязычность (RU/EN)** — переключатель с флагами, localStorage, автоопределение по браузеру
- **Тёмная/светлая тема** — мгновенное переключение без FOUC, CSS-first
- **Story-секция** — анимированный narrative block с навигационными «пузырями» в стиле santifer.io
- **Sticky-навигация** — секционные якоря с подсветкой активного раздела, mobile hamburger
- **Портфолио** — 7 реализованных веб-сервисов (чат-боты, CMS, HRM, e-commerce) + PDF-скачивание
- **8 мест работы** — Rambler&Co, Lamoda, МТС Финтех, ЭТП ГПБ, Авито, Мамба, Суточно.ру
- **4 проекта** — ResumeCraft (SaaS), ICAIMT 2026 (Research), Career-Ops (AI), HSE
- **Skills с иконками** — 6 категорий: Backend, Data, Infra, AI/ML, Product, Architecture
- **Floating Telegram CTA** — плавающая кнопка «Написать мне» (bottom-right)
- **LinkedIn** — интеграция в hero и контактах
- **GEO-ready** — `llms.txt`, JSON-LD, `robots.txt`

---

## Стек технологий

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=flat&logo=github&logoColor=white)

---

## Архитектура

```
Browser → index.html → main.tsx (React 19 + BrowserRouter)
                         ├── LangProvider (RU/EN context)
                         ├── GlobalNav (theme + lang switcher)
                         └── App.tsx
                              ├── Hero (DotGrid canvas + ambient orbs + avatar + CTA buttons)
                              ├── StorySection (animated narrative + nav bubbles)
                              ├── StickyNav (section anchors + active highlight)
                              ├── Experience (8 companies, achievements, stack)
                              ├── Portfolio (7 Webguru projects + PDF downloads)
                              ├── Projects (ResumeCraft, ICAIMT 2026, Career-Ops)
                              ├── Education (HSE, Kuban SU, UlSTU)
                              ├── Skills (6 categories with Lucide icons)
                              ├── Contact (Email, GitHub, LinkedIn, Telegram)
                              └── FloatingCTA (Telegram button, delayed appear)

GitHub Actions → npm ci → tsc → vite build → upload artifact → deploy-pages
```

---

## Структура проекта

```
src/
├── App.tsx                  # Все секции: Hero, Story, Experience, Portfolio,
│                            # Projects, Education, Skills, Contact + FloatingCTA
├── GlobalNav.tsx            # Theme toggle (Sun/Moon) + LangSwitcher
├── main.tsx                 # React entry: BrowserRouter + LangProvider
├── i18n.ts                  # Полный контент RU/EN (опыт, проекты, навыки)
├── index.css                # Tailwind v4, CSS variables, анимации, шрифты
├── contexts/
│   └── LangContext.tsx      # React Context: detectLang, toggleLang, localStorage
└── components/
    └── LangSwitcher.tsx     # RU/EN toggle с SVG-флагами

public/
├── 404.html                 # SPA redirect для GitHub Pages
├── favicon.svg              # "SE" initials favicon
├── foto-avatar.webp         # Фото (384px)
├── foto-avatar-sm.webp      # Фото (192px)
├── Емельянов_Сергей_CV.pdf  # CV (русский)
├── Sergey_Emelyanov_CV_EN.pdf # CV (английский)
├── Portfolio.pdf            # Портфолио Webguru
├── Portfolio.Services.pdf   # Портфолио сервисов
├── llms.txt                 # AI crawler info (GEO)
├── robots.txt               # Search bot rules
└── fonts/                   # Space Grotesk + DM Sans (self-hosted)

.github/workflows/
└── deploy.yml               # Build + Deploy to GitHub Pages
```

---

## Секции портфолио

| Секция | Описание |
| ------ | -------- |
| Hero | Аватар, имя, роль, bio, CTA (CV, GitHub, LinkedIn, Telegram) |
| Story | Animated narrative: «14+ лет строю всё с нуля» + nav bubbles |
| Опыт | 8 компаний: обязанности, достижения, стек |
| Портфолио | 7 веб-сервисов (Alicebot, vl-taxi, HR-боты, Telegram-магазин) + PDF |
| Проекты | ResumeCraft (SaaS), ICAIMT 2026 (Research), Career-Ops (AI) |
| Образование | НИУ ВШЭ (в процессе), Кубанский ГУ, УлГТУ |
| Навыки | Backend, Data, Infra, AI/ML, Product, Architecture |
| Контакты | Email, GitHub, LinkedIn, Telegram |

---

## Быстрый старт

```bash
git clone https://github.com/Fighter90/fighter90.github.io.git
cd fighter90.github.io
npm install
npm run dev
```

Открыть [localhost:5173](http://localhost:5173)

### Сборка

```bash
npm run build    # tsc → vite build → dist/
npm run preview  # Локальный превью
```

---

## Деплой

Автоматический при пуше в `main`:

1. GitHub Actions: `npm ci → npm run build`
2. `actions/upload-pages-artifact` → `dist/`
3. `actions/deploy-pages` → https://fighter90.github.io

**Настройка:** Settings → Pages → Source: **GitHub Actions**

---

## Связь

[![Website](https://img.shields.io/badge/fighter90.github.io-000?style=for-the-badge&logo=safari&logoColor=white)](https://fighter90.github.io)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/sergey-emelyanov-in-job/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Fighter90)
[![Telegram](https://img.shields.io/badge/Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/sergey_in_job)
[![Email](https://img.shields.io/badge/Email-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:pochtasergeia@gmail.com)
