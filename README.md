# Сергей Емельянов — Portfolio

**[Русский](#о-проекте)** | **[English](#about)**

> Двуязычное интерактивное портфолио Senior Software Engineer (PHP/Go) с 14+ годами опыта. Деплой на GitHub Pages.

[![Сайт](https://img.shields.io/badge/сайт-fighter90.github.io-blue?style=flat-square)](https://fighter90.github.io)
[![Built with Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-blueviolet?style=flat-square)](https://claude.ai/code)

---

## О проекте

Статичное резюме в PDF не показывает, что ты реально умеешь строить. Этот проект — интерактивное портфолио, которое **демонстрирует навыки на практике**: современный стек, двуязычный интерфейс (RU/EN), тёмная/светлая тема, анимации, адаптивный дизайн.

### Возможности

- **Двуязычность (RU/EN)** — переключатель языка с сохранением в localStorage и автоопределением по браузеру
- **Тёмная/светлая тема** — переключение без вспышки (FOUC), поддержка системных настроек
- **8 мест работы** — Rambler&Co, Lamoda Tech, МТС Финтех, ЭТП Газпромбанка, Авито, Мамба, Суточно.ру
- **4 проекта** — ResumeCraft (SaaS), ICAIMT 2026 (научная статья), Career-Ops (AI), Авито Путешествия (продуктовый анализ)
- **Скачивание CV** — PDF на русском и английском
- **SEO** — JSON-LD, Open Graph, `llms.txt`, `robots.txt`
- **GitHub Pages** — автоматический деплой через GitHub Actions
- **SPA routing** — 404.html хак для клиентского роутинга на GH Pages

---

## Стек технологий

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=flat&logo=github&logoColor=white)

---

## Быстрый старт

```bash
git clone https://github.com/Fighter90/cv-santiago.git
cd cv-santiago
npm install
npm run dev
```

Открыть [localhost:5173](http://localhost:5173)

### Сборка для продакшена

```bash
npm run build    # TypeScript → Vite build → dist/
npm run preview  # Превью собранного билда
```

---

## Структура проекта

```
src/
├── App.tsx                  # Главная страница — все секции портфолио
├── GlobalNav.tsx            # Навигация: переключатель языка + темы
├── main.tsx                 # Точка входа React + BrowserRouter
├── i18n.ts                  # Двуязычные переводы (RU/EN)
├── index.css                # Глобальные стили, цветовые профили, шрифты
├── contexts/
│   └── LangContext.tsx      # React Context для управления языком
└── components/
    └── LangSwitcher.tsx     # Кнопка переключения RU/EN с флагами

public/
├── 404.html                 # SPA-редирект для GitHub Pages
├── llms.txt                 # Информация для AI-краулеров (GEO)
├── robots.txt               # Правила для поисковых ботов
├── fonts/                   # Самохостинг шрифтов (Space Grotesk, DM Sans)
└── foto-avatar.webp         # Фото профиля

.github/
└── workflows/
    └── deploy.yml           # GitHub Actions: build → deploy на Pages

index.html                   # HTML-шаблон с SEO мета-тегами и JSON-LD
vite.config.ts               # Конфигурация Vite для GH Pages
```

---

## Секции портфолио

| Секция | Описание |
|--------|----------|
| Hero | Имя, роль, био, кнопки (CV, GitHub, Telegram) |
| Опыт работы | 8 компаний с обязанностями, достижениями и стеком |
| Образование | НИУ ВШЭ (в процессе), Кубанский ГУ, УлГТУ |
| Проекты | ResumeCraft, ICAIMT 2026, Career-Ops, Авито Путешествия |
| Навыки | 6 категорий: Backend, Данные, Инфра, AI/ML, Продукт, Архитектура |
| Контакты | Email, GitHub, Telegram |

---

## Деплой

Сайт автоматически деплоится на GitHub Pages при пуше в `main`:

1. GitHub Actions запускает `npm ci && npm run build`
2. Артефакт `dist/` загружается через `actions/upload-pages-artifact`
3. Деплой через `actions/deploy-pages`

**Настройка:** Settings → Pages → Source: **GitHub Actions**

---

## Лицензия

MIT

---

---

## About

> Bilingual interactive portfolio of a Senior Software Engineer (PHP/Go) with 14+ years of experience. Deployed on GitHub Pages.

[![Website](https://img.shields.io/badge/website-fighter90.github.io-blue?style=flat-square)](https://fighter90.github.io)

---

## The Problem

A static PDF resume doesn't show what you can actually build.

## The Solution

An interactive portfolio that **demonstrates skills in practice**: modern tech stack, bilingual interface (RU/EN), dark/light themes, animations, responsive design.

### Features

- **Bilingual (RU/EN)** — language switcher with localStorage persistence and browser auto-detection
- **Dark/Light theme** — instant switch without FOUC, system preference support
- **8 work experiences** — Rambler&Co, Lamoda Tech, MTS Fintech, ETP Gazprombank, Avito, Mamba, Sutochno.ru
- **4 projects** — ResumeCraft (SaaS), ICAIMT 2026 (research paper), Career-Ops (AI), Avito Travel (product analysis)
- **CV download** — PDF in Russian and English
- **SEO** — JSON-LD, Open Graph, `llms.txt`, `robots.txt`
- **GitHub Pages** — automatic deploy via GitHub Actions
- **SPA routing** — 404.html hack for client-side routing on GH Pages

---

## Tech Stack

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=flat&logo=github&logoColor=white)

---

## Quick Start

```bash
git clone https://github.com/Fighter90/cv-santiago.git
cd cv-santiago
npm install
npm run dev
```

Open [localhost:5173](http://localhost:5173)

### Production Build

```bash
npm run build    # TypeScript → Vite build → dist/
npm run preview  # Preview the built bundle
```

---

## Project Structure

```
src/
├── App.tsx                  # Main page — all portfolio sections
├── GlobalNav.tsx            # Navigation: language + theme switcher
├── main.tsx                 # React entry point + BrowserRouter
├── i18n.ts                  # Bilingual translations (RU/EN)
├── index.css                # Global styles, color profiles, fonts
├── contexts/
│   └── LangContext.tsx      # React Context for language management
└── components/
    └── LangSwitcher.tsx     # RU/EN toggle button with flag icons

public/
├── 404.html                 # SPA redirect for GitHub Pages
├── llms.txt                 # AI crawler information (GEO)
├── robots.txt               # Search bot rules
├── fonts/                   # Self-hosted fonts (Space Grotesk, DM Sans)
└── foto-avatar.webp         # Profile photo

.github/
└── workflows/
    └── deploy.yml           # GitHub Actions: build → deploy to Pages

index.html                   # HTML template with SEO meta tags and JSON-LD
vite.config.ts               # Vite config for GH Pages
```

---

## Portfolio Sections

| Section | Description |
|---------|-------------|
| Hero | Name, role, bio, buttons (CV, GitHub, Telegram) |
| Experience | 8 companies with responsibilities, achievements, and tech stack |
| Education | HSE University (in progress), Kuban State University, UlSTU |
| Projects | ResumeCraft, ICAIMT 2026, Career-Ops, Avito Travel |
| Skills | 6 categories: Backend, Data, Infrastructure, AI/ML, Product, Architecture |
| Contact | Email, GitHub, Telegram |

---

## Deployment

The site auto-deploys to GitHub Pages on every push to `main`:

1. GitHub Actions runs `npm ci && npm run build`
2. The `dist/` artifact is uploaded via `actions/upload-pages-artifact`
3. Deployed via `actions/deploy-pages`

**Setup:** Settings → Pages → Source: **GitHub Actions**

---

## License

MIT

---

## Connect

[![Website](https://img.shields.io/badge/fighter90.github.io-000?style=for-the-badge&logo=safari&logoColor=white)](https://fighter90.github.io)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Fighter90)
[![Email](https://img.shields.io/badge/Email-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:pochtasergeia@gmail.com)
[![Telegram](https://img.shields.io/badge/Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/fighter90)
