# Сергей Емельянов — Portfolio

> Интерактивное портфолио Senior Software Engineer (PHP/Go) с 14+ годами опыта

[![Сайт](https://img.shields.io/badge/сайт-fighter90.github.io-blue?style=flat-square)](https://fighter90.github.io)
[![Built with Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-blueviolet?style=flat-square)](https://claude.ai/code)

---

## О проекте

Интерактивное портфолио, которое демонстрирует навыки на практике: современный стек, двуязычный интерфейс (RU/EN), тёмная/светлая тема, анимации, адаптивный дизайн.

### Возможности

- **Двуязычность (RU/EN)** — переключатель языка с сохранением в localStorage
- **Тёмная/светлая тема** — переключение без вспышки, поддержка системных настроек
- **Навигация** — якорные ссылки на секции: Опыт, Проекты, Портфолио, Навыки, Контакты
- **8 мест работы** — Rambler&Co, Lamoda Tech, МТС Финтех, ЭТП Газпромбанка, Авито, Мамба, Суточно.ру
- **Портфолио веб-сервисов** — Alicebot.pro, vl-taxi.ru, система анкетирования, чат-боты, интернет-магазин в Telegram
- **4 проекта** — ResumeCraft, ICAIMT 2026, Career-Ops, Авито Путешествия
- **Интеграция с LinkedIn** — прямая ссылка на профиль
- **Скачивание CV** — PDF на русском и английском
- **SEO** — JSON-LD, Open Graph, llms.txt, robots.txt
- **GitHub Pages** — автоматический деплой через GitHub Actions

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
git clone https://github.com/Fighter90/fighter90.github.io.git
cd fighter90.github.io
npm install
npm run dev
```

Открыть [localhost:5173](http://localhost:5173)

---

## Структура проекта

```
src/
├── App.tsx                  # Главная страница — все секции портфолио
├── GlobalNav.tsx            # Навигация: меню, переключатель языка + темы
├── main.tsx                 # Точка входа React + BrowserRouter
├── i18n.ts                  # Двуязычные переводы (RU/EN)
├── index.css                # Глобальные стили, цветовые профили, шрифты
├── contexts/
│   └── LangContext.tsx      # React Context для управления языком
└── components/
    └── LangSwitcher.tsx     # Кнопка переключения RU/EN с флагами

public/
├── 404.html                 # SPA-редирект для GitHub Pages
├── llms.txt                 # Информация для AI-краулеров
├── robots.txt               # Правила для поисковых ботов
└── fonts/                   # Самохостинг шрифтов
```

---

## Деплой

Сайт автоматически деплоится на GitHub Pages при пуше в `main`.

**Настройка:** Settings → Pages → Source: **GitHub Actions**

---

## Связь

[![Website](https://img.shields.io/badge/fighter90.github.io-000?style=for-the-badge&logo=safari&logoColor=white)](https://fighter90.github.io)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Fighter90)
[![Email](https://img.shields.io/badge/Email-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:pochtasergeia@gmail.com)
[![Telegram](https://img.shields.io/badge/Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/fighter90)
