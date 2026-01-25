import 'locomotive-scroll/dist/locomotive-scroll.css'

import { motion } from 'framer-motion'
import {
  ArrowUp,
  ArrowUpRight,
  Award,
  BadgeCheck,
  BookOpen,
  Cpu,
  Download,
  ExternalLink,
  Github,
  GraduationCap,
  Languages,
  Linkedin,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Sparkles,
} from 'lucide-react'
import LocomotiveScroll from 'locomotive-scroll'
import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useInView } from 'react-intersection-observer'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

type NavId =
  | 'hero'
  | 'about'
  | 'expertise'
  | 'experience'
  | 'projects'
  | 'education'
  | 'achievements'
  | 'languages'
  | 'contact'

const cn = (...inputs: Array<string | false | null | undefined>) => twMerge(clsx(inputs))

function useTypewriter(text: string, opts?: { speedMs?: number; pauseMs?: number }) {
  const speedMs = opts?.speedMs ?? 46
  const pauseMs = opts?.pauseMs ?? 900

  const [out, setOut] = useState('')
  const [dir, setDir] = useState<'fwd' | 'bwd'>('fwd')

  useEffect(() => {
    let t: number | undefined
    if (dir === 'fwd' && out.length === text.length) {
      t = window.setTimeout(() => setDir('bwd'), pauseMs)
    } else if (dir === 'bwd' && out.length === 0) {
      t = window.setTimeout(() => setDir('fwd'), 280)
    } else {
      t = window.setTimeout(() => {
        setOut((s) => (dir === 'fwd' ? text.slice(0, s.length + 1) : text.slice(0, s.length - 1)))
      }, dir === 'fwd' ? speedMs : Math.max(18, speedMs - 16))
    }
    return () => {
      if (t) window.clearTimeout(t)
    }
  }, [dir, out, pauseMs, speedMs, text])

  return out
}

function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode
  delay?: number
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.14 })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22, scale: 0.985 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

function ThreeParticles({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
    if (reduceMotion) return

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100)
    camera.position.z = 7.5

    const count = 1100
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const colorA = new THREE.Color('#7c3aed')
    const colorB = new THREE.Color('#22d3ee')

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const r = 5.8 * Math.cbrt(Math.random())
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = r * Math.cos(phi)

      const c = colorA.clone().lerp(colorB, Math.random())
      colors[i3] = c.r
      colors[i3 + 1] = c.g
      colors[i3 + 2] = c.b
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    const onResize = () => {
      const parent = canvas.parentElement
      const w = parent?.clientWidth ?? window.innerWidth
      const h = parent?.clientHeight ?? window.innerHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    onResize()
    window.addEventListener('resize', onResize)

    let raf = 0
    const clock = new THREE.Clock()
    const animate = () => {
      const t = clock.getElapsedTime()
      points.rotation.y = t * 0.07
      points.rotation.x = Math.sin(t * 0.12) * 0.08
      renderer.render(scene, camera)
      raf = window.requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 h-full w-full opacity-80', className)}
      aria-hidden="true"
    />
  )
}

function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur',
        className,
      )}
    >
      {children}
    </span>
  )
}

function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('glass rounded-2xl p-6', className)}>{children}</div>
}

function Section({
  id,
  title,
  icon,
  children,
}: {
  id: NavId
  title: string
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <section id={id} className="relative scroll-mt-28 py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-5">
        <Reveal>
          <div className="mb-10 flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/5 shadow-glass">
              {icon ?? <Sparkles className="size-5 text-cyan-200" />}
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
                {title}
              </h2>
              <div className="mt-2 h-px w-40 bg-gradient-to-r from-purple-500/60 via-blue-500/50 to-cyan-400/60" />
            </div>
          </div>
        </Reveal>
        {children}
      </div>
    </section>
  )
}

export default function App() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const locoRef = useRef<any>(null)

  const [active, setActive] = useState<NavId>('hero')
  const [showTop, setShowTop] = useState(false)

  const typing = useTypewriter('AI Engineer | LLM Specialist | Edge AI Developer', {
    speedMs: 44,
    pauseMs: 1200,
  })

  const nav: Array<{ id: NavId; label: string }> = useMemo(
    () => [
      { id: 'about', label: 'About' },
      { id: 'expertise', label: 'Expertise' },
      { id: 'experience', label: 'Experience' },
      { id: 'projects', label: 'Projects' },
      { id: 'education', label: 'Education' },
      { id: 'contact', label: 'Contact' },
    ],
    [],
  )

  const scrollTo = (id: NavId) => {
    const el = document.getElementById(id)
    if (!el) return
    if (locoRef.current?.scrollTo) {
      locoRef.current.scrollTo(el, { offset: -92, duration: 900 })
      return
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    document.documentElement.classList.add('dark')

    const el = scrollContainerRef.current
    if (!el) return

    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false

    // Locomotive can be fragile in StrictMode; main.tsx avoids StrictMode for this reason.
    if (!reduceMotion) {
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      const scroll = new (LocomotiveScroll as any)({
        el,
        smooth: true,
        lerp: 0.08,
        smartphone: { smooth: true },
        tablet: { smooth: true },
      })
      locoRef.current = scroll

      scroll.on?.('scroll', (args: any) => {
        setShowTop((args?.scroll?.y ?? 0) > 700)
      })

      const t = window.setTimeout(() => scroll.update?.(), 450)
      return () => {
        window.clearTimeout(t)
        scroll.destroy?.()
        locoRef.current = null
        document.body.style.overflow = prevOverflow || 'auto'
      }
    }

    document.body.style.overflow = 'auto'
    return
  }, [])

  // Active section tracking (IntersectionObserver)
  useEffect(() => {
    const ids: NavId[] = [
      'hero',
      'about',
      'expertise',
      'experience',
      'projects',
      'education',
      'achievements',
      'languages',
      'contact',
    ]

    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]
    if (!els.length) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0]
        const id = visible?.target?.id as NavId | undefined
        if (id) setActive(id)
      },
      { root: null, threshold: [0.15, 0.22, 0.32] },
    )

    els.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])

  const name = 'Gummadi Tejaswi'
  const nameLetters = useMemo(() => name.split(''), [name])

  return (
    <div
      ref={scrollContainerRef}
      data-scroll-container
      className="relative min-h-screen bg-ink-950 text-white"
    >
      {/* Global background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-ai-radial" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint [background-size:64px_64px] opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-black/30 to-transparent" />

      {/* Navbar */}
      <div className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-6xl px-5 pt-4">
          <div className="glass flex items-center justify-between gap-4 rounded-2xl px-4 py-3">
            <button
              onClick={() => scrollTo('hero')}
              className="group inline-flex items-center gap-2 rounded-xl px-2 py-2 text-left"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-purple-500/40 via-blue-500/30 to-cyan-400/30">
                <Cpu className="size-5 text-cyan-200" />
              </span>
              <span className="hidden sm:block">
                <span className="font-display text-sm font-semibold tracking-tight">
                  Tejaswi
                </span>
                <span className="block text-xs text-white/60">AI & Software Engineer</span>
              </span>
            </button>

            <nav className="hidden items-center gap-1 md:flex">
              {nav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={cn(
                    'rounded-xl px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white',
                    active === item.id && 'bg-white/7 text-white',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <a
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85 transition hover:border-white/20 hover:bg-white/10"
                href="#contact"
                onClick={(e) => {
                  e.preventDefault()
                  scrollTo('contact')
                }}
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section id="hero" className="relative pt-32 md:pt-36">
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 md:pb-24">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-glass">
            <div className="absolute inset-0">
              <ThreeParticles className="opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
              <div
                data-scroll
                data-scroll-speed="-1.25"
                className="absolute -left-24 -top-28 size-[420px] rounded-full bg-purple-500/25 blur-3xl"
              />
              <div
                data-scroll
                data-scroll-speed="-1.6"
                className="absolute -right-28 top-10 size-[460px] rounded-full bg-cyan-400/18 blur-3xl"
              />
            </div>

            <div className="relative px-6 py-14 md:px-12 md:py-20">
              <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl">
                  <Pill className="mb-5">
                    <Sparkles className="size-4 text-cyan-200" />
                    <span className="bg-gradient-to-r from-purple-300 via-blue-200 to-cyan-200 bg-clip-text text-transparent">
                      Architecting Intelligence at the Edge
                    </span>
                  </Pill>

                  <motion.h1
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: {},
                      show: { transition: { staggerChildren: 0.03 } },
                    }}
                    className="font-display text-4xl font-semibold tracking-tight text-white md:text-6xl"
                  >
                    {nameLetters.map((ch, i) => (
                      <motion.span
                        key={`${ch}-${i}`}
                        className={cn(ch === ' ' ? 'inline-block w-2' : 'inline-block')}
                        variants={{
                          hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
                          show: {
                            opacity: 1,
                            y: 0,
                            filter: 'blur(0px)',
                            transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                          },
                        }}
                      >
                        {ch}
                      </motion.span>
                    ))}
                  </motion.h1>

                  <div className="mt-5 flex items-center gap-3">
                    <div className="h-px w-10 bg-white/25" />
                    <p className="text-base text-white/80 md:text-lg">
                      <span className="font-medium">{typing}</span>
                      <span className="ml-1 inline-block w-[10px] animate-pulseGlow rounded-sm bg-white/70 align-middle">
                        &nbsp;
                      </span>
                    </p>
                  </div>

                  <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
                    Innovative AI Engineer specializing in production-grade Generative AI systems,
                    Large Language Model orchestration, and real-time edge inference. Expert in
                    building scalable RAG pipelines, multi-agent AI architectures, and low-latency
                    ML solutions that bridge cutting-edge research with practical deployment.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      onClick={() => scrollTo('projects')}
                      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(59,130,246,.25)] transition hover:brightness-110"
                    >
                      <span className="absolute inset-0 -translate-x-[120%] bg-white/20 blur-xl group-hover:animate-shimmer" />
                      View Projects <ArrowUpRight className="size-4" />
                    </button>
                    <a
                      href="/Tejaswi_Gummadi_CV.pdf"
                      download
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10"
                      title="Place your CV at portfolio/public/Tejaswi_Gummadi_CV.pdf"
                    >
                      Download CV <Download className="size-4" />
                    </a>
                    <button
                      onClick={() => scrollTo('contact')}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10"
                    >
                      Contact <MessageSquareText className="size-4" />
                    </button>
                  </div>

                  <div className="mt-10 flex flex-wrap items-center gap-3">
                    <a
                      className="glass group inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm text-white/80 transition hover:text-white"
                      href="https://www.linkedin.com/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Linkedin className="size-4 text-cyan-200" />
                      LinkedIn
                      <ExternalLink className="size-3 opacity-60 transition group-hover:opacity-100" />
                    </a>
                    <a
                      className="glass group inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm text-white/80 transition hover:text-white"
                      href="https://github.com/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Github className="size-4 text-purple-200" />
                      GitHub
                      <ExternalLink className="size-3 opacity-60 transition group-hover:opacity-100" />
                    </a>
                    <a
                      className="glass group inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm text-white/80 transition hover:text-white"
                      href="#projects"
                      onClick={(e) => {
                        e.preventDefault()
                        scrollTo('projects')
                      }}
                    >
                      <Sparkles className="size-4 text-blue-200" />
                      Portfolio
                      <ArrowUpRight className="size-3 opacity-60 transition group-hover:opacity-100" />
                    </a>
                  </div>
                </div>

                <div className="w-full max-w-md">
                  <div className="grid gap-4">
                    <Card className="relative overflow-hidden">
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/15 via-blue-500/10 to-cyan-400/15" />
                      <div className="relative">
                        <div className="flex flex-wrap gap-2">
                          <Pill>
                            <MapPin className="size-3.5 text-cyan-200" />
                            Bengaluru, Karnataka
                          </Pill>
                          <Pill>
                            <Phone className="size-3.5 text-purple-200" />
                            +91 9247899111
                          </Pill>
                          <Pill>
                            <Mail className="size-3.5 text-blue-200" />
                            gummaditejaswi1797@gmail.com
                          </Pill>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-white/75">
                          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                            <div className="text-xs text-white/55">Focus</div>
                            <div className="mt-1 font-semibold text-white">Generative AI</div>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                            <div className="text-xs text-white/55">Strength</div>
                            <div className="mt-1 font-semibold text-white">Low-latency</div>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                            <div className="text-xs text-white/55">Systems</div>
                            <div className="mt-1 font-semibold text-white">RAG + Agents</div>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                            <div className="text-xs text-white/55">Deployment</div>
                            <div className="mt-1 font-semibold text-white">Edge AI</div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="relative overflow-hidden">
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/8 to-transparent" />
                      <div className="relative">
                        <div className="mb-4 text-sm font-semibold text-white/90">
                          Signature skills
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            'RAG Pipelines',
                            'LLM Orchestration',
                            'Multi-agent Systems',
                            'Edge Inference',
                            'Prompt Engineering',
                            'Model Optimization',
                          ].map((s) => (
                            <span
                              key={s}
                              className="animate-floaty rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
                              style={{ animationDelay: `${Math.random() * 1.5}s` }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <Section id="about" title="About Me" icon={<Sparkles className="size-5 text-purple-200" />}>
        <Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <div className="flex flex-col gap-4">
                <p className="font-display text-xl font-semibold text-white">
                  “Architecting Intelligence at the Edge”
                </p>
                <p className="text-sm leading-relaxed text-white/70 md:text-base">
                  Innovative AI Engineer specializing in production-grade Generative AI systems,
                  Large Language Model orchestration, and real-time edge inference. Expert in
                  building scalable RAG pipelines, multi-agent AI architectures, and low-latency ML
                  solutions that bridge cutting-edge research with practical deployment.
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Pill>
                    <MapPin className="size-3.5 text-cyan-200" /> Bengaluru, Karnataka
                  </Pill>
                  <Pill>
                    <Phone className="size-3.5 text-purple-200" /> +91 9247899111
                  </Pill>
                  <Pill>
                    <Mail className="size-3.5 text-blue-200" /> gummaditejaswi1797@gmail.com
                  </Pill>
                </div>
              </div>
            </Card>

            <Card>
              <div className="mb-4 text-sm font-semibold text-white/90">Skill signals</div>
              <div className="space-y-4">
                {[
                  { label: 'Generative AI / LLMs', value: 92, c: 'from-purple-500 to-blue-500' },
                  { label: 'RAG + Agents', value: 90, c: 'from-blue-500 to-cyan-400' },
                  { label: 'Edge AI Optimization', value: 86, c: 'from-purple-500 to-cyan-400' },
                  { label: 'Production Engineering', value: 84, c: 'from-slate-400 to-slate-200' },
                ].map((s, i) => (
                  <div key={s.label}>
                    <div className="mb-1 flex items-center justify-between text-xs text-white/65">
                      <span>{s.label}</span>
                      <span>{s.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/8">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.value}%` }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.9, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
                        className={cn('h-2 rounded-full bg-gradient-to-r', s.c)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Reveal>
      </Section>

      {/* EXPERTISE */}
      <Section
        id="expertise"
        title="Technical Expertise"
        icon={<Cpu className="size-5 text-cyan-200" />}
      >
        <Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: 'AI/ML Stack',
                items: [
                  {
                    k: 'LLMs & Generative AI',
                    v: 'Production deployment of transformer-based models, prompt engineering, context window optimization',
                  },
                  {
                    k: 'RAG Architecture',
                    v: 'Vector database integration, semantic search, retrieval-augmented generation pipelines using LangChain',
                  },
                  {
                    k: 'Edge AI',
                    v: 'TensorFlow Lite quantization, on-device inference optimization, real-time computer vision',
                  },
                  {
                    k: 'Deep Learning',
                    v: 'CNN architectures, transfer learning, model compression, neural network optimization',
                  },
                ],
              },
              {
                title: 'Frameworks & Tools',
                items: [
                  { k: 'Inference Engines', v: 'Groq (ultra-low latency), Hugging Face Transformers' },
                  { k: 'ML Frameworks', v: 'TensorFlow, PyTorch, Scikit-learn' },
                  { k: 'Orchestration', v: 'LangChain (agent workflows), Crew AI (multi-agent systems)' },
                  { k: 'Data Processing', v: 'Pandas, NumPy, Matplotlib for pipeline analytics' },
                ],
              },
              {
                title: 'Development',
                items: [
                  { k: 'Languages', v: 'Python (primary), Java, C' },
                  { k: 'Backend', v: 'FastAPI (async APIs), Flask, RESTful architecture' },
                  { k: 'Frontend', v: 'HTML5, CSS3, JavaScript (ES6+)' },
                  { k: 'Database', v: 'MongoDB (NoSQL document storage)' },
                  { k: 'DevOps', v: 'Git, Linux, Docker containerization' },
                ],
              },
              {
                title: 'Specialized Tools',
                items: [
                  { k: 'Hardware', v: 'Arduino microcontrollers, Raspberry Pi edge computing' },
                  { k: 'Design', v: 'Figma (UI/UX prototyping), Canva' },
                  { k: 'Cloud Platforms', v: 'AWS Foundation certified, Azure Administration' },
                ],
              },
            ].map((block) => (
              <div key={block.title} className="group">
                <Card className="transition duration-300 group-hover:-translate-y-1 group-hover:border-white/15">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="font-display text-lg font-semibold text-white">{block.title}</div>
                    <div className="h-px w-16 bg-gradient-to-r from-purple-500/60 to-cyan-400/60 opacity-80" />
                  </div>
                  <div className="space-y-3">
                    {block.items.map((it) => (
                      <div key={it.k} className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <div className="text-sm font-semibold text-white/90">{it.k}</div>
                        <div className="mt-1 text-sm leading-relaxed text-white/65">{it.v}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* EXPERIENCE */}
      <Section
        id="experience"
        title="Professional Experience"
        icon={<BookOpen className="size-5 text-blue-200" />}
      >
        <Reveal>
          <div className="relative">
            <div className="absolute left-5 top-1 bottom-1 w-px bg-gradient-to-b from-purple-500/50 via-blue-500/40 to-cyan-400/40 md:left-7" />
            <div className="space-y-6">
              {[
                {
                  role: 'AI/ML Intern',
                  org: 'Boltzmann Labs, Bengaluru',
                  dur: '4 months',
                  desc: 'Spearheaded development of RAG-enhanced HR automation systems utilizing LangChain for intelligent document retrieval and multi-agent orchestration. Implemented sentiment analysis pipelines and optimized LLM response latency through Groq inference acceleration, achieving 10x faster query resolution.',
                },
                {
                  role: 'Edge AI Intern',
                  org: 'Intel',
                  dur: '3 months',
                  desc: 'Engineered production-ready AI models for edge deployment, focusing on neural network quantization and inference optimization. Delivered real-time intelligent applications with sub-100ms latency through TensorFlow Lite conversion and hardware-accelerated inference on resource-constrained devices.',
                },
                {
                  role: 'Generative AI Research Intern',
                  org: 'Bayes Labs',
                  dur: '2 months',
                  desc: 'Architected advanced LLM chatbot systems with retrieval-augmented generation, implementing semantic chunking strategies and vector embeddings for improved context retention. Fine-tuned transformer models for domain-specific applications, enhancing multi-turn conversation coherence by 40%.',
                },
                {
                  role: 'Full Stack Web Development Intern',
                  org: 'Compsoft Technologies',
                  dur: '—',
                  desc: 'Built full-stack web features with a focus on clean APIs, responsive UI, and reliable deployment workflows.',
                },
                {
                  role: 'Robotics Product Design Intern',
                  org: 'Comedkares',
                  dur: '—',
                  desc: 'Prototyped robotics systems and iterated on product design constraints for real-world reliability.',
                },
                {
                  role: 'UI/UX Design Intern',
                  org: '(Company name to be added)',
                  dur: '—',
                  desc: 'Designed user-centered interfaces with clear visual hierarchy, accessibility, and modern interaction patterns.',
                },
              ].map((e, idx) => (
                <motion.div
                  key={`${e.role}-${idx}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, delay: idx * 0.03, ease: [0.16, 1, 0.3, 1] }}
                  className="relative pl-14 md:pl-20"
                >
                  <div className="absolute left-[10px] top-5 size-3 rounded-full bg-cyan-300 shadow-[0_0_0_6px_rgba(34,211,238,.12)] md:left-[14px]" />
                  <Card className="group transition duration-300 hover:-translate-y-1 hover:border-white/15">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <div>
                        <div className="font-display text-lg font-semibold text-white">{e.role}</div>
                        <div className="mt-1 text-sm text-white/65">{e.org}</div>
                      </div>
                      <Pill className="text-white/70">{e.dur}</Pill>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-white/70 md:text-base">
                      {e.desc}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>
      </Section>

      {/* PROJECTS */}
      <Section
        id="projects"
        title="Featured Projects"
        icon={<Sparkles className="size-5 text-cyan-200" />}
      >
        <Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Personal AI Voice Assistant',
                front:
                  "24/7 conversational AI clone leveraging Groq's lightning-fast inference, integrated RAG for personalized retrieval, and real-time STT/TTS.",
                back: [
                  'Sub-second responses with Groq acceleration',
                  'RAG for private/personalized knowledge',
                  'Deployed with autoscaling on Hugging Face Spaces',
                ],
                tech: ['Groq API', 'RAG', 'STT/TTS', 'Hugging Face Spaces', 'FastAPI'],
              },
              {
                title: 'Smart Vehicle Enhancement with Edge AI',
                front:
                  'Real-time automated parking using YOLOv8 vehicle detection + EasyOCR for license plate extraction, optimized for Raspberry Pi.',
                back: [
                  '30 FPS inference on Raspberry Pi 4 (TFLite)',
                  '95% accuracy with optimized CV pipeline',
                  'Edge-first design for low latency + efficiency',
                ],
                tech: ['YOLOv8', 'EasyOCR', 'TensorFlow Lite', 'OpenCV', 'Edge Computing'],
              },
              {
                title: 'AI Chatbot using LLMs + RAG',
                front:
                  'Domain-specific intelligent assistant powered by semantic search and retrieval-augmented generation with streaming responses.',
                back: [
                  'FAISS vector search + semantic chunking',
                  'LangChain orchestration for tools/agents',
                  'Context-aware multi-turn chat with streaming',
                ],
                tech: ['LangChain', 'Hugging Face', 'Vector DB', 'RAG Pipeline', 'FAISS'],
              },
            ].map((p) => (
              <div key={p.title} className="group [perspective:1200px]">
                <div className="relative h-full min-h-[320px] transition duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden">
                    <Card className="relative h-full overflow-hidden">
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/18 via-blue-500/10 to-cyan-400/16" />
                      <div className="relative flex h-full flex-col">
                        <div className="font-display text-lg font-semibold text-white">{p.title}</div>
                        <p className="mt-3 text-sm leading-relaxed text-white/70">{p.front}</p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {p.tech.slice(0, 3).map((t) => (
                            <Pill key={t}>{t}</Pill>
                          ))}
                          <Pill className="border-white/15 bg-white/7 text-white/70">
                            +{Math.max(0, p.tech.length - 3)}
                          </Pill>
                        </div>
                        <div className="mt-auto pt-6 text-xs text-white/55">
                          Hover to flip • Tap on mobile
                        </div>
                      </div>
                    </Card>
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden [transform:rotateY(180deg)]">
                    <Card className="relative h-full overflow-hidden">
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-400/16 via-blue-500/10 to-purple-500/16" />
                      <div className="relative flex h-full flex-col">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-display text-lg font-semibold text-white">
                            Highlights
                          </div>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                            {p.tech.length} tech
                          </span>
                        </div>
                        <ul className="mt-4 space-y-2 text-sm text-white/75">
                          {p.back.map((b) => (
                            <li key={b} className="flex gap-2">
                              <span className="mt-1 size-1.5 rounded-full bg-cyan-300/80" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-6 flex flex-wrap gap-2">
                          {p.tech.map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="mt-auto pt-6 text-xs text-white/55">
                          Add live/demo links when available
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Card>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-display text-lg font-semibold text-white">
                    Additional Projects
                  </div>
                  <div className="mt-1 text-sm text-white/65">
                    More builds that showcase AI + embedded + robotics depth.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Interactive Institutional Kiosk (Published Research)',
                    'Autonomous Maze-Solving Robot',
                    'Computer Vision-based Road Lane Tracking System',
                  ].map((x) => (
                    <Pill key={x}>{x}</Pill>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </Reveal>
      </Section>

      {/* EDUCATION */}
      <Section
        id="education"
        title="Education"
        icon={<GraduationCap className="size-5 text-purple-200" />}
      >
        <Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                a: 'B.Tech in Electronics & Communication Engineering',
                b: 'Atria Institute of Technology, Bengaluru',
                c: '2021–2025',
                d: 'CGPA: 8.82',
              },
              {
                a: 'HSC (12th Grade)',
                b: 'Sri Chaitanya Jr College (BIEAP)',
                c: '2019–2021',
                d: '92.2%',
              },
              {
                a: 'SSC (10th Grade)',
                b: 'Ravindra Bharathi Public School',
                c: '2018–2019',
                d: 'CGPA: 9.8',
              },
            ].map((e) => (
              <Card key={e.a} className="group transition hover:-translate-y-1 hover:border-white/15">
                <div className="font-display text-lg font-semibold text-white">{e.a}</div>
                <div className="mt-2 text-sm text-white/65">{e.b}</div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <Pill>{e.c}</Pill>
                  <Pill className="border-white/15 bg-white/7">{e.d}</Pill>
                </div>
              </Card>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* ACHIEVEMENTS */}
      <Section
        id="achievements"
        title="Achievements & Certifications"
        icon={<Award className="size-5 text-cyan-200" />}
      >
        <Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Google Agentic AI Certification (Kaggle)',
                icon: <BadgeCheck className="size-5 text-cyan-200" />,
                link: 'https://www.kaggle.com/learn',
              },
              {
                title: '1st Prize — Robo Olympics (Line Follower Bot)',
                icon: <Award className="size-5 text-purple-200" />,
                link: '',
              },
              {
                title: 'Published Research — Interactive Institutional Kiosks',
                icon: <BookOpen className="size-5 text-blue-200" />,
                link: '',
              },
              {
                title: 'AWS Foundation Certification',
                icon: <BadgeCheck className="size-5 text-orange-200" />,
                link: 'https://www.credly.com/',
              },
              {
                title: 'Azure Administration Certification',
                icon: <BadgeCheck className="size-5 text-sky-200" />,
                link: 'https://learn.microsoft.com/',
              },
              {
                title: 'Google Ads Performance Certification',
                icon: <BadgeCheck className="size-5 text-emerald-200" />,
                link: 'https://skillshop.exceedlms.com/student/catalog',
              },
            ].map((b) => (
              <Card key={b.title} className="group relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/8 to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="relative flex items-start gap-3">
                  <div className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/5">
                    {b.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white/90">{b.title}</div>
                    {b.link ? (
                      <a
                        href={b.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-2 text-xs text-white/60 transition hover:text-white"
                      >
                        Verification / Reference <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      <div className="mt-3 text-xs text-white/45">Link available on request</div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* LANGUAGES */}
      <Section
        id="languages"
        title="Languages"
        icon={<Languages className="size-5 text-blue-200" />}
      >
        <Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <div className="mb-4 text-sm font-semibold text-white/90">Proficiency</div>
              <div className="space-y-4">
                {[
                  { label: 'English', value: 90, c: 'from-cyan-400 to-blue-500' },
                  { label: 'Telugu', value: 95, c: 'from-purple-500 to-blue-500' },
                  { label: 'Hindi', value: 82, c: 'from-blue-500 to-cyan-400' },
                  { label: 'Kannada', value: 68, c: 'from-slate-400 to-slate-200' },
                ].map((l, i) => (
                  <div key={l.label}>
                    <div className="mb-1 flex items-center justify-between text-xs text-white/65">
                      <span>{l.label}</span>
                      <span>{l.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/8">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${l.value}%` }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 0.85, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
                        className={cn('h-2 rounded-full bg-gradient-to-r', l.c)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-500/14 via-blue-500/10 to-cyan-400/14" />
              <div className="relative">
                <div className="font-display text-lg font-semibold text-white">
                  Communication-first mindset
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
                  I collaborate across product, engineering, and research—translating complex AI
                  systems into clear, actionable implementation plans and measurable outcomes.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {['Docs', 'Design Reviews', 'Demo-driven delivery', 'Clear APIs'].map((x) => (
                    <Pill key={x}>{x}</Pill>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </Reveal>
      </Section>

      {/* CONTACT */}
      <Section id="contact" title="Contact" icon={<Mail className="size-5 text-cyan-200" />}>
        <Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-400/14 via-blue-500/10 to-purple-500/14" />
              <div className="relative">
                <div className="font-display text-xl font-semibold text-white">Let’s build.</div>
                <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
                  For internships, full-time roles, freelance builds, or research collaborations—send a
                  message and I’ll reply quickly.
                </p>
                <div className="mt-6 grid gap-3">
                  <a
                    className="glass group flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-white/80 transition hover:text-white"
                    href="mailto:gummaditejaswi1797@gmail.com"
                  >
                    <span className="flex items-center gap-2">
                      <Mail className="size-4 text-cyan-200" />
                      gummaditejaswi1797@gmail.com
                    </span>
                    <ArrowUpRight className="size-4 opacity-60 transition group-hover:opacity-100" />
                  </a>
                  <a
                    className="glass group flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-white/80 transition hover:text-white"
                    href="tel:+919247899111"
                  >
                    <span className="flex items-center gap-2">
                      <Phone className="size-4 text-purple-200" />
                      +91 9247899111
                    </span>
                    <ArrowUpRight className="size-4 opacity-60 transition group-hover:opacity-100" />
                  </a>
                  <a
                    className="glass group flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-white/80 transition hover:text-white"
                    href="https://www.linkedin.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="flex items-center gap-2">
                      <Linkedin className="size-4 text-blue-200" />
                      LinkedIn
                    </span>
                    <ExternalLink className="size-4 opacity-60 transition group-hover:opacity-100" />
                  </a>
                  <a
                    className="glass group flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-white/80 transition hover:text-white"
                    href="https://github.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="flex items-center gap-2">
                      <Github className="size-4 text-cyan-200" />
                      GitHub
                    </span>
                    <ExternalLink className="size-4 opacity-60 transition group-hover:opacity-100" />
                  </a>
                </div>
              </div>
            </Card>

            <ContactForm />
          </div>
        </Reveal>
      </Section>

      {/* Footer */}
      <footer className="pb-14 pt-2">
        <div className="mx-auto max-w-6xl px-5">
          <div className="glass flex flex-col gap-4 rounded-2xl px-6 py-6 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-white/70">
              <span className="font-semibold text-white/90">Gummadi Tejaswi</span> • AI & Software
              Engineer
              <span className="mx-2 text-white/35">|</span>
              Built with React + Vite, Framer Motion, Three.js, locomotive-scroll, TailwindCSS
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Back to top', onClick: () => scrollTo('hero') },
                { label: 'Projects', onClick: () => scrollTo('projects') },
                { label: 'Contact', onClick: () => scrollTo('contact') },
              ].map((x) => (
                <button
                  key={x.label}
                  onClick={x.onClick}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  {x.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Back to top */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={showTop ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.35 }}
        onClick={() => scrollTo('hero')}
        className="fixed bottom-6 right-6 z-50 rounded-2xl border border-white/12 bg-white/8 p-3 text-white/85 shadow-glass backdrop-blur transition hover:bg-white/12"
        aria-label="Back to top"
      >
        <ArrowUp className="size-5" />
      </motion.button>
    </div>
  )
}

function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (status !== 'idle') return
    setStatus('sending')

    // Frontend-only: show success micro-animation + open mailto with prefill.
    const subject = encodeURIComponent(`Portfolio Contact — ${form.name || 'Hello'}`)
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}\n`,
    )

    window.setTimeout(() => {
      setStatus('sent')
      window.open(`mailto:gummaditejaswi1797@gmail.com?subject=${subject}&body=${body}`, '_self')
      window.setTimeout(() => setStatus('idle'), 1300)
    }, 650)
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/8 to-transparent" />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="font-display text-lg font-semibold text-white">Send a message</div>
          <Pill className="text-white/65">Fast reply</Pill>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <div className="mb-1 text-xs text-white/55">Name</div>
              <input
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/90 outline-none transition placeholder:text-white/30 focus:border-white/20"
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
            <label className="block">
              <div className="mb-1 text-xs text-white/55">Email</div>
              <input
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/90 outline-none transition placeholder:text-white/30 focus:border-white/20"
                placeholder="you@email.com"
                autoComplete="email"
                type="email"
              />
            </label>
          </div>
          <label className="block">
            <div className="mb-1 text-xs text-white/55">Message</div>
            <textarea
              value={form.message}
              onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
              className="min-h-[140px] w-full resize-none rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/90 outline-none transition placeholder:text-white/30 focus:border-white/20"
              placeholder="Tell me what you're building…"
            />
          </label>

          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-white/45">
              Submits via your email client (mailto) — no backend required.
            </div>
            <button
              type="submit"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
              disabled={status !== 'idle'}
            >
              <span className="absolute inset-0 -translate-x-[120%] bg-white/20 blur-xl group-hover:animate-shimmer" />
              {status === 'idle' && 'Send'}
              {status === 'sending' && 'Sending…'}
              {status === 'sent' && 'Sent'}
              <ArrowUpRight className="size-4" />
            </button>
          </div>
        </form>
      </div>
    </Card>
  )
}
