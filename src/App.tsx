import { useEffect, useState, useRef, useCallback, lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'
import {
  Mail, Github, Send, Briefcase, GraduationCap, Code2, FolderOpen,
  MapPin, Building2, Calendar, Download, ExternalLink, Award,
  Layout, Menu, X, Server, Database, Cloud, Sparkles,
  BarChart3, Network, FileText, Quote, BookOpen, Newspaper
} from 'lucide-react'
import { translations } from './i18n'
import { useLang } from './contexts/LangContext'

const FloatingChat = lazy(() => import('./components/FloatingChat'))

/* ─── LinkedIn SVG ─── */
function LinkedInIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

/* ─── Mouse Parallax Hook ─── */

function useMouseParallax(strength = 20) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      setOffset({ x: (e.clientX - cx) / cx * strength, y: (e.clientY - cy) / cy * strength })
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [strength])
  return offset
}

/* ─── Typewriter Hook (from santifer.io) ─── */

function useTypewriter(roles: readonly string[], { typeSpeed = 70, deleteSpeed = 50, pause = 2000 } = {}) {
  const [roleIndex, setRoleIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = roles[roleIndex]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && text === current) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && text === '') {
      timeout = setTimeout(() => { setRoleIndex((i) => (i + 1) % roles.length); setDeleting(false) }, 300)
    } else if (deleting) {
      timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), deleteSpeed)
    } else {
      timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), typeSpeed + Math.random() * 40)
    }
    return () => clearTimeout(timeout)
  }, [text, deleting, roleIndex, roles, typeSpeed, deleteSpeed, pause])

  return text
}

/* ─── Skill Category Icons ─── */
const skillIcons: Record<string, React.ReactNode> = {
  backend: <Server className="w-5 h-5 text-primary" />,
  data: <Database className="w-5 h-5 text-primary" />,
  infra: <Cloud className="w-5 h-5 text-primary" />,
  ai: <Sparkles className="w-5 h-5 text-primary" />,
  product: <BarChart3 className="w-5 h-5 text-primary" />,
  architecture: <Network className="w-5 h-5 text-primary" />,
}

const sectionIcons: Record<string, React.ReactNode> = {
  experience: <Briefcase className="w-4 h-4" />,
  portfolio: <Layout className="w-4 h-4" />,
  projects: <FolderOpen className="w-4 h-4" />,
  education: <GraduationCap className="w-4 h-4" />,
  skills: <Code2 className="w-4 h-4" />,
  testimonials: <Quote className="w-4 h-4" />,
  publications: <Newspaper className="w-4 h-4" />,
  contact: <Mail className="w-4 h-4" />,
}

/* ─── Hooks ─── */

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.1) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect() } }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, threshold])
  return visible
}

function useActiveSection() {
  const [activeId, setActiveId] = useState<string | null>(null)
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setActiveId(e.target.id)
    }, { rootMargin: '-80px 0px -75% 0px' })
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])
  return activeId
}

function Section({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null)
  const visible = useInView(ref)
  return (
    <section ref={ref} id={id} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </section>
  )
}

/* ─── Dot Grid ─── */

function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio
      canvas.height = canvas.offsetHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
      draw()
    }
    function draw() {
      if (!ctx || !canvas) return
      const w = canvas.offsetWidth, h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)
      const gap = 28
      ctx.fillStyle = document.documentElement.classList.contains('dark') ? 'rgba(148,163,184,0.12)' : 'rgba(100,116,139,0.18)'
      for (let x = gap; x < w; x += gap)
        for (let y = gap; y < h; y += gap) { ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill() }
    }
    resize()
    window.addEventListener('resize', resize)
    const mo = new MutationObserver(draw)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => { window.removeEventListener('resize', resize); mo.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}

/* ─── BeamPill (from santifer.io) ─── */

const HEAL_PARTICLES = [
  { char: '+', left: '10%', delay: '0s', dur: '2.8s', size: '20px' },
  { char: '·', left: '30%', delay: '0.6s', dur: '2.2s', size: '16px' },
  { char: '✦', left: '55%', delay: '1.2s', dur: '3s', size: '14px' },
  { char: '0', left: '75%', delay: '0.3s', dur: '2.5s', size: '18px' },
  { char: '1', left: '90%', delay: '1.8s', dur: '2.6s', size: '16px' },
]

function BeamPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      <span className="relative z-10 text-gradient-theme font-bold">{children}</span>
      {HEAL_PARTICLES.map((p, i) => (
        <span key={i} className="absolute pointer-events-none select-none" aria-hidden="true"
          style={{ left: p.left, bottom: '50%', fontSize: p.size, color: '#4ade80', opacity: 0, animation: `heal-float ${p.dur} ease-out ${p.delay} infinite` }}>
          {p.char}
        </span>
      ))}
    </span>
  )
}

/* ─── Story Section ─── */

function StorySection() {
  const { lang } = useLang()
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInView(ref as React.RefObject<HTMLElement | null>)

  const headline = lang === 'ru'
    ? { pre: '', highlight: '14+', post: ' лет разрабатываю высоконагруженные системы' }
    : { pre: '', highlight: '14+', post: ' years building high-load systems' }

  const subtext = lang === 'ru'
    ? 'От стартапов до крупнейших компаний России — backend, микросервисы, платёжные системы. Изучаю продуктовый менеджмент в НИУ ВШЭ и исследую агентный ИИ.'
    : "From startups to Russia's largest companies — backend, microservices, payment systems. Pursuing IT Product Management at HSE and researching agentic AI."

  const bubbles = lang === 'ru'
    ? [
        { icon: 'briefcase', label: 'Мой путь', href: '#experience' },
        { icon: 'folder', label: 'Что строю', href: '#portfolio' },
        { icon: 'mail', label: 'Поговорим', href: '#contact' },
        { icon: 'send', label: 'Написать', href: 'https://t.me/sergey_in_job', external: true, highlighted: true },
      ]
    : [
        { icon: 'briefcase', label: 'My path', href: '#experience' },
        { icon: 'folder', label: 'What I build', href: '#portfolio' },
        { icon: 'mail', label: "Let's talk", href: '#contact' },
        { icon: 'send', label: 'Message', href: 'https://t.me/sergey_in_job', external: true, highlighted: true },
      ]

  const iconMap: Record<string, React.ReactNode> = {
    briefcase: <Briefcase className="w-4 h-4" />,
    folder: <FolderOpen className="w-4 h-4" />,
    mail: <Mail className="w-4 h-4" />,
    send: <Send className="w-4 h-4" />,
  }

  return (
    <div ref={ref} className={`max-w-3xl mx-auto px-6 py-16 text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <p className="text-2xl sm:text-4xl font-display font-bold text-foreground mb-5">
        {headline.pre}<BeamPill>{headline.highlight}</BeamPill>{headline.post}
      </p>
      <p className="text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto text-lg">
        {subtext}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {bubbles.map((b) =>
          b.external ? (
            <a key={b.label} href={b.href} target="_blank" rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                b.highlighted ? 'bg-gradient-theme text-white shadow-lg hover:shadow-xl hover:scale-105' : 'bg-card border border-border text-foreground hover:border-primary/50'
              }`}>
              {iconMap[b.icon]}{b.label}
            </a>
          ) : (
            <a key={b.label} href={b.href}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-card border border-border text-foreground hover:border-primary/50 transition-all"
              onClick={(e) => { e.preventDefault(); document.querySelector(b.href)?.scrollIntoView({ behavior: 'smooth' }) }}>
              {iconMap[b.icon]}{b.label}
            </a>
          )
        )}
      </div>
    </div>
  )
}

/* ─── Left Sidebar ─── */

function LeftSidebar() {
  const { lang } = useLang()
  const t = translations[lang]
  const activeSection = useActiveSection()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { id: 'experience', label: t.nav.experience },
    { id: 'portfolio', label: t.nav.portfolio },
    { id: 'projects', label: t.nav.projects },
    { id: 'education', label: t.nav.education },
    { id: 'skills', label: t.nav.skills },
    { id: 'testimonials', label: t.sections.testimonials },
    { id: 'publications', label: t.nav.publications },
    { id: 'contact', label: t.nav.contact },
  ]

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }, [])

  const navItems = (isMobile: boolean) => (
    <nav className="space-y-1">
      {links.map(({ id, label }) => (
        <button key={id} type="button" onClick={() => scrollTo(id)}
          className={`sidebar-link flex items-center gap-2 w-full px-3 ${isMobile ? 'py-2.5' : 'py-2'} rounded-lg text-xs font-medium whitespace-nowrap ${
            activeSection === id
              ? 'text-primary bg-primary/10 border-l-2 border-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-l-2 border-transparent'
          }`}>
          {sectionIcons[id]}{label}
        </button>
      ))}
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar — centered vertically, fixed */}
      <aside className="hidden xl:flex fixed left-0 top-0 bottom-0 w-52 z-40 flex-col justify-center pl-5 pr-3">
        {navItems(false)}
      </aside>

      {/* Mobile hamburger */}
      <button type="button" onClick={() => setMobileOpen(!mobileOpen)}
        className="xl:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-card border border-border shadow-lg hover:border-primary/50 transition-colors"
        aria-label="Menu">
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="xl:hidden fixed inset-0 z-40 bg-background/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="xl:hidden fixed left-0 top-0 bottom-0 w-64 z-50 bg-card border-r border-border p-6 pt-20 shadow-2xl"
            style={{ animation: 'nav-fade-in 0.2s ease-out' }}>
            {navItems(true)}
          </aside>
        </>
      )}
    </>
  )
}

/* ─── Testimonial with expandable image ─── */

function TestimonialCard({ testimonial }: { testimonial: { company: string; person: string; text: string; date: string; image: string } }) {
  const [expanded, setExpanded] = useState(false)

  // Lock body scroll + Escape key when lightbox is open
  useEffect(() => {
    if (!expanded) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false) }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [expanded])

  return (
    <>
      <div className="bg-card border border-border rounded-2xl p-6 card-hover hover:border-primary/30">
        <div className="flex items-start gap-3 mb-3">
          <button type="button" onClick={() => setExpanded(true)}
            className="w-16 h-16 rounded-xl border-2 border-border overflow-hidden shrink-0 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer">
            <img src={testimonial.image} alt={testimonial.company} className="w-full h-full object-cover" loading="lazy" />
          </button>
          <div>
            <h3 className="font-display font-semibold text-foreground text-sm">{testimonial.company}</h3>
            <p className="text-muted-foreground text-xs">{testimonial.person}</p>
            <p className="text-muted-foreground text-xs">{testimonial.date}</p>
          </div>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed italic">"{testimonial.text}"</p>
      </div>

      {/* Lightbox — z-[200] to cover EVERYTHING including sidebar and chat */}
      {expanded && createPortal(
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6"
          onClick={() => setExpanded(false)} style={{ animation: 'lightbox-in 0.3s ease-out' }}>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={testimonial.image} alt={testimonial.company}
              className="w-full h-auto max-h-[90vh] object-contain rounded-2xl shadow-2xl" />
            <button type="button" onClick={() => setExpanded(false)}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 dark:bg-card flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

/* ─── Main App ─── */

export default function App() {
  const { lang } = useLang()
  const t = translations[lang]
  const roles = lang === 'ru'
    ? ['Senior Software Engineer', 'Backend-архитектор', 'PHP/Go разработчик', 'AI-исследователь'] as const
    : ['Senior Software Engineer', 'Backend Architect', 'PHP/Go Developer', 'AI Researcher'] as const
  const typedRole = useTypewriter(roles)

  const parallax = useMouseParallax(15)

  const filteredProjects = t.projects.filter(
    (proj) => proj.name !== 'Авито Путешествия' && proj.name !== 'Avito Travel'
  )

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ═══ HERO ═══ */}
      <div className="relative overflow-hidden min-h-[90vh] flex items-center">
        <DotGrid />
        {/* Parallax orbs — follow mouse */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[hsl(var(--hero-orb-primary))] blur-[140px] pointer-events-none" style={{ animation: 'hero-glow 8s ease-in-out infinite', transform: `translate(${parallax.x}px, ${parallax.y}px)` }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[hsl(var(--hero-orb-accent))] blur-[120px] pointer-events-none" style={{ animation: 'hero-glow 10s ease-in-out infinite 2s', transform: `translate(${-parallax.x * 0.7}px, ${-parallax.y * 0.7}px)` }} />
        {/* Extra subtle orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[hsl(var(--gradient-to))] opacity-[0.04] blur-[80px] pointer-events-none" style={{ transform: `translate(calc(-50% + ${parallax.x * 0.3}px), calc(-50% + ${parallax.y * 0.3}px))` }} />

        {/* Floating decorative elements */}
        <div className="absolute top-20 right-[15%] text-primary/10 text-6xl font-mono pointer-events-none select-none" style={{ animation: 'float 4s ease-in-out infinite', transform: `translate(${parallax.x * 0.5}px, ${parallax.y * 0.5}px)` }}>&lt;/&gt;</div>
        <div className="absolute bottom-32 left-[10%] text-accent/10 text-5xl font-mono pointer-events-none select-none" style={{ animation: 'float 5s ease-in-out infinite 1s', transform: `translate(${-parallax.x * 0.4}px, ${-parallax.y * 0.4}px)` }}>&#123;&#125;</div>
        <div className="absolute top-[40%] right-[8%] text-primary/8 text-4xl font-mono pointer-events-none select-none hidden sm:block" style={{ animation: 'float 6s ease-in-out infinite 2s', transform: `translate(${parallax.x * 0.6}px, ${parallax.y * 0.3}px)` }}>$</div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 sm:py-24">
          <div className="flex flex-col items-center text-center gap-6">
            {/* Avatar with pulsing ring */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full border-2 border-primary/40 scale-110" style={{ animation: 'hero-glow 3s ease-in-out infinite' }} />
              <div className="absolute inset-0 rounded-full border border-accent/20 scale-125" style={{ animation: 'hero-glow 4s ease-in-out infinite 1s' }} />
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-primary/30 overflow-hidden shadow-xl relative z-10 animate-shimmer">
                <img src="/foto-avatar.webp" alt={t.hero.name} width={176} height={176} className="w-full h-full object-cover" />
              </div>
            </div>

            <div style={{ animation: 'section-reveal 0.8s ease-out 0.2s both' }}>
              <h1 className="text-4xl sm:text-6xl font-display font-bold mb-3">
                <span className="text-gradient-theme">{t.hero.name}</span>
              </h1>
              <p className="text-xl sm:text-2xl font-display text-primary font-medium h-8 sm:h-10">
                {typedRole}<span className="inline-block w-0.5 h-5 sm:h-6 bg-primary ml-0.5 align-middle" style={{ animation: 'blink 1s step-end infinite' }} />
              </p>
              <p className="text-muted-foreground mt-2 flex items-center justify-center gap-1.5">
                <Building2 className="w-4 h-4" />{t.hero.company}
              </p>
            </div>

            <p className="max-w-2xl text-muted-foreground leading-relaxed text-lg" style={{ animation: 'section-reveal 0.8s ease-out 0.4s both' }}>{t.hero.bio}</p>

            <div className="flex flex-wrap justify-center gap-3 mt-2" style={{ animation: 'section-reveal 0.8s ease-out 0.6s both' }}>
              <a href={lang === 'ru' ? '/Емельянов_Сергей_CV.pdf' : '/Sergey_Emelyanov_CV_EN.pdf'} download
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-theme text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                <Download className="w-4 h-4" />{t.hero.downloadCV}
              </a>
              <a href="https://github.com/Fighter90" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium hover:border-primary/50 hover:shadow-lg transition-all">
                <Github className="w-4 h-4" />GitHub
              </a>
              <a href={`https://www.linkedin.com/in/${t.contact.linkedin}/`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium hover:border-[hsl(var(--linkedin))]/50 hover:shadow-lg transition-all">
                <LinkedInIcon className="w-4 h-4" />LinkedIn
              </a>
              <a href="https://t.me/sergey_in_job" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium hover:border-primary/50 hover:shadow-lg transition-all">
                <Send className="w-4 h-4" />{t.hero.telegram}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ STORY ═══ */}
      <StorySection />

      {/* ═══ LEFT SIDEBAR ═══ */}
      <LeftSidebar />

      {/* ═══ MAIN CONTENT (centered, not shifted) ═══ */}
      <div className="max-w-4xl mx-auto px-6 pb-20 space-y-20">

        {/* EXPERIENCE */}
        <Section id="experience">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-8 flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-primary" />{t.sections.experience}
          </h2>
          <div className="space-y-6">
            {t.experience.map((job, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 card-hover hover:border-primary/30" style={{ animation: `stagger-in 0.5s ease-out ${i * 0.1}s both` }}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-3">
                  <div>
                    <h3 className="text-lg font-display font-semibold text-foreground">{job.company}</h3>
                    <p className="text-primary font-medium">{job.role}</p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-0.5 shrink-0">
                    <span className="flex items-center gap-1 text-muted-foreground text-sm"><Calendar className="w-3.5 h-3.5" />{job.period}</span>
                    <span className="flex items-center gap-1 text-muted-foreground text-sm"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-3 italic">{job.description}</p>
                <ul className="space-y-1 mb-3">
                  {job.responsibilities.map((r, j) => (
                    <li key={j} className="text-muted-foreground text-sm flex gap-2"><span className="text-primary mt-0.5 shrink-0">-</span>{r}</li>
                  ))}
                </ul>
                {'achievements' in job && job.achievements && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-foreground mb-1 flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-gold" />{t.sections.achievements}:</p>
                    <ul className="space-y-1">
                      {job.achievements.map((a, j) => (
                        <li key={j} className="text-muted-foreground text-sm flex gap-2"><span className="text-gold mt-0.5 shrink-0">&#10003;</span>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-muted-foreground"><span className="text-primary font-medium">{t.sections.stack}:</span> {job.stack}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* PORTFOLIO */}
        <Section id="portfolio">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
            <Layout className="w-7 h-7 text-primary" />{t.sections.portfolio}
          </h2>
          <div className="flex flex-wrap gap-3 mb-8">
            <a href="/Portfolio.pdf" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:border-primary/50 transition-colors">
              <FileText className="w-4 h-4 text-primary" />{lang === 'ru' ? 'Портфолио (PDF)' : 'Portfolio (PDF)'}
            </a>
            <a href="/Portfolio.Services.pdf" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-foreground text-sm font-medium hover:border-primary/50 transition-colors">
              <FileText className="w-4 h-4 text-primary" />{lang === 'ru' ? 'Портфолио сервисов (PDF)' : 'Services Portfolio (PDF)'}
            </a>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {t.portfolio.map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 card-hover hover:border-primary/30 flex flex-col group" style={{ animation: `stagger-in 0.4s ease-out ${i * 0.08}s both` }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-lg font-display font-semibold text-foreground group-hover:text-primary transition-colors">{item.name}</h3>
                  {'url' in item && item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 shrink-0" aria-label={item.name}>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-primary text-sm font-medium mb-3">{item.description}</p>
                <ul className="space-y-1.5 mb-4 flex-1">
                  {item.details.map((d: string, j: number) => (
                    <li key={j} className="text-muted-foreground text-sm flex gap-2"><span className="text-primary/60 mt-0.5 shrink-0">&#8226;</span>{d}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag: string) => (
                    <span key={tag} className="badge px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* PROJECTS */}
        <Section id="projects">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-8 flex items-center gap-3">
            <FolderOpen className="w-7 h-7 text-primary" />{t.sections.projects}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredProjects.map((proj, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-display font-semibold text-foreground">{proj.name}</h3>
                  {'url' in proj && proj.url && (
                    <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 shrink-0" aria-label={proj.name}>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-primary text-sm font-medium mb-1">{proj.description}</p>
                <p className="text-muted-foreground text-sm mb-3 flex-1">{proj.details}</p>
                <div className="flex flex-wrap gap-1.5">
                  {proj.tags.map((tag: string) => (
                    <span key={tag} className="badge px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* EDUCATION */}
        <Section id="education">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-8 flex items-center gap-3">
            <GraduationCap className="w-7 h-7 text-primary" />{t.sections.education}
          </h2>
          <div className="grid gap-4">
            {t.education.map((edu, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 card-hover hover:border-primary/30">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                  <div>
                    <h3 className="text-lg font-display font-semibold text-foreground">{edu.institution}</h3>
                    <p className="text-primary font-medium">{edu.degree} — {edu.field}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-1 text-muted-foreground text-sm"><Calendar className="w-3.5 h-3.5" />{edu.period}</span>
                    {'note' in edu && edu.note && (
                      <span className="badge px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 text-xs">{edu.note}</span>
                    )}
                  </div>
                </div>
                {'courses' in edu && edu.courses && (
                  <div className="flex items-start gap-2 mt-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex flex-wrap gap-1.5">
                      {edu.courses.map((c: string) => (
                        <span key={c} className="badge px-2 py-0.5 bg-muted text-muted-foreground text-xs">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* SKILLS */}
        <Section id="skills">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-8 flex items-center gap-3">
            <Code2 className="w-7 h-7 text-primary" />{t.sections.skills}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(t.skills).map(([key, cat]) => (
              <div key={cat.title} className="bg-card border border-border rounded-2xl p-5 card-hover hover:border-primary/30">
                <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                  {skillIcons[key]}{cat.title}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map((skill: string) => (
                    <span key={skill} className="badge px-2.5 py-1 bg-muted text-muted-foreground text-xs">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* TESTIMONIALS */}
        <Section id="testimonials">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-8 flex items-center gap-3">
            <Quote className="w-7 h-7 text-primary" />{t.sections.testimonials}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.testimonials.map((item, i) => (
              <TestimonialCard key={i} testimonial={item} />
            ))}
          </div>
        </Section>

        {/* PUBLICATIONS (LinkedIn embeds) */}
        <Section id="publications">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-8 flex items-center gap-3">
            <Newspaper className="w-7 h-7 text-primary" />{t.sections.publications}
          </h2>
          <div className="space-y-6">
            <div className="rounded-2xl overflow-hidden border border-border card-hover bg-white max-w-2xl mx-auto">
              <iframe
                src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7447067513676251136"
                height="700"
                width="100%"
                frameBorder="0"
                allowFullScreen
                title={lang === 'ru' ? 'Публикация LinkedIn' : 'LinkedIn Post'}
                className="w-full"
              />
            </div>
            <div className="rounded-2xl overflow-hidden border border-border card-hover bg-white max-w-2xl mx-auto">
              <iframe
                src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7438922296997687296"
                height="700"
                width="100%"
                frameBorder="0"
                allowFullScreen
                title={lang === 'ru' ? 'Публикация LinkedIn — ICAIMT 2026' : 'LinkedIn Post — ICAIMT 2026'}
                className="w-full"
              />
            </div>
          </div>
        </Section>

        {/* CONTACT */}
        <Section id="contact">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
            <Mail className="w-7 h-7 text-primary" />{t.sections.letsChat}
          </h2>
          <p className="text-muted-foreground mb-8">{t.sections.letsChatDesc}</p>
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <a href={`mailto:${t.contact.email}`} className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-primary/10 transition-colors group min-w-0">
                <Mail className="w-5 h-5 text-primary group-hover:scale-110 transition-transform shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-foreground font-medium text-xs sm:text-sm truncate">{t.contact.email}</p>
                </div>
              </a>
              <a href={`https://github.com/${t.contact.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-primary/10 transition-colors group">
                <Github className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <div><p className="text-xs text-muted-foreground">GitHub</p><p className="text-foreground font-medium text-sm">{t.contact.github}</p></div>
              </a>
              <a href={`https://www.linkedin.com/in/${t.contact.linkedin}/`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-[hsl(var(--linkedin))]/10 transition-colors group min-w-0">
                <LinkedInIcon className="w-5 h-5 text-[hsl(var(--linkedin))] group-hover:scale-110 transition-transform shrink-0" />
                <div className="min-w-0"><p className="text-xs text-muted-foreground">LinkedIn</p><p className="text-foreground font-medium text-xs sm:text-sm truncate">{t.contact.linkedin}</p></div>
              </a>
              <a href="https://t.me/sergey_in_job" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-primary/10 transition-colors group">
                <Send className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <div><p className="text-xs text-muted-foreground">Telegram</p><p className="text-foreground font-medium text-sm">{t.contact.telegram}</p></div>
              </a>
            </div>
          </div>
        </Section>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 text-center">
        <p className="text-muted-foreground text-sm">{t.footer.builtWith}</p>
      </footer>

      {/* AI CHAT ASSISTANT */}
      <Suspense fallback={null}>
        <FloatingChat />
      </Suspense>
    </main>
  )
}
