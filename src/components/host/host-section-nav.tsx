"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { SITE_ROUTES } from "@/src/config/routes";

const HOST_SECTIONS = ["settings", "controls", "roster", "rooms", "scenario"] as const;

export type HostSection = (typeof HOST_SECTIONS)[number];

function getHostSection(section?: string | null): HostSection {
  if (section && HOST_SECTIONS.includes(section as HostSection)) {
    return section as HostSection;
  }

  return "settings";
}

function sectionHref(gameId: string, section: HostSection) {
  return `${SITE_ROUTES.gameHost(gameId)}?section=${section}`;
}

export function HostSectionNav({
  gameId,
  initialSection,
}: {
  gameId: string;
  initialSection: HostSection;
}) {
  const [activeSection, setActiveSection] = useState(initialSection);

  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-host-section-panel]").forEach((panel) => {
      const isActive = panel.dataset.hostSectionPanel === activeSection;
      panel.classList.toggle("contents", isActive);
      panel.classList.toggle("hidden", !isActive);
    });
  }, [activeSection]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveSection(getHostSection(new URLSearchParams(window.location.search).get("section")));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <Card className="app-surface overflow-hidden border-white/70">
      <CardContent className="px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
        <div className="-mx-1 overflow-x-auto scrollbar-hidden px-1">
          <div className="flex w-max gap-1.5">
            {HOST_SECTIONS.map((section) => (
              <Button
                key={section}
                className="h-9 shrink-0 rounded-full px-3.5 text-[14px]"
                size="sm"
                type="button"
                variant={activeSection === section ? "default" : "outline"}
                onClick={() => {
                  setActiveSection(section);
                  window.history.pushState(null, "", sectionHref(gameId, section));
                }}
              >
                {section === "scenario" ? "Scenario" : section.charAt(0).toUpperCase() + section.slice(1)}
              </Button>
            ))}
            <Link href={SITE_ROUTES.gamePlayer(gameId)}>
              <Button className="h-9 shrink-0 rounded-full px-3.5 text-[14px]" size="sm" type="button" variant="outline">
                Player
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
