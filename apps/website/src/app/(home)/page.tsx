'use client';
import Link from 'next/link';

import { Clipboard } from '@/components/clipboard';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Brain, Code2, MessageSquare, Palette, Settings, User, Zap } from 'lucide-react';
import Image from 'next/image';
import { usePostHog } from 'posthog-js/react';
import { useEffect, useState } from 'react';
import AdobeLogo from './_components/company_logos/adobe.png';
import AirBnBLogo from './_components/company_logos/airbnb.png';
import AmazonLogo from './_components/company_logos/amazon.png';
import MicrosoftLogo from './_components/company_logos/microsoft.png';
import OracleLogo from './_components/company_logos/oracle.png';
import SamsungLogo from './_components/company_logos/samsung.png';
import ZendeskLogo from './_components/company_logos/zendesk.png';
import AngularLogo from './_components/plugin_logos/angular.svg';
import ReactLogo from './_components/plugin_logos/react.svg';
import VueLogo from './_components/plugin_logos/vue.svg';

import AngularFrameworkLogo from './_components/framework_logos/angular.png';
import NextFrameworkLogo from './_components/framework_logos/next.png';
import NuxtFrameworkLogo from './_components/framework_logos/nuxt.png';
import ReactFrameworkLogo from './_components/framework_logos/react.png';
import SvelteFrameworkLogo from './_components/framework_logos/svelte.png';
import VueFrameworkLogo from './_components/framework_logos/vue.png';
import CursorLogo from './_components/ide_logos/cursor.png';
import GitHubCopilotLogo from './_components/ide_logos/github_copilot.png';
import TraeLogo from './_components/ide_logos/trae.png';
import WindsurfLogo from './_components/ide_logos/windsurf.png';

// GradientStarIcon: Star with gradient fill using mask
function StarIcon({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block ${className}`}
      style={{
        width: '16px',
        height: '16px',
        background: 'var(--color-yellow-500)', // from-indigo-500 to-pink-500
        WebkitMaskImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z' fill='black'/></svg>\")",
        maskImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z' fill='black'/></svg>\")",
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    />
  );
}

export default function Home() {
  const posthog = usePostHog();
  const [starCount, setStarCount] = useState<number | null>(null);

  // Fetch GitHub star count
  useEffect(() => {
    const fetchStarCount = async () => {
      try {
        const response = await fetch(
          'https://api.github.com/repos/stagewise-io/stagewise',
        );
        if (response.ok) {
          const data = await response.json();
          setStarCount(data.stargazers_count);
        }
      } catch {
        // Fallback to a default value if API fails
        setStarCount(4300);
      }
    };

    fetchStarCount();
  }, []);

  // Format star count for display
  const formatStarCount = (count: number | null) => {
    if (count === null) return '3K+'; // Loading state
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K+`;
    }
    return count.toString();
  };

  const _ideOptions = [
    {
      id: 'cursor',
      name: 'Cursor',
      logo: CursorLogo,
      url: 'cursor:extension/stagewise.stagewise-vscode-extension',
    },
    {
      id: 'vscode',
      name: 'VS Code',
      logo: GitHubCopilotLogo, // Using this as placeholder for VS Code logo
      url: 'vscode:extension/stagewise.stagewise-vscode-extension',
    },
    {
      id: 'trae',
      name: 'Trae',
      logo: TraeLogo,
      url: 'trae:extension/stagewise.stagewise-vscode-extension',
    },
    {
      id: 'windsurf',
      name: 'Windsurf',
      logo: WindsurfLogo,
      url: 'windsurf:extension/stagewise.stagewise-vscode-extension',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-black dark:text-white">
      {/* Hero Section */}
      <section className="container relative z-10 mx-auto px-4 pt-40 pb-12 sm:pt-28 md:pb-16">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="mb-12 px-4 text-center sm:px-0">
              {/* YC Banner */}
              <div className="mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="https://www.ycombinator.com/companies/stagewise"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-300 px-3 py-1.5 font-medium text-sm text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-orange-500/5 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-500"
                >
                  <span>
                    Backed by{' '}
                    <span className="ml-2 inline-flex size-4 items-center justify-center bg-[#f26622] align-text-bottom font-normal text-white text-xs">
                      Y
                    </span>
                    <span className="ml-1 font-normal text-[#f26622]">
                      Combinator
                    </span>
                  </span>
                </a>
                <a
                  href="https://github.com/stagewise-io/stagewise"
                  onClick={() => posthog?.capture('hero_github_star_click')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-300 px-3 py-1.5 font-medium text-sm text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-orange-500/5 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-500"
                >
                  <StarIcon className="size-4 text-yellow-500" />
                  GitHub
                  <div className="rounded-full bg-zinc-500/10 px-1.5 py-0.5 font-medium text-xs text-zinc-500">
                    {formatStarCount(starCount)}
                  </div>
                </a>
              </div>
              <h1 className="mb-6 font-bold text-3xl tracking-tight md:text-5xl">
                <span className="bg-gradient-to-tr from-zinc-900 via-zinc-700 to-black bg-clip-text text-transparent dark:from-zinc-100 dark:via-zinc-300 dark:to-white">
                  The frontend coding agent for
                  <br />
                  production codebases
                </span>
              </h1>
              <p className="mx-auto mb-8 max-w-3xl text-center text-lg text-zinc-600 dark:text-zinc-400">
                stagewise runs locally, lives inside your browser and let's you
                build app frontends simply by selecting elements and prompting
                changes.
              </p>

              <div className="py-4">
                <p className="mx-auto mb-2 font-medium text-sm text-zinc-600 dark:text-zinc-400">
                  To start the agent, simply run this command in the root of
                  your dev app:
                </p>
                <Clipboard
                  text="npx stagewise"
                  className="mx-auto mb-6 justify-center"
                />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="mx-auto mt-8 max-w-3xl scale-[1.02] transform overflow-hidden rounded-xl border border-zinc-900/50 shadow-[0_0_40px_rgba(0,0,0,0.25)] transition-transform duration-500 dark:border-zinc-100/50 dark:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              <video
                src="https://github.com/stagewise-io/assets/raw/1aeae6c24e0aedc959ae3fb730ea569c984e3a13/edited/0-5-0-custom-agent/github-projects-demo.mp4"
                width={1200}
                height={675}
                className="w-full"
                autoPlay
                muted
                loop
                preload="auto"
                playsInline
              />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="mt-32 mb-8 w-full">
              <p className="mx-auto mb-16 text-center text-base text-zinc-600 dark:text-zinc-400">
                embraced by engineers from leading companies
              </p>
              <div className="flex flex-row flex-wrap items-center justify-center gap-x-20 gap-y-12">
                <Image
                  src={AdobeLogo}
                  alt="Adobe"
                  className="w-20 opacity-60 dark:invert"
                />
                <Image
                  src={AirBnBLogo}
                  alt="AirBnB"
                  className="w-20 opacity-60 dark:invert"
                />
                <Image
                  src={AmazonLogo}
                  alt="Amazon"
                  className="w-24 opacity-60 dark:invert"
                />
                <Image
                  src={MicrosoftLogo}
                  alt="Microsoft"
                  className="w-24 opacity-60 dark:invert"
                />
                <Image
                  src={OracleLogo}
                  alt="Oracle"
                  className="w-24 opacity-60 dark:invert"
                />
                <Image
                  src={SamsungLogo}
                  alt="Samsung"
                  className="w-24 opacity-60 dark:invert"
                />
                <Image
                  src={ZendeskLogo}
                  alt="Zendesk"
                  className="w-16 opacity-60 dark:invert"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="container relative z-10 mx-auto border-zinc-200 border-t px-4 py-24 md:py-32 dark:border-zinc-800"
      >
        <ScrollReveal>
          <div className="mx-auto mb-16 max-w-4xl text-center">
            <h2 className="mb-6 font-bold text-3xl md:text-4xl">Features</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              The stagewise toolbar makes it incredibly easy to edit your
              frontend code with AI agents
            </p>
          </div>
        </ScrollReveal>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <Brain className="size-6 text-violet-600" />,
              title: 'AI-Powered Intelligence',
              description:
                'Leverages advanced AI to understand your codebase structure and provide intelligent suggestions',
              delay: 100,
              size: 'normal',
              iconBg: 'bg-violet-50 dark:bg-violet-950/20',
            },
            {
              icon: <Zap className="size-6 text-yellow-500" />,
              title: 'Lightning Fast',
              description:
                'Instant feedback and real-time updates that keep your development workflow smooth and efficient',
              delay: 200,
              size: 'normal',
              iconBg: 'bg-yellow-50 dark:bg-yellow-950/20',
            },
            {
              icon: <Code2 className="size-6 text-blue-600" />,
              title: 'Smart Code Generation',
              description:
                'Generates clean, maintainable code that follows your project conventions and best practices',
              delay: 300,
              size: 'normal',
              iconBg: 'bg-blue-50 dark:bg-blue-950/20',
            },
            {
              icon: <Palette className="size-6 text-pink-600" />,
              title: 'Design System Aware',
              description:
                'Automatically detects and applies your design tokens, themes, and styling patterns',
              delay: 400,
              size: 'normal',
              iconBg: 'bg-pink-50 dark:bg-pink-950/20',
            },
            {
              icon: <Settings className="size-6 text-green-600" />,
              title: 'Framework Agnostic',
              description:
                'Works seamlessly with React, Vue, Angular, Next.js, and any modern web framework',
              delay: 500,
              size: 'normal',
              iconBg: 'bg-green-50 dark:bg-green-950/20',
            },
            {
              icon: <MessageSquare className="size-6 text-orange-600" />,
              title: 'Visual Development',
              description:
                'Comment directly on live elements, see changes instantly, and iterate faster than ever',
              delay: 600,
              size: 'normal',
              iconBg: 'bg-orange-50 dark:bg-orange-950/20',
            },
          ].map((feature, _i) => (
            <ScrollReveal key={feature.title} delay={feature.delay}>
              <div
                className={`group -translate-y-1 h-full rounded-2xl border border-zinc-500/20 bg-white p-6 shadow-2xl shadow-[rgba(0,0,0,0.15)] transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900 ${feature.size === 'large' ? 'lg:col-span-2' : ''
                  }`}
              >
                <div
                  className={`mb-4 inline-flex rounded-lg p-3 transition-colors ${feature.iconBg}`}
                >
                  {feature.icon}
                </div>
                <h3 className="mb-2 font-semibold text-xl">{feature.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Framework Support Section */}
      <section className="container relative z-10 mx-auto border-zinc-200 border-t px-4 py-16 md:py-24 dark:border-zinc-800">
        <ScrollReveal>
          <div className="mx-auto mb-16 max-w-4xl text-center">
            <h2 className="mb-6 font-bold text-3xl md:text-4xl">
              Works With Your Stack
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              stagewise integrates seamlessly with popular frontend frameworks.
            </p>
          </div>
        </ScrollReveal>

        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-8">
          {[
            {
              name: 'React',
              logo: ReactFrameworkLogo,
              href: 'https://github.com/stagewise-io/stagewise/tree/main/examples/react-example',
            },
            {
              name: 'Vue',
              logo: VueFrameworkLogo,
              href: 'https://github.com/stagewise-io/stagewise/tree/main/examples/vue-example',
            },
            {
              name: 'Angular',
              logo: AngularFrameworkLogo,
              href: 'https://github.com/stagewise-io/stagewise/tree/main/examples/angular-example',
            },
            {
              name: 'Svelte',
              logo: SvelteFrameworkLogo,
              href: 'https://github.com/stagewise-io/stagewise/tree/main/examples/svelte-kit-example',
            },
            {
              name: 'Next.js',
              logo: NextFrameworkLogo,
              href: 'https://github.com/stagewise-io/stagewise/tree/main/examples/next-example',
            },
            {
              name: 'Nuxt',
              logo: NuxtFrameworkLogo,
              href: 'https://github.com/stagewise-io/stagewise/tree/main/examples/nuxt-example',
            },
          ].map((framework, i) => (
            <ScrollReveal key={framework.name} delay={i * 100} direction="up">
              <Link
                href={framework.href}
                className="group hover:-translate-y-0.5 flex cursor-pointer items-center gap-2 rounded-full border border-zinc-500/30 bg-white px-6 py-2 font-medium shadow-[0_0_20px_rgba(0,0,0,0.15)] transition-all duration-300 ease-out hover:bg-white hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 dark:hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  posthog?.capture('framework_link_click', {
                    framework: framework.name,
                  })
                }
              >
                <Image
                  src={framework.logo}
                  alt={framework.name}
                  className={`size-6 ${framework.name === 'Next.js' ? 'dark:invert' : ''}`}
                />
                <span>{framework.name}</span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
        <p className="mx-auto mt-12 w-full text-center text-sm text-zinc-500 dark:text-zinc-500">
          Click on a framework to see an example project.
        </p>
      </section>

      {/* Testimonials Section */}
      <section className="container relative z-10 mx-auto border-zinc-200 border-t px-4 py-24 md:py-32 dark:border-zinc-800">
        <ScrollReveal>
          <div className="mx-auto mb-16 max-w-4xl text-center">
            <h2 className="mb-6 font-bold text-3xl md:text-4xl">
              Loved by Developers Worldwide
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Don't just take our word for it. Here's what developers are saying
              about their experience.
            </p>
          </div>
        </ScrollReveal>

        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          {[
            {
              quote:
                'This Cursor Extension is awesome. Accurate tweaking of UI was always a struggle, but @stagewise_io allows you to bring full context to Cursor, just point and command.',
              name: 'Jason Zhou',
              role: 'Product engineer @ TaskMaster AI',
              avatar:
                'https://pbs.twimg.com/profile_images/1613651966663749632/AuQiWkVc_400x400.jpg',
            },
            {
              quote:
                'How did I even use Cursor before this?! Amazing extension.',
              name: 'Dennis Cutraro',
              role: 'Founder @ unfuture',
              avatar: null,
            },
            {
              quote:
                "This is an amazing extension. The setup is quite simple, and it impresses from the very beginning. I was surprised how well it worked right away, even in a poorly designed brownfield project. This is only the beginning, I'm excited to see how it develops.",
              name: 'Egor Koldasov',
              role: '',
              avatar: null,
            },
            {
              quote:
                'Just tried Stagewise plugin for Cursor - point and tell what to change. Way easier than describing UI elements in prompts.',
              name: 'Renat Abbiazov',
              role: '',
              avatar:
                'https://pbs.twimg.com/profile_images/1641815076477837313/1IfZhFZM_400x400.jpg',
            },
            {
              quote:
                "Our team's productivity has skyrocketed since we adopted Stagewise. Collaboration between designers and developers has never been smoother.",
              name: 'David Garcia',
              role: 'Engineering Manager @ FutureWorks',
              avatar: null,
            },
            {
              quote:
                "stagewise in cursor is different gravy. UI changes for code you didn't write has never been easier",
              name: 'Kareem',
              role: '',
              avatar:
                'https://pbs.twimg.com/profile_images/1923032215954305024/6Y7NyOBy_400x400.jpg',
            },
            {
              quote:
                'stagewise is what a good interface for AI should look like',
              name: 'chocologist',
              role: '',
              avatar:
                'https://pbs.twimg.com/profile_images/1866724361857798154/Ujx2G3m0_400x400.jpg',
            },
            {
              quote:
                "🚨 VIBE CODERS: If you are using @cursor and working on a frontend, install stagewise immediately. Go in to debt if you have to. ps - it's free :)",
              name: 'John Schoenith',
              role: '',
              avatar:
                'https://pbs.twimg.com/profile_images/1905304449016627200/2GQ72XW5_400x400.jpg',
            },
            {
              quote:
                'A must-have tool for any modern development workflow. It simplifies complex tasks and makes coding enjoyable again.',
              name: 'Kevin Harris',
              role: 'Staff Engineer @ DevHouse',
              avatar: null,
            },
          ].map((testimonial, i) => (
            <ScrollReveal key={testimonial.name} delay={i * 100}>
              <div className="flex h-full flex-col justify-between rounded-2xl border border-zinc-500/20 bg-white p-6 shadow-[rgba(0,0,0,0.1)] shadow-lg transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    "{testimonial.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {testimonial.avatar ? (
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full border border-zinc-200 dark:border-zinc-800"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/20">
                      <User className="h-6 w-6" />{' '}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-zinc-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Plugin Section */}
      <section className="container relative z-10 mx-auto border-zinc-200 border-t px-4 py-16 md:py-24 dark:border-zinc-800">
        <ScrollReveal>
          <div className="mx-auto mb-16 max-w-4xl text-center">
            <h2 className="mb-6 font-bold text-3xl md:text-4xl">
              Upgrade Your Workflow With Plugins
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              stagewise can be easily extended to fit your needs with existing
              plugins - or you simply build your own.
            </p>
          </div>
        </ScrollReveal>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {[
            {
              icon: <Image src={ReactLogo} alt="React" className="size-8" />,
              title: 'React',
              description: 'Improve prompts with context on your React app.',
              delay: 100,
            },
            {
              icon: <Image src={VueLogo} alt="Vue" className="size-8" />,
              title: 'Vue',
              description:
                'Get more accurate prompts with info on selected Vue components.',
              delay: 200,
            },
            {
              icon: (
                <Image src={AngularLogo} alt="Angular" className="size-8" />
              ),
              title: 'Angular',
              description: 'First-class support for Angular apps.',
              delay: 300,
            },
            {
              icon: <Image src={NextFrameworkLogo} alt="Next.js" className="size-8 dark:invert" />,
              title: 'Next.js',
              description: 'Enhanced development experience for Next.js applications.',
              delay: 400,
            },
            {
              icon: <Image src={NuxtFrameworkLogo} alt="Nuxt" className="size-8" />,
              title: 'Nuxt',
              description: 'Streamlined workflow for Nuxt.js projects.',
              delay: 500,
            },
            {
              icon: <Image src={SvelteFrameworkLogo} alt="Svelte" className="size-8" />,
              title: 'Svelte',
              description: 'Optimized prompts for Svelte and SvelteKit apps.',
              delay: 600,
            },
          ].map((feature, _i) => (
            <ScrollReveal key={feature.title} delay={feature.delay}>
              <div className="group -translate-y-1 h-full rounded-2xl border border-zinc-500/20 bg-white p-6 shadow-2xl shadow-[rgba(0,0,0,0.15)] transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 inline-flex rounded-lg bg-zinc-50 p-3 transition-colors dark:bg-zinc-900/10">
                  {feature.icon}
                </div>
                <h3 className="mb-2 font-semibold text-xl">{feature.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  );
}
