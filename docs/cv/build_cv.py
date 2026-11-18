#!/usr/bin/env python3
"""Generate the downloadable CV (RU + EN) as HTML; render to PDF with headless Chrome.

Source of public/Emelyanov_Sergey_CV.pdf (RU) and public/Sergey_Emelyanov_CV_EN.pdf (EN).
Content mirrors the hh.ru resume "Team Lead / Tech Lead (PHP, Go)" (2026-11-18).

    python3 docs/cv/build_cv.py
    google-chrome --headless=new --no-pdf-header-footer --print-to-pdf=public/Emelyanov_Sergey_CV.pdf docs/cv/Sergei_Emelianov_CV_RU.html
    google-chrome --headless=new --no-pdf-header-footer --print-to-pdf=public/Sergey_Emelyanov_CV_EN.pdf docs/cv/Sergei_Emelianov_CV_EN.html
"""
from html import escape
from pathlib import Path

HERE = Path(__file__).resolve().parent

CSS = """
  @page { size: A4; margin: 14mm 15mm 14mm 15mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; font-size: 9.8pt; line-height: 1.4; color: #1a1a1a; margin: 0; }
  a { color: #1a4fa0; text-decoration: none; }
  header { display: flex; gap: 16px; align-items: flex-start; padding-bottom: 9px; border-bottom: 2px solid #1a4fa0; }
  header img { width: 86px; height: 86px; object-fit: cover; border-radius: 6px; }
  h1 { font-size: 21pt; margin: 0 0 2px; letter-spacing: .2px; }
  .title { font-size: 12pt; font-weight: 600; color: #1a4fa0; margin-bottom: 5px; }
  .contacts { font-size: 8.8pt; color: #333; }
  .contacts span { white-space: nowrap; margin-right: 11px; }
  h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: .8px; color: #1a4fa0; border-bottom: 1px solid #c9d4e6; padding-bottom: 2px; margin: 13px 0 7px; break-after: avoid; }
  .job { margin-bottom: 10px; }
  .job-head { display: flex; justify-content: space-between; gap: 12px; break-after: avoid; }
  .company { font-weight: 700; font-size: 10.6pt; }
  .role { font-weight: 600; color: #333; }
  .period { color: #555; font-size: 8.8pt; white-space: nowrap; text-align: right; }
  .about { color: #444; margin: 3px 0 3px; }
  ul { margin: 0 0 2px; padding-left: 15px; }
  li { margin: 1px 0; break-inside: avoid; }
  .stack { font-size: 8.8pt; color: #444; margin-top: 2px; }
  .stack b { color: #1a4fa0; }
  .grid { break-inside: avoid; display: grid; grid-template-columns: 128px 1fr; gap: 3px 12px; }
  .grid .k { color: #555; }
  .proj { margin-bottom: 6px; break-inside: avoid; }
  p { margin: 0 0 5px; }
"""

DATA = {
    "ru": {
        "lang": "ru", "file": "Sergei_Emelianov_CV_RU.html",
        "name": "Сергей Емельянов",
        "title": "Team Lead / Tech Lead (PHP, Go)",
        "contacts": [
            '✉ <a href="mailto:pochtasergeia@gmail.com">pochtasergeia@gmail.com</a> (предпочтительно)',
            "☎ +7 (918) 276-25-33",
            'Telegram: <a href="https://t.me/sergey_in_job">@sergey_in_job</a><br>',
            'Сайт: <a href="https://sergey-cv.com">sergey-cv.com</a>',
            'LinkedIn: <a href="https://www.linkedin.com/in/sergei-emelianov-in-job">sergei-emelianov-in-job</a>',
            'GitHub: <a href="https://github.com/Fighter90">Fighter90</a><br>',
            "Москва · гражданство РФ · без переезда, готов к командировкам · удалённо, гибрид или офис",
        ],
        "h": {"about": "Обо мне", "exp": "Опыт работы — 15 лет", "proj": "Собственные проекты",
              "edu": "Образование", "cert": "Курсы", "skills": "Навыки", "stack": "Стек", "repo": "репозиторий"},
        "about": [
            "Hands-on Tech Lead (PHP, Go): веду команду и сам проектирую архитектуру. В Rambler&amp;Co — техлид команды из 10 человек, 3 backend-разработчика в прямом подчинении. Переносим PHP-монолит на микросервисы Go (Kafka, Kubernetes), внедрил AI-разработку и RAG. Ранее — Team Lead в МТС Финтех (5 человек, найм, 1:1) и CTO собственной студии (до 8 человек, 50+ проектов). 15 лет в backend: платежи и биллинг, ставки и аукционы, ЭТП по 44-ФЗ и 223-ФЗ, highload B2C (Авито, Lamoda, Мамба).",
            "<b>Что ищу:</b> роль Tech Lead / Team Lead в продуктовой команде 3–8 человек, где лид сохраняет 30–50% инженерной работы. Интересны финтех и платежи, e-commerce и маркетплейсы, B2B-платформы, highload-медиа.",
        ],
        "jobs": [
            ("Rambler&amp;Co", "Tech Lead / Lead Backend Developer (PHP, Go)", "Март 2024 — н.в.<br>Москва",
             "Высоконагруженные медиасервисы — новости, спортивный портал «Чемпионат» (около 30 млн визитов в месяц), развлечения; B2C, SOA и микросервисы. Кросс-функциональная команда из 10 человек (backend, QA, аналитика, DevOps), 3 backend-разработчика в прямом подчинении. Kanban.",
             ["Веду перенос PHP-монолита на микросервисы Go: спроектировал и вывел в прод 10+ сервисов (часть — с нуля) на Kafka в Kubernetes — снизили нагрузку и связность монолита за счёт поэтапного выноса доменов и явных контрактов (REST и события).",
              "Внедрил AI-разработку в процесс команды: OpenCode как агент, LiteLLM как единый шлюз к моделям, harness для агентов — частота релизов выросла примерно в 1,5–2 раза.",
              "Вместе с коллегой спроектировал и запустил на Go RAG-систему для «Чемпионата» (индексация → Qdrant → retrieval → reranker → генерация через LLM-шлюз на GigaChat); раскатываем на редакционные инструменты и пользовательские сервисы.",
              "Руковожу 3 backend-разработчиками: 1:1, планы развития, онбординг, технические собеседования.",
              "Выстроил онбординг и обмен знаниями: документация в Confluence, code review как обучающий процесс, ротация задач — новички быстрее выходят на самостоятельные задачи, ключевые сервисы не завязаны на одного человека.",
              "Веду системный анализ требований, проектирую REST API и контракты между сервисами; переработал систему авторизации портала.",
              "Договариваюсь о приоритетах и зависимостях с продуктом, аналитикой и инфраструктурой; балансирую техдолг и бизнес-задачи."],
             "Go, PHP 8, Symfony, Apache Kafka, RabbitMQ, PostgreSQL, MySQL, MongoDB, Redis, Qdrant, Kubernetes, Docker, GitLab CI, LiteLLM, GigaChat"),
            ("Lamoda Tech", "Senior PHP Developer", "Октябрь 2022 — Февраль 2024<br>Москва",
             "Внутренние сервисы одной из крупнейших fashion e-commerce платформ России и СНГ. Scrum.",
             ["Доработал сервисы под расширение обязательной маркировки «Честный Знак» (ЦРПТ) — компания выполнила требования регулятора в срок, без штрафов.",
              "Перевёл все сервисы команды с PHP 7.4 на 8.1 и обновил Symfony под защитой тестов (PHPUnit, Codeception).",
              "Оптимизировал CI/CD — доставка изменений в прод стала быстрее примерно на 30%."],
             "PHP 8, Symfony, PostgreSQL, PHPUnit, Codeception, Docker, GitLab CI"),
            ("Rambler&amp;Co · рекламная платформа", "Senior PHP Developer", "Ноябрь 2021 — Июль 2022<br>Москва",
             "Ad-tech (B2B): ставки и аукционы рекламных позиций, биллинг и отчётность для рекламодателей.",
             ["Развивал на Go сервис ставок и аукционов рекламных позиций — ключевую подсистему доходности медийной сети.",
              "Переработал генерацию отчётности для рекламодателей; развивал REST API и асинхронное взаимодействие через Kafka."],
             "Go, PHP 8, Symfony, MariaDB, Redis, Apache Kafka, RabbitMQ, Docker"),
            ("МТС Финтех", "Team Lead (PHP)", "Ноябрь 2020 — Ноябрь 2021<br>Москва",
             "Платформенные B2B-сервисы финтех-направления МТС Банка. Команда 5–7 человек. Scrum.",
             ["Руководил командой из 5 разработчиков: найм и технические собеседования, 1:1, планы развития, бэклог с Product Owner, церемонии Scrum.",
              "С нуля спроектировал по DDD сервис централизованной конфигурации (feature flags, тарифы, бизнес-правила) — безопасные релизы, в том числе мобильных приложений.",
              "Спроектировал подсистему RBAC; поднял покрытие ключевых сценариев тестами до 85%."],
             "PHP, Laravel, Orchid, PostgreSQL, Redis, PHPUnit, Docker"),
            ("Webguru.pro", "CTO / Co-founder (собственная студия, part-time)", "Январь 2017 — Октябрь 2020",
             "Чат-боты, навыки Яндекс.Алисы, веб-сервисы и CRM. Заказчики — AB InBev, МегаФон, Alliance Retail Group. Команда до 8 человек.",
             ["Запустил студию с нуля и сдал 50+ проектов: ТЗ и бюджет, архитектура, code review, приёмка.",
              "Собрал и вёл команду до 8 человек; построил SaaS-конструктор AliceBot.pro и HR-бота скрининга (−50–70% времени рекрутеров)."],
             "PHP 7, Phalcon, Yii2, MySQL, Node.js, Bot API, Robokassa, Docker"),
            ("ЭТП Газпромбанка", "Senior PHP Developer", "Ноябрь 2016 — Август 2020<br>Москва",
             "B2B-площадка корпоративных закупок по 44-ФЗ и 223-ФЗ.",
             ["Реализовал микросервис биллинга участников торгов (карты, эквайринг, СБП) и интеграцию с ЕИС zakupki.gov.ru.",
              "Перевёл проект с PHP 5.6 на 7, оптимизировал запросы PostgreSQL системы торгов."],
             "PHP 5.6 / 7, Phalcon, Zend, PostgreSQL, Redis, Sphinx, RabbitMQ"),
            ("Авито · Мамба · Суточно.ру", "PHP Developer → Senior PHP Developer", "2011 — 2016",
             "",
             ["Авито: приём карт «Мир» в микросервисе биллинга. Мамба (tourbar.com): REST API для iOS/Android, поиск на Elasticsearch по миллионам профилей.",
              "Суточно.ру: аукцион поднятия объявлений в ТОП, единый приём платежей, автоматизация до 90% рутины бухгалтерии."],
             ""),
        ],
        "projects": [
            ("CVStart — career-ops-ui", "https://cvstart.org/ru/", "https://github.com/Fighter90/career-ops-ui",
             "Open-source командный центр поиска работы: 140+ источников вакансий, AI-оценка по CV, CV Studio, 19 языков, 18 LLM-провайдеров, 8 500+ автотестов, MIT."),
            ("Стратег — strategyproduct.ru", "https://strategyproduct.ru/", "https://github.com/Fighter90/product-factory-strategist-agent",
             "Открытый ИИ-агент для руководителя продукта: 12 шагов от запроса к проверяемой стратегии, реестр доказательств, Excel-модели, six-pager; Python CLI/MCP."),
            ("ProductCamp Analytics — dashboardcamp.ru", "https://dashboardcamp.ru/", "https://github.com/Fighter90/ai-product-copilot",
             "Яндекс.Метрика → SQLite → кабинет с ролями: real-time воронка, отчёты DOCX/PDF с AI-гипотезами по ICE, RAG-ассистент; TypeScript, Fastify, React."),
        ],
        "edu": [
            ("2027", "<b>НИУ ВШЭ, Москва</b><br>Факультет бизнес-информатики — «Управление продуктом в ИТ-бизнесе» (магистратура, в процессе)"),
            ("2012", "<b>Ульяновский государственный технический университет</b><br>Информационные системы и технологии"),
        ],
        "certs": "Podlodka Techlead Crew #11 · Podlodka Go Crew #7 · Agents Week ШАД Яндекса · Podlodka AI Crew #4: Multi-Agent Systems (2026)",
        "skills": [
            ("Лидерство", "Управление командой, найм, 1:1, менторство, code review, Scrum / Kanban, управление техдолгом"),
            ("Backend", "Go, PHP 8, Symfony, Laravel, Phalcon; REST API, DDD, микросервисы, System Design, highload"),
            ("Данные и очереди", "PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch, Apache Kafka, RabbitMQ, Qdrant"),
            ("Инфраструктура", "Kubernetes, Docker, GitLab CI, CI/CD, Linux, Nginx"),
            ("AI", "RAG, LLM-шлюзы (LiteLLM), GigaChat, агентная разработка (Claude Code, OpenCode, Cursor)"),
            ("Домены", "Платежи и биллинг, ставки и аукционы, ЭТП (44-ФЗ / 223-ФЗ), highload B2C"),
            ("Языки", "Русский — родной; английский — B2"),
        ],
    },
    "en": {
        "lang": "en", "file": "Sergei_Emelianov_CV_EN.html",
        "name": "Sergei Emelianov",
        "title": "Team Lead / Tech Lead (PHP, Go)",
        "contacts": [
            '✉ <a href="mailto:pochtasergeia@gmail.com">pochtasergeia@gmail.com</a> (preferred)',
            "☎ +7 (918) 276-25-33",
            'Telegram: <a href="https://t.me/sergey_in_job">@sergey_in_job</a><br>',
            'Site: <a href="https://sergey-cv.com">sergey-cv.com</a>',
            'LinkedIn: <a href="https://www.linkedin.com/in/sergei-emelianov-in-job">sergei-emelianov-in-job</a>',
            'GitHub: <a href="https://github.com/Fighter90">Fighter90</a><br>',
            "Moscow, Russia · not relocating, open to business travel · remote, hybrid or on-site",
        ],
        "h": {"about": "Summary", "exp": "Work Experience — 15 years", "proj": "Own Projects",
              "edu": "Education", "cert": "Courses", "skills": "Skills", "stack": "Stack", "repo": "repo"},
        "about": [
            "Hands-on Tech Lead (PHP, Go): I lead the team and design the architecture myself. At Rambler&amp;Co I am the tech lead of a 10-person team with 3 backend engineers reporting to me; we are moving a PHP monolith to Go microservices (Kafka, Kubernetes), and I introduced AI-assisted development and RAG. Previously Team Lead at MTS Fintech (5 people, hiring, 1:1s) and CTO of my own studio (up to 8 people, 50+ projects). 15 years in backend: payments and billing, bidding and auctions, e-procurement platforms (Russian federal laws 44-FZ / 223-FZ), high-load B2C (Avito, Lamoda, Mamba).",
            "<b>Looking for:</b> a Tech Lead / Team Lead role in a product team of 3–8 engineers, keeping 30–50% hands-on engineering. Fintech and payments, e-commerce and marketplaces, B2B platforms, high-load media.",
        ],
        "jobs": [
            ("Rambler&amp;Co", "Tech Lead / Lead Backend Developer (PHP, Go)", "March 2024 — present<br>Moscow",
             "High-load media services — news, the Championat sports portal (about 30M visits a month), entertainment; B2C, SOA and microservices. Cross-functional team of 10 (backend, QA, analytics, DevOps), 3 backend engineers reporting to me. Kanban.",
             ["Leading the move from a PHP monolith to Go microservices: designed and shipped 10+ services (some from scratch) on Kafka in Kubernetes — reduced monolith load and coupling through stepwise domain extraction and explicit contracts (REST and events).",
              "Introduced AI-assisted development into the team process: OpenCode as the coding agent, LiteLLM as a single model gateway, an agent harness — release frequency up roughly 1.5–2x.",
              "Together with a colleague, designed and launched a Go RAG system for Championat (indexing → Qdrant → retrieval → reranker → generation through an LLM gateway on GigaChat); now rolling it out to editorial tools and user-facing services.",
              "Manage 3 backend engineers: one-on-ones, growth plans, onboarding, technical interviews.",
              "Built onboarding and knowledge sharing: Confluence documentation, code review as a learning process, task rotation — new engineers become independent faster and key services no longer depend on one person.",
              "Run requirements analysis, design REST APIs and inter-service contracts; reworked the portal authorization system.",
              "Align priorities and dependencies with product, analytics and infrastructure; balance tech debt against business work."],
             "Go, PHP 8, Symfony, Apache Kafka, RabbitMQ, PostgreSQL, MySQL, MongoDB, Redis, Qdrant, Kubernetes, Docker, GitLab CI, LiteLLM, GigaChat"),
            ("Lamoda Tech", "Senior PHP Developer", "October 2022 — February 2024<br>Moscow",
             "Internal services of one of the largest fashion e-commerce platforms in Russia and the CIS. Scrum.",
             ["Adapted services to the expanded Chestny Znak (CRPT) mandatory product labeling — the company met the regulator's deadline with no penalties.",
              "Migrated all team services from PHP 7.4 to 8.1 and upgraded Symfony under test coverage (PHPUnit, Codeception).",
              "Optimized CI/CD — delivery to production about 30% faster."],
             "PHP 8, Symfony, PostgreSQL, PHPUnit, Codeception, Docker, GitLab CI"),
            ("Rambler&amp;Co · Advertising Platform", "Senior PHP Developer", "November 2021 — July 2022<br>Moscow",
             "Ad-tech (B2B): bidding and auctions for ad placements, billing and reporting for advertisers.",
             ["Evolved the Go bidding and auction service — a key subsystem of media-network revenue.",
              "Reworked advertiser reporting; evolved REST APIs and asynchronous communication via Kafka."],
             "Go, PHP 8, Symfony, MariaDB, Redis, Apache Kafka, RabbitMQ, Docker"),
            ("MTS Fintech", "Team Lead (PHP)", "November 2020 — November 2021<br>Moscow",
             "Platform B2B services of the MTS Bank fintech unit. Team of 5–7. Scrum.",
             ["Led a team of 5 engineers: hiring and technical interviews, one-on-ones, growth plans, backlog with the Product Owner, Scrum ceremonies.",
              "Designed from scratch with DDD a centralized configuration service (feature flags, pricing, business rules) — safe releases, including mobile apps.",
              "Designed the RBAC subsystem; raised test coverage of key scenarios to 85%."],
             "PHP, Laravel, Orchid, PostgreSQL, Redis, PHPUnit, Docker"),
            ("Webguru.pro", "CTO / Co-founder (own studio, part-time)", "January 2017 — October 2020",
             "Chatbots, Yandex Alice skills, web services and CRMs. Clients — AB InBev, MegaFon, Alliance Retail Group. Team of up to 8.",
             ["Launched the studio from scratch and delivered 50+ projects: specs and budgets, architecture, code review, acceptance.",
              "Built and led a team of up to 8; built the AliceBot.pro SaaS builder and an HR screening bot (−50–70% recruiter time)."],
             "PHP 7, Phalcon, Yii2, MySQL, Node.js, Bot API, Robokassa, Docker"),
            ("ETP Gazprombank", "Senior PHP Developer", "November 2016 — August 2020<br>Moscow",
             "B2B corporate procurement platform under 44-FZ and 223-FZ.",
             ["Built the participant billing microservice (cards, acquiring, SBP) and the integration with the government EIS (zakupki.gov.ru).",
              "Migrated the project from PHP 5.6 to 7, optimized PostgreSQL queries of the trading system."],
             "PHP 5.6 / 7, Phalcon, Zend, PostgreSQL, Redis, Sphinx, RabbitMQ"),
            ("Avito · Mamba · Sutochno.ru", "PHP Developer → Senior PHP Developer", "2011 — 2016",
             "",
             ["Avito: MIR card payments in the billing microservice. Mamba (tourbar.com): REST API for iOS/Android, Elasticsearch search over millions of profiles.",
              "Sutochno.ru: auction-based top listings, unified payments, automation of up to 90% of accounting routine."],
             ""),
        ],
        "projects": [
            ("CVStart — career-ops-ui", "https://cvstart.org/", "https://github.com/Fighter90/career-ops-ui",
             "Open-source job search command center: 140+ job sources, AI fit scoring against your CV, CV Studio, 19 languages, 18 LLM providers, 8,500+ tests, MIT."),
            ("Strategist — strategyproduct.ru", "https://strategyproduct.ru/en/", "https://github.com/Fighter90/product-factory-strategist-agent",
             "Open AI agent for product directors: 12 steps from a vague request to a verifiable strategy, evidence registry, Excel models, six-pager; Python CLI/MCP."),
            ("ProductCamp Analytics — dashboardcamp.ru", "https://dashboardcamp.ru/", "https://github.com/Fighter90/ai-product-copilot",
             "Yandex Metrika → SQLite → role-based cabinet: real-time funnel, DOCX/PDF reports with ICE-scored AI hypotheses, RAG assistant; TypeScript, Fastify, React."),
        ],
        "edu": [
            ("2027", "<b>HSE University, Moscow</b><br>Faculty of Business Informatics — IT Product Management (Master's, in progress)"),
            ("2012", "<b>Ulyanovsk State Technical University</b><br>Information Systems and Technologies"),
        ],
        "certs": "Podlodka Techlead Crew #11 · Podlodka Go Crew #7 · Agents Week, Yandex School of Data Analysis · Podlodka AI Crew #4: Multi-Agent Systems (2026)",
        "skills": [
            ("Leadership", "Team management, hiring, one-on-ones, mentoring, code review, Scrum / Kanban, tech-debt management"),
            ("Backend", "Go, PHP 8, Symfony, Laravel, Phalcon; REST APIs, DDD, microservices, system design, high-load"),
            ("Data & messaging", "PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch, Apache Kafka, RabbitMQ, Qdrant"),
            ("Infrastructure", "Kubernetes, Docker, GitLab CI, CI/CD, Linux, Nginx"),
            ("AI", "RAG, LLM gateways (LiteLLM), GigaChat, agentic development (Claude Code, OpenCode, Cursor)"),
            ("Domains", "Payments and billing, bidding and auctions, e-procurement, high-load B2C"),
            ("Languages", "Russian — native; English — B2 (upper-intermediate)"),
        ],
    },
}


def render(d):
    h = d["h"]
    out = [f'<!doctype html>\n<html lang="{d["lang"]}">\n<head>\n<meta charset="utf-8">\n<title>{d["name"]} — CV</title>\n'
           f'<!-- Generated by docs/cv/build_cv.py — edit the data there, not this file. -->\n<style>{CSS}</style>\n</head>\n<body>\n']
    out.append(f'<header>\n  <img src="../../public/foto-avatar.webp" alt="{d["name"]}">\n  <div>\n    <h1>{d["name"]}</h1>\n'
               f'    <div class="title">{d["title"]}</div>\n    <div class="contacts">'
               + "".join(f"<span>{c}</span>" if not c.endswith("<br>") else f"<span>{c[:-4]}</span><br>" for c in d["contacts"])
               + '</div>\n  </div>\n</header>\n')
    out.append(f'<h2>{h["about"]}</h2>\n' + "".join(f"<p>{p}</p>\n" for p in d["about"]))
    out.append(f'<h2>{h["exp"]}</h2>\n')
    for company, role, period, about, bullets, stack in d["jobs"]:
        out.append(f'<div class="job">\n  <div class="job-head">\n    <div><div class="company">{company}</div><div class="role">{role}</div></div>\n'
                   f'    <div class="period">{period}</div>\n  </div>\n')
        if about:
            out.append(f'  <div class="about">{about}</div>\n')
        out.append("  <ul>" + "".join(f"<li>{b}</li>" for b in bullets) + "</ul>\n")
        if stack:
            out.append(f'  <div class="stack"><b>{h["stack"]}:</b> {stack}</div>\n')
        out.append("</div>\n")
    out.append(f'<h2>{h["proj"]}</h2>\n')
    for name, url, repo, text in d["projects"]:
        out.append(f'<div class="proj"><b><a href="{url}">{escape(name)}</a></b> · <a href="{repo}">{h["repo"]}</a><br>{text}</div>\n')
    out.append(f'<h2>{h["edu"]}</h2>\n<div class="grid">' + "".join(f'<div class="k">{k}</div><div>{v}</div>' for k, v in d["edu"]) + "</div>\n")
    out.append(f'<h2>{h["cert"]}</h2>\n<p>{d["certs"]}</p>\n')
    out.append(f'<h2>{h["skills"]}</h2>\n<div class="grid">' + "".join(f'<div class="k">{k}</div><div>{v}</div>' for k, v in d["skills"]) + "</div>\n")
    out.append("</body>\n</html>\n")
    return "".join(out)


if __name__ == "__main__":
    for d in DATA.values():
        (HERE / d["file"]).write_text(render(d), encoding="utf-8")
        print("wrote", d["file"])
