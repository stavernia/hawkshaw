"use client";

import Image from "next/image";
import Link from "next/link";
import { Uncial_Antiqua } from "next/font/google";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { SITE_ROUTES } from "@/src/config/routes";
import { cn } from "@/src/lib/utils";

const uncialAntiqua = Uncial_Antiqua({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

type FragmentCard = {
  label: string;
  title: string;
  detail: string;
  x: number;
  y: number;
  rotation: string;
  mobileOffset: string;
  widthClass: string;
};

const teaserFragments: FragmentCard[] = [
  {
    label: "Secret",
    title: "Every guest has a secret.",
    detail: "Private truths surface only when the room starts talking.",
    x: 24,
    y: 20,
    rotation: "-rotate-4",
    mobileOffset: "self-start",
    widthClass: "md:w-[10.75rem]",
  },
  {
    label: "Notice",
    title: "Some doors answer questions.",
    detail: "Others create new ones.",
    x: 14,
    y: 31,
    rotation: "rotate-2",
    mobileOffset: "self-start",
    widthClass: "md:w-[10.5rem]",
  },
  {
    label: "Whisper",
    title: "Trade whispers for evidence.",
    detail: "Alliances are useful until they become liabilities.",
    x: 24,
    y: 48,
    rotation: "rotate-2",
    mobileOffset: "self-start",
    widthClass: "md:w-[10.75rem]",
  },
  {
    label: "Trace",
    title: "Every movement leaves a trace.",
    detail: "Someone always remembers who was seen where.",
    x: 14,
    y: 68,
    rotation: "-rotate-3",
    mobileOffset: "self-start",
    widthClass: "md:w-[10.75rem]",
  },
  {
    label: "Sighting",
    title: "Choose where you go carefully.",
    detail: "Each room changes what you find and who notices you.",
    x: 76,
    y: 21,
    rotation: "rotate-3",
    mobileOffset: "self-end",
    widthClass: "md:w-[10.75rem]",
  },
  {
    label: "Warning",
    title: "Not every ally is safe.",
    detail: "Every favor has a cost.",
    x: 86,
    y: 32,
    rotation: "-rotate-2",
    mobileOffset: "self-end",
    widthClass: "md:w-[10.5rem]",
  },
  {
    label: "Evidence",
    title: "Accuse before the truth disappears.",
    detail: "One reveal can rearrange the whole night.",
    x: 77,
    y: 48,
    rotation: "-rotate-2",
    mobileOffset: "self-end",
    widthClass: "md:w-[11rem]",
  },
  {
    label: "Choice",
    title: "Not every truth should be revealed.",
    detail: "The hardest choice may be what to do with what you know.",
    x: 87,
    y: 67,
    rotation: "rotate-3",
    mobileOffset: "self-end",
    widthClass: "md:w-[10.75rem]",
  },
];

function useFlashlightState() {
  const [desktopFlashlight, setDesktopFlashlight] = useState(false);
  const [flashlightEnabled, setFlashlightEnabled] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 48 });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      setDesktopFlashlight(hoverQuery.matches && !motionQuery.matches);
    };

    sync();
    hoverQuery.addEventListener("change", sync);
    motionQuery.addEventListener("change", sync);

    return () => {
      hoverQuery.removeEventListener("change", sync);
      motionQuery.removeEventListener("change", sync);
    };
  }, []);

  return { desktopFlashlight, flashlightEnabled, setFlashlightEnabled, position, setPosition };
}

function getRevealStrength(pointerX: number, pointerY: number, targetX: number, targetY: number) {
  const dx = pointerX - targetX;
  const dy = pointerY - targetY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance >= 28) {
    return 0;
  }

  return Math.max(0, 1 - distance / 28);
}

export function TeaserLandingScene() {
  const { desktopFlashlight, flashlightEnabled, setFlashlightEnabled, position, setPosition } =
    useFlashlightState();
  const mobileCardRefs = useRef<Array<HTMLElement | null>>([]);

  const revealMask = useMemo(
    () =>
      desktopFlashlight && flashlightEnabled
        ? `radial-gradient(circle 11rem at ${position.x}% ${position.y}%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.98) 18%, rgba(255,255,255,0.72) 34%, rgba(255,255,255,0.26) 48%, transparent 64%)`
        : desktopFlashlight
          ? "radial-gradient(circle 11rem at 50% 38%, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 22%, transparent 64%)"
          : "radial-gradient(circle 14rem at 50% 38%, rgba(255,255,255,0.84) 0%, rgba(255,255,255,0.54) 34%, transparent 68%)",
    [desktopFlashlight, flashlightEnabled, position.x, position.y],
  );

  const spotlightStyle = useMemo(
    () => ({
      background: desktopFlashlight && flashlightEnabled
        ? [
            `radial-gradient(circle 15rem at ${position.x}% ${position.y}%, rgba(251, 228, 191, 0.68) 0%, rgba(238, 192, 129, 0.34) 14%, rgba(176, 126, 196, 0.16) 25%, rgba(65, 47, 82, 0.14) 34%, rgba(25, 20, 16, 0.48) 48%, rgba(7, 7, 8, 0.84) 70%, rgba(3, 3, 4, 0.985) 90%)`,
            `radial-gradient(circle 28rem at ${position.x}% ${position.y}%, rgba(212, 171, 109, 0.24) 0%, rgba(114, 92, 155, 0.12) 24%, transparent 54%)`,
          ].join(",")
        : desktopFlashlight
          ? "linear-gradient(180deg, rgba(4,5,6,0.06) 0%, rgba(3,3,4,0.14) 100%)"
          : "radial-gradient(circle 19rem at 50% 38%, rgba(244, 218, 179, 0.18) 0%, rgba(219, 182, 128, 0.08) 18%, rgba(24, 20, 16, 0.44) 52%, rgba(5, 5, 6, 0.92) 78%, rgba(3, 3, 4, 0.985) 94%)",
    }),
    [desktopFlashlight, flashlightEnabled, position.x, position.y],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    let frame = 0;

    const update = () => {
      frame = 0;

      if (!mediaQuery.matches) {
        return;
      }

      const viewportCenter = window.innerHeight * 0.56;
      const falloff = window.innerHeight * 0.42;

      teaserFragments.forEach((_, index) => {
        const element = mobileCardRefs.current[index];
        if (!element) {
          return;
        }

        const rect = element.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - viewportCenter);
        const strength = Math.max(0, 1 - distance / falloff);
        const reveal = 0.12 + strength * 0.88;

        element.style.opacity = `${reveal}`;
        element.style.transform = `scale(${0.965 + reveal * 0.04})`;
        element.style.filter = `brightness(${0.64 + reveal * 0.42}) blur(${(1 - reveal) * 1.1}px)`;
      });
    };

    const requestUpdate = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    mediaQuery.addEventListener("change", requestUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      mediaQuery.removeEventListener("change", requestUpdate);
    };
  }, []);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#040506] text-stone-100 md:h-screen"
      onClick={(event) => {
        if (desktopFlashlight) {
          const bounds = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - bounds.left) / bounds.width) * 100;
          const y = ((event.clientY - bounds.top) / bounds.height) * 100;

          setPosition({ x, y });
          setFlashlightEnabled((current) => !current);
        }
      }}
      onPointerMove={(event) => {
        if (!desktopFlashlight || !flashlightEnabled) {
          return;
        }

        const bounds = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;

        setPosition({ x, y });
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,7,8,0.96)_0%,rgba(3,3,4,1)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(76,63,47,0.16)_0%,transparent_35%),radial-gradient(circle_at_18%_22%,rgba(93,73,47,0.08)_0%,transparent_24%),radial-gradient(circle_at_82%_68%,rgba(55,64,71,0.12)_0%,transparent_26%)]" />
      <div className="absolute inset-0 opacity-[0.11] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.14)_0px,rgba(255,255,255,0.14)_1px,transparent_1px,transparent_3px)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_22%,rgba(0,0,0,0.72)_86%)]" />
      <div className="pointer-events-none absolute inset-0 transition-[background] duration-100 ease-out" style={spotlightStyle} />

      <div className="pointer-events-none fixed inset-x-0 top-[56vh] z-10 h-64 -translate-y-1/2 md:hidden">
        <div className="mx-auto h-full w-full max-w-md bg-[radial-gradient(circle,rgba(247,225,189,0.18)_0%,rgba(214,171,110,0.08)_24%,rgba(110,86,145,0.05)_42%,transparent_72%)] blur-2xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col md:h-screen">
        <div className="md:hidden">
          <header className="flex items-center justify-end px-5 pb-3 pt-5">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/15 bg-white/[0.03] px-4 text-stone-100 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-sm hover:bg-white/[0.08] hover:text-white"
            >
              <Link
                href={SITE_ROUTES.login}
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                Sign In
              </Link>
            </Button>
          </header>

          <section className="relative flex min-h-[88svh] flex-col items-center justify-center px-5 pb-12 pt-2 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(247,225,189,0.12)_0%,rgba(214,171,110,0.06)_18%,transparent_44%)]" />
            <div className="relative z-10 flex max-w-sm flex-col items-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 scale-125 rounded-full bg-[radial-gradient(circle,rgba(210,178,136,0.18)_0%,rgba(210,178,136,0.06)_34%,transparent_68%)] blur-3xl" />
                <Image
                  src="/hawkshaw_logo_white.png"
                  alt="Hawkshaw logo"
                  width={678}
                  height={435}
                  priority
                  className="relative h-auto w-[18.25rem] opacity-[0.78] drop-shadow-[0_30px_70px_rgba(0,0,0,0.82)]"
                />
              </div>

              <p className="mb-3 text-[0.68rem] uppercase tracking-[0.6em] text-stone-500">
                Live social mystery
              </p>
              <h1
                className={cn(uncialAntiqua.className, "max-w-[18rem] text-[2.65rem] leading-[1.02] text-stone-100")}
                style={{ letterSpacing: "0.08em", textShadow: "0 10px 40px rgba(0,0,0,0.74)" }}
              >
                HAWKSHAW
              </h1>
              <p className="mt-5 max-w-[18rem] text-sm leading-7 text-stone-400">
                A live social mystery of secrets, shifting loyalties, and hidden motives.
              </p>
            </div>
          </section>

          <section className="relative px-4 pb-[42svh]">
            <div className="mx-auto flex max-w-md flex-col gap-5">
              {teaserFragments.map((fragment, index) => (
                <article
                  key={fragment.title}
                  ref={(node) => {
                    mobileCardRefs.current[index] = node;
                  }}
                  className={cn(
                    "w-[min(18.5rem,88%)] rounded-[1.35rem] border border-white/10 bg-white/[0.05] p-4 shadow-[0_20px_50px_-28px_rgba(0,0,0,1)] backdrop-blur-sm",
                    index % 2 === 0 ? "self-start" : "self-end",
                  )}
                  style={{
                    opacity: 0.18,
                    transform: "scale(0.972)",
                    filter: "brightness(0.7) blur(0.95px)",
                    transition: "opacity 90ms linear, transform 90ms linear, filter 90ms linear",
                  }}
                >
                  <p className="text-[0.64rem] uppercase tracking-[0.38em] text-stone-500">
                    {fragment.label}
                  </p>
                  <h2
                    className="mt-2 text-[1.55rem] leading-[1.06] text-stone-100"
                    style={{
                      fontFamily:
                        '"Baskerville", "Libre Baskerville", "Iowan Old Style", "Palatino Linotype", serif',
                    }}
                  >
                    {fragment.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-400">{fragment.detail}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <header className="hidden items-center justify-end px-5 pb-3 pt-5 md:absolute md:right-0 md:top-0 md:z-20 md:flex md:w-full md:px-8 md:pb-0 md:pt-7">
          {desktopFlashlight ? (
            <p className="absolute left-5 top-5 text-[0.65rem] uppercase tracking-[0.34em] text-stone-600 md:left-8 md:top-7">
              Click to {flashlightEnabled ? "hide" : "light"}
            </p>
          ) : null}
          <Button
            asChild
            variant="outline"
            className="rounded-full border-white/15 bg-white/[0.03] px-4 text-stone-100 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-sm hover:bg-white/[0.08] hover:text-white"
          >
            <Link
              href={SITE_ROUTES.login}
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              Sign In
            </Link>
          </Button>
        </header>

        <section className="relative hidden flex-1 items-center justify-center px-5 pb-10 pt-4 md:flex md:px-8 md:py-6">
          <div className="relative mx-auto flex h-[calc(100vh-5.5rem)] w-full max-w-[96rem] items-center justify-center overflow-hidden rounded-[2.2rem] border border-white/[0.05] bg-black/20 shadow-[inset_0_0_80px_rgba(0,0,0,0.55)] md:h-[calc(100vh-3rem)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_44%)]" />

            <div className="relative z-10 flex max-w-4xl flex-col items-center px-6 text-center">
              <div className="relative mb-7 flex items-center justify-center md:mb-8">
                <div className="absolute h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(210,178,136,0.16)_0%,rgba(210,178,136,0.07)_34%,transparent_68%)] blur-3xl md:h-[29rem] md:w-[29rem]" />
                <div className="relative h-[11.25rem] w-[17.5rem] md:h-[17rem] md:w-[27rem] lg:h-[19.5rem] lg:w-[31rem]">
                  <Image
                    src="/hawkshaw_logo_white.png"
                    alt="Hawkshaw logo"
                    width={678}
                    height={435}
                    priority
                    className="absolute left-1/2 top-1/2 h-auto w-[17.5rem] -translate-x-1/2 -translate-y-1/2 opacity-[0.34] drop-shadow-[0_30px_70px_rgba(0,0,0,0.78)] md:w-[32.5rem] lg:w-[37rem]"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                    style={{
                      maskImage: revealMask,
                      WebkitMaskImage: revealMask,
                    }}
                  >
                    <Image
                      src="/hawkshaw_logo_white.png"
                      alt=""
                      aria-hidden="true"
                      width={678}
                      height={435}
                      className="absolute left-1/2 top-1/2 h-auto w-[17.5rem] -translate-x-1/2 -translate-y-1/2 opacity-[0.98] drop-shadow-[0_0_24px_rgba(232,182,120,0.24)] md:w-[32.5rem] lg:w-[37rem]"
                      style={{
                        filter:
                          "sepia(0.42) saturate(1.4) hue-rotate(-16deg) brightness(1.08)",
                        transition: "filter 220ms ease, opacity 220ms ease",
                      }}
                    />
                  </div>
                </div>
              </div>

              <p className="mb-5 text-[0.72rem] uppercase tracking-[0.72em] text-stone-500 md:mb-6 md:text-[0.78rem]">
                Live social mystery
              </p>
              <div className="relative">
                <h1
                  className={cn(
                    uncialAntiqua.className,
                    "text-[3.5rem] leading-[0.96] text-stone-100/58 md:text-[5.4rem] lg:text-[6.3rem]",
                  )}
                  style={{ letterSpacing: "0.14em", textShadow: "0 10px 40px rgba(0,0,0,0.72)" }}
                >
                  HAWKSHAW
                </h1>
                <h1
                  aria-hidden="true"
                  className={cn(
                    uncialAntiqua.className,
                    "pointer-events-none absolute inset-0 text-[3.5rem] leading-[0.96] text-[#e7d5ac] md:text-[5.4rem] lg:text-[6.3rem]",
                  )}
                  style={{
                    letterSpacing: "0.14em",
                    textShadow:
                      "0 0 10px rgba(255,210,148,0.14), 0 0 24px rgba(124,98,171,0.16), 0 10px 40px rgba(0,0,0,0.72)",
                    maskImage: revealMask,
                    WebkitMaskImage: revealMask,
                    color: "#f0dbad",
                    filter: "saturate(1.12)",
                    transition: "color 220ms ease, opacity 220ms ease, filter 220ms ease",
                  }}
                >
                  HAWKSHAW
                </h1>
              </div>
              <p className="mt-8 max-w-md text-sm leading-7 text-stone-400 md:max-w-3xl md:text-[1.02rem]">
                A live social mystery of secrets, shifting loyalties, and hidden motives.
              </p>
            </div>

            <div className="pointer-events-none absolute inset-0 hidden md:block">
              {teaserFragments.map((fragment) => {
                const reveal = desktopFlashlight
                  ? getRevealStrength(position.x, position.y, fragment.x, fragment.y)
                  : 0;

                return (
                  <article
                    key={fragment.title}
                    className={cn(
                      "absolute rounded-[1.35rem] border border-white/10 bg-[rgba(255,255,255,0.05)] p-4 shadow-[0_20px_50px_-28px_rgba(0,0,0,1)] backdrop-blur-md transition duration-150 ease-out",
                      fragment.rotation,
                      fragment.widthClass,
                    )}
                    style={{
                      left: `${fragment.x}%`,
                      top: `${fragment.y}%`,
                      opacity: flashlightEnabled ? reveal * 0.98 : 0,
                      transform: `translate(-50%, -50%) scale(${0.96 + reveal * 0.05}) rotate(${fragment.rotation.includes("-") ? "-3deg" : "3deg"})`,
                    }}
                    >
                      <p className="text-[0.65rem] uppercase tracking-[0.42em] text-stone-500">{fragment.label}</p>
                      <h2
                        className="mt-2.5 text-[1.45rem] leading-[1.04] text-stone-100"
                        style={{
                          fontFamily:
                            '"Baskerville", "Libre Baskerville", "Iowan Old Style", "Palatino Linotype", serif',
                        }}
                      >
                        {fragment.title}
                      </h2>
                      <p className="mt-2 text-[0.92rem] leading-6 text-stone-300/92">{fragment.detail}</p>
                    </article>
                );
              })}
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
