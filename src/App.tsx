import { useEffect, useState, useRef } from 'react'
import {
  Mail, Github, Send, Briefcase, GraduationCap, Code2, FolderOpen,
  MapPin, Building2, Calendar, ChevronDown, ExternalLink, Award
} from 'lucide-react'
import { translations } from './i18n'
import { useLang } from './contexts/LangContext'

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

/* ─── Hero Dot Grid (canvas) ─── */

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
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      const gap = 28
      const isDark = document.documentElement.classList.contains('dark')
      ctx.fillStyle = isDark ? 'rgba(148,163,184,0.12)' : 'rgba(100,116,139,0.18)'

      for (let x = gap; x < w; x += gap) {
        for (let y = gap; y < h; y += gap) {
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, Math.PI * 2)
          ctx.fill()
        }
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

/* ─── Main App ─── */

export default function App() {
  const { lang } = useLang()
  const t = translations[lang]

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <div className="relative overflow-hidden">
        <DotGrid />
        {/* Ambient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[hsl(var(--hero-orb-primary))] blur-[120px] pointer-events-none" style={{ animation: 'hero-glow 8s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(var(--hero-orb-accent))] blur-[100px] pointer-events-none" style={{ animation: 'hero-glow 10s ease-in-out infinite 2s' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
          <div className="flex flex-col items-center text-center gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-primary/30 overflow-hidden shadow-xl">
              <img
                src="/foto-avatar.webp"
                alt={t.hero.name}
                width={160}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-2">
                {t.hero.name}
              </h1>
              <p className="text-xl sm:text-2xl font-display text-primary font-medium">
                {t.hero.role}
              </p>
              <p className="text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
                <Building2 className="w-4 h-4" />
                {t.hero.company}
              </p>
            </div>

            <p className="max-w-2xl text-muted-foreground leading-relaxed">
              {t.hero.bio}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              <a
                href={lang === 'ru' ? '/Емельянов_Сергей_CV.pdf' : '/Sergey_Emelyanov_CV_EN.pdf'}
                download
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
                {t.hero.downloadCV}
              </a>
              <a
                href="https://github.com/Fighter90"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium hover:border-primary/50 transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <a
                href="https://t.me/fighter90"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium hover:border-primary/50 transition-colors"
              >
                <Send className="w-4 h-4" />
                {t.hero.telegram}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-20 space-y-20">

        {/* EXPERIENCE */}
        <Section id="experience">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-8 flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-primary" />
            {t.sections.experience}
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
                    <span className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Calendar className="w-3.5 h-3.5" />
                      {job.period}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground text-sm">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-3 italic">{job.description}</p>

                <ul className="space-y-1 mb-3">
                  {job.responsibilities.map((r, j) => (
                    <li key={j} className="text-muted-foreground text-sm flex gap-2">
                      <span className="text-primary mt-0.5 shrink-0">-</span>
                      {r}
                    </li>
                  ))}
                </ul>

                {'achievements' in job && job.achievements && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-foreground mb-1 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-gold" />
                      {t.sections.achievements}:
                    </p>
                    <ul className="space-y-1">
                      {job.achievements.map((a, j) => (
                        <li key={j} className="text-muted-foreground text-sm flex gap-2">
                          <span className="text-gold mt-0.5 shrink-0">&#10003;</span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  <span className="text-primary font-medium">{t.sections.stack}:</span> {job.stack}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* EDUCATION */}
        <Section id="education">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-8 flex items-center gap-3">
            <GraduationCap className="w-7 h-7 text-primary" />
            {t.sections.education}
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
                    <span className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Calendar className="w-3.5 h-3.5" />
                      {edu.period}
                    </span>
                    {'note' in edu && edu.note && (
                      <span className="badge px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 text-xs">
                        {edu.note}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* PROJECTS */}
        <Section id="projects">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-8 flex items-center gap-3">
            <FolderOpen className="w-7 h-7 text-primary" />
            {t.sections.projects}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {t.projects.map((proj, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-display font-semibold text-foreground">{proj.name}</h3>
                  {'url' in proj && proj.url && (
                    <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-primary text-sm font-medium mb-1">{proj.description}</p>
                <p className="text-muted-foreground text-sm mb-3 flex-1">{proj.details}</p>
                <div className="flex flex-wrap gap-1.5">
                  {proj.tags.map((tag) => (
                    <span key={tag} className="badge px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* SKILLS */}
        <Section id="skills">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-8 flex items-center gap-3">
            <Code2 className="w-7 h-7 text-primary" />
            {t.sections.skills}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(t.skills).map((cat) => (
              <div key={cat.title} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors">
                <h3 className="font-display font-semibold text-foreground mb-3">{cat.title}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map((skill: string) => (
                    <span key={skill} className="badge px-2.5 py-1 bg-muted text-muted-foreground text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* CONTACT */}
        <Section id="contact">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-8 flex items-center gap-3">
            <Mail className="w-7 h-7 text-primary" />
            {t.contact.title}
          </h2>
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <a
                href={`mailto:${t.contact.email}`}
                className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-primary/10 transition-colors group"
              >
                <Mail className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground font-medium text-sm">{t.contact.email}</p>
                </div>
              </a>
              <a
                href={`https://github.com/${t.contact.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-primary/10 transition-colors group"
              >
                <Github className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-sm text-muted-foreground">GitHub</p>
                  <p className="text-foreground font-medium text-sm">{t.contact.github}</p>
                </div>
              </a>
              <a
                href="https://t.me/fighter90"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-primary/10 transition-colors group"
              >
                <Send className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-sm text-muted-foreground">Telegram</p>
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
    </main>
  )
}
