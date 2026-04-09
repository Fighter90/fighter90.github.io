# fighter90.github.io

> Интерактивное портфолио Senior Software Engineer (PHP/Go) с 14+ годами опыта в высоконагруженных системах. AI-ассистент на DeepSeek V3, параллакс-анимации, LinkedIn-интеграция.

[![Сайт](https://img.shields.io/badge/demo-fighter90.github.io-blue?style=flat-square)](https://fighter90.github.io)
[![Built with Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-blueviolet?style=flat-square)](https://claude.ai/code)

---

## Что реализовано

### AI-ассистент (чат-бот)
Плавающий чат в правом нижнем углу с реальной LLM:
- **DeepSeek V3** через OpenRouter API — стриминг токен-за-токеном
- **System prompt** обучен на полном CV: опыт, проекты, навыки, образование, контакты
- **Гибридный режим**: если OpenRouter недоступен → автоматический fallback на локальные ответы по ключевым словам
- **Quick prompts**: 4 кнопки быстрых вопросов (Опыт, Проекты, Почему я?, Контакт)
- **Auto-linkify**: ссылки, email, @telegram, LinkedIn — кликабельные в ответах
- **Мобильная версия**: полноэкранный чат на телефонах
- **Escape** закрывает чат, кнопка закрытия в хедере
- **Пульсирующая кнопка** (chat-glow анимация)

### Hero-секция
- **90vh** полноэкранный hero с immersive-эффектом
- **3 параллакс-орба** следуют за курсором мыши в разных направлениях
- **Плавающие символы кода** (`</>`, `{}`, `$`) с float-анимацией + параллакс
- **Пульсирующие кольца** вокруг аватара (2 кольца, разные скорости)
- **Градиентное имя** (cyan → purple)
- **Typewriter**: ротация 4 ролей с печатающимся текстом и мигающим курсором
- **Каскадная анимация** section-reveal с задержками

### Story-секция
- **BeamPill**: анимированные частицы (+ · ✦ 0 1) вокруг "14+"
- Навигационные пузыри: Мой путь, Что строю, Поговорим, Написать

### Контент
- **8 мест работы**: Rambler&Co, Lamoda, МТС Финтех, ЭТП ГПБ, Авито, Мамба, Суточно.ру — с обязанностями, достижениями и стеком
- **7 проектов в портфолио**: Alicebot.pro, vl-taxi.ru, система анкетирования, горячая линия, @braidsBot, StartBiz.Space, Karpala.ru
- **4 проекта**: ResumeCraft (SaaS), ICAIMT 2026 (Research), MirPrognoz (GraphRAG), Career-Ops (AI)
- **3 образования**: НИУ ВШЭ (в процессе), Кубанский ГУ, УлГТУ — с предметами
- **6 категорий навыков** с Lucide-иконками
- **3 отзыва клиентов**: МегаФон Ритейл, Альянс Ритейл Секьюрити, ЦС «ГАРАНТ» — с lightbox
- **LinkedIn-публикации**: iframe embed реальных постов

### Двуязычность (RU/EN)
- Переключатель с флагами (RU/EN)
- localStorage + автоопределение по `navigator.language`
- Все секции, кнопки, навигация — полностью на двух языках

### Навигация
- **Левый sidebar** (desktop xl+): фиксированный, с иконками секций, подсветка активного раздела
- **Mobile**: hamburger-кнопка с overlay-сайдбаром
- **Тёмная/светлая тема**: мгновенное переключение без FOUC

### Анимации
- Параллакс орбов за курсором мыши
- Card hover: подъём + тень
- Stagger-in: каскадное появление карточек
- Lightbox: zoom-анимация + body scroll lock + Escape
- Sidebar: translateX при наведении
- Button press: scale(0.97)
- Chat glow: пульсация кнопки чата

### SEO
- JSON-LD structured data (Person, WebSite)
- Open Graph мета-теги
- `llms.txt` для AI-краулеров
- `robots.txt`
- SVG favicon "SE"

---

## Архитектура AI-ассистента

```
User message
  │
  ▼
FloatingChat.tsx (React component, lazy-loaded)
  │
  ├─ Quick Prompt clicked?
  │   └─ Yes → sendToLLM(predefined question)
  │   └─ No  → sendToLLM(user typed text)
  │
  ▼
sendToLLM()
  │
  ├─ OPENROUTER_KEY exists?
  │   │
  │   ├─ Yes → callLLM() ──────────────────────────────────┐
  │   │         │                                           │
  │   │         ▼                                           │
  │   │   fetch('https://openrouter.ai/api/v1/chat/completions')
  │   │         │  POST, stream: true                       │
  │   │         │  model: deepseek/deepseek-chat-v3-0324    │
  │   │         │  headers: Authorization Bearer key        │
  │   │         │  body: system prompt + chat history        │
  │   │         │                                           │
  │   │         ▼                                           │
  │   │   ReadableStream reader                             │
  │   │         │  parse SSE: data: {"choices":[...]}       │
  │   │         │  extract delta.content                    │
  │   │         │  onChunk(token) → setStreamText()         │
  │   │         │  tokens appear in UI in real-time         │
  │   │         │                                           │
  │   │         ▼                                           │
  │   │   [DONE] → save full response as message            │
  │   │                                                     │
  │   └─ Error (401/network) → localFallback()  ◄───────────┘
  │
  └─ No key → localFallback()
              │
              ▼
        Keyword matching:
        "опыт/experience" → CV summary
        "проект/project"  → projects list
        "почему/why/hire" → value proposition
        "контакт/contact" → clickable links
        default           → "Напишите в Telegram"

System Prompt (trained on):
  ├─ 8 work experiences with details
  ├─ Tech stack (PHP, Go, Symfony, etc.)
  ├─ Education (HSE, Kuban SU, UlSTU)
  ├─ Projects (ResumeCraft, ICAIMT, MirPrognoz, Career-Ops)
  ├─ Portfolio (7 Webguru services)
  ├─ Client testimonials
  └─ Contact information

Linkify (auto-linking in responses):
  ├─ URLs → <a href>
  ├─ Emails → mailto:
  ├─ @handles → t.me/
  └─ linkedin:handle → linkedin.com/in/
```

---

## Стек технологий

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![DeepSeek](https://img.shields.io/badge/DeepSeek_V3-000000?style=flat&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter-6366F1?style=flat&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=flat&logo=github&logoColor=white)

---

## Структура проекта

```
src/
├── App.tsx                  # Hero (parallax, typewriter, BeamPill), Story,
│                            # Experience, Portfolio, Projects, Education,
│                            # Skills, Testimonials, Publications, Contact
├── GlobalNav.tsx            # Theme toggle + LangSwitcher
├── main.tsx                 # React entry: BrowserRouter + LangProvider
├── i18n.ts                  # Полный контент RU/EN (600+ строк)
├── index.css                # Tailwind v4, CSS variables, 15+ анимаций
├── contexts/
│   └── LangContext.tsx      # React Context: lang state, localStorage, auto-detect
└── components/
    ├── LangSwitcher.tsx     # RU/EN toggle с SVG-флагами
    └── FloatingChat.tsx     # AI-ассистент: OpenRouter + local fallback + Linkify

public/
├── 404.html                 # SPA redirect для GitHub Pages
├── favicon.svg              # "SE" initials
├── foto-avatar.webp         # Фото (384px)
├── foto-avatar-sm.webp      # Фото (192px, для чата)
├── testimonial-*.jpg        # 3 рекомендательных письма
├── Emelyanov_Sergey_CV.pdf   # CV (русский)
├── Sergey_Emelyanov_CV_EN.pdf # CV (английский)
├── Portfolio.pdf            # Портфолио Webguru
├── Portfolio.Services.pdf   # Портфолио сервисов
├── llms.txt                 # AI crawler info
├── robots.txt               # Search bot rules
└── fonts/                   # Space Grotesk + DM Sans

docs/                        # Исходные документы (не деплоятся)

.github/workflows/
└── deploy.yml               # npm ci → tsc → vite build → GitHub Pages
```

---

## Быстрый старт

```bash
git clone https://github.com/Fighter90/fighter90.github.io.git
cd fighter90.github.io
npm install
npm run dev
```

---

## Связь

[![Website](https://img.shields.io/badge/fighter90.github.io-000?style=for-the-badge&logo=safari&logoColor=white)](https://fighter90.github.io)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/sergey-emelyanov-in-job/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Fighter90)
[![Telegram](https://img.shields.io/badge/Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/sergey_in_job)
[![Email](https://img.shields.io/badge/Email-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:pochtasergeia@gmail.com)
