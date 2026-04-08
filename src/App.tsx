import { useEffect, useState, useRef, useCallback } from 'react'
import {
  Mail, Github, Send, Briefcase, GraduationCap, Code2, FolderOpen,
  MapPin, Building2, Calendar, ChevronDown, ExternalLink, Award,
  Layout, MessageCircle, Menu, X
} from 'lucide-react'
import { translations } from './i18n'
import { useLang } from './contexts/LangContext'

/* ─── LinkedIn SVG ─── */
function LinkedInIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
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
    const headings = document.querySelectorAll('section[id]')
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -75% 0px' }
    )
    headings.forEach((h) => io.observe(h))
    return () => io.disconnect()
  }, [])
  return activeId
}

function Section({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null)
  const visible = useInView(ref)
  return (
    <section
      ref={ref}
      id={id}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
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
      const isDark = document.documentElement.classList.contains('dark')
      ctx.fillStyle = isDark ? 'rgba(148,163,184,0.12)' : 'rgba(100,116,139,0.18)'
      for (let x = gap; x < w; x += gap)
        for (let y = gap; y < h; y += gap) {
          ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill()
        }
    }
    resize()
    window.addEventListener('resize', resize)
    const mo = new MutationObserver(draw)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => { window.removeEventListener('resize', resize); mo.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}

/* ─── Sticky Nav ─── */

function StickyNav() {
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
    { id: 'contact', label: t.nav.contact },
  ]

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }, [])

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-4xl mx-auto px-6 flex items-center justify-between h-14">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-display font-bold text-foreground text-lg hover:text-primary transition-colors"
        >
          {lang === 'ru' ? 'СЕ' : 'SE'}
        </button>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollTo(id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeSection === id
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <div className="px-6 py-3 space-y-1">
            {links.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollTo(id)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === id
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

/* ─── Floating Telegram CTA ─── */

function FloatingCTA() {
  const { lang } = useLang()
  const t = translations[lang]
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <a
      href="https://t.me/fighter90"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-theme text-white font-medium shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
      style={{ animation: 'nav-fade-in 0.5s ease-out' }}
      title={t.hero.askMe}
    >
      <MessageCircle className="w-5 h-5" />
      <span className="hidden sm:inline">{t.hero.askMe}</span>
    </a>
  )
}

/* ─── Main App ─── */

export default function App() {
  const { lang } = useLang()
  const t = translations[lang]

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <div className="relative overflow-hidden">
        <DotGrid />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[hsl(var(--hero-orb-primary))] blur-[120px] pointer-events-none" style={{ animation: 'hero-glow 8s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(var(--hero-orb-accent))] blur-[100px] pointer-events-none" style={{ animation: 'hero-glow 10s ease-in-out infinite 2s' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-primary/30 overflow-hidden shadow-xl">
              <img src="/foto-avatar.webp" alt={t.hero.name} width={176} height={176} className="w-full h-full object-cover" />
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-2">{t.hero.name}</h1>
              <p className="text-xl sm:text-2xl font-display text-primary font-medium">{t.hero.role}</p>
              <p className="text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
                <Building2 className="w-4 h-4" />{t.hero.company}
              </p>
            </div>

            <p className="max-w-2xl text-muted-foreground leading-relaxed">{t.hero.bio}</p>

            <div className="flex flex-wrap justify-center gap-3 mt-2">
              <a href={lang === 'ru' ? '/Емельянов_Сергей_CV.pdf' : '/Sergey_Emelyanov_CV_EN.pdf'} download className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                <ChevronDown className="w-4 h-4" />{t.hero.downloadCV}
              </a>
              <a href="https://github.com/Fighter90" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium hover:border-primary/50 transition-colors">
                <Github className="w-4 h-4" />GitHub
              </a>
              <a href={`https://linkedin.com/in/${t.contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium hover:border-[hsl(var(--linkedin))]/50 transition-colors">
                <LinkedInIcon className="w-4 h-4" />LinkedIn
              </a>
              <a href="https://t.me/fighter90" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium hover:border-primary/50 transition-colors">
                <Send className="w-4 h-4" />{t.hero.telegram}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY NAV */}
      <StickyNav />

      <div className="max-w-4xl mx-auto px-6 pb-20 space-y-20 mt-12">

        {/* EXPERIENCE */}
        <Section id="experience">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-8 flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-primary" />{t.sections.experience}
          </h2>
          <div className="space-y-6">
            {t.experience.map((job, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors">
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

        {/* PORTFOLIO (Webguru projects) */}
        <Section id="portfolio">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-8 flex items-center gap-3">
            <Layout className="w-7 h-7 text-primary" />{t.sections.portfolio}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {t.portfolio.map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors flex flex-col group">
                <h3 className="text-lg font-display font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{item.name}</h3>
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
            {t.projects.map((proj, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-display font-semibold text-foreground">{proj.name}</h3>
                  {'url' in proj && proj.url && (
                    <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 shrink-0" aria-label={`Open ${proj.name}`}>
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
              <div key={i} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
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
            {Object.values(t.skills).map((cat) => (
              <div key={cat.title} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors">
                <h3 className="font-display font-semibold text-foreground mb-3">{cat.title}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map((skill: string) => (
                    <span key={skill} className="badge px-2.5 py-1 bg-muted text-muted-foreground text-xs">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
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
              <a href={`mailto:${t.contact.email}`} className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-primary/10 transition-colors group">
                <Mail className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-foreground font-medium text-sm">{t.contact.email}</p>
                </div>
              </a>
              <a href={`https://github.com/${t.contact.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-primary/10 transition-colors group">
                <Github className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-xs text-muted-foreground">GitHub</p>
                  <p className="text-foreground font-medium text-sm">{t.contact.github}</p>
                </div>
              </a>
              <a href={`https://linkedin.com/in/${t.contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-[hsl(var(--linkedin))]/10 transition-colors group">
                <LinkedInIcon className="w-5 h-5 text-[hsl(var(--linkedin))] group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-xs text-muted-foreground">LinkedIn</p>
                  <p className="text-foreground font-medium text-sm">{t.contact.linkedin}</p>
                </div>
              </a>
              <a href="https://t.me/fighter90" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-primary/10 transition-colors group">
                <Send className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-xs text-muted-foreground">Telegram</p>
                  <p className="text-foreground font-medium text-sm">{t.contact.telegram}</p>
                </div>
              </a>
            </div>
          </div>
        </Section>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 text-center">
        <p className="text-muted-foreground text-sm">{t.footer.builtWith}</p>
      </footer>

      {/* Floating Telegram CTA */}
      <FloatingCTA />
    </main>
  )
}
