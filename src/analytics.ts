import type { PostHog } from "posthog-js";
import { profile } from "./content";

let started = false;

// Called once outside React effects, so StrictMode cannot duplicate listeners.
export async function startAnalytics() {
  const token = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN?.trim();
  if (started || !import.meta.env.PROD || !token ||
      window.location.hostname !== "mohd.paramasvara.online" ||
      navigator.webdriver || navigator.doNotTrack === "1") return;
  started = true;
  try {
    const { default: posthog } = await import("posthog-js");
    posthog.init(token, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
      defaults: "2026-01-30",
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      person_profiles: "identified_only",
      cross_subdomain_cookie: false,
      respect_dnt: true,
      disable_surveys: true,
      disable_session_recording: import.meta.env.VITE_POSTHOG_SESSION_REPLAY !== "true",
      enable_recording_console_log: false,
      session_recording: {
        maskAllInputs: true,
        recordCrossOriginIframes: false,
        recordHeaders: false,
        recordBody: false,
      },
      loaded: (client) => {
        client.register({ site: "mohd_portfolio", environment: "production" });
        trackInteractions(client);
      },
    });
  } catch {
    // Blocked/unavailable analytics must never prevent the portfolio loading.
  }
}

function trackInteractions(client: Pick<PostHog, "capture">) {
  const capture = (event: string, properties: Record<string, string>) =>
    client.capture(event, { page_path: window.location.pathname, ...properties });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const control = event.target.closest("a, button");
    if (!control) return;
    const placement = control.closest("section")?.id || "navigation";
    if (control.matches(".copy-email")) {
      capture("email_copy_clicked", { placement });
      return;
    }
    if (!(control instanceof HTMLAnchorElement)) return;
    const href = control.getAttribute("href");
    const action = href === profile.discovery ? "booking_clicked"
      : href === profile.resume ? "resume_clicked"
      : href === profile.cv ? "full_cv_clicked"
      : href?.startsWith("mailto:") ? "email_clicked"
      : href === "https://modvar.itch.io/no-two-mondays" ? "external_project_clicked"
      : control.pathname === "/no-two-mondays/" ? "ntm_case_study_clicked"
      : control.pathname === "/work-with-me/" ? "engagement_page_clicked"
      : control.pathname === "/incident-zero/" ? "incident_zero_clicked"
      : control.pathname === "/incident-zero/defence/" ? "system_defence_clicked"
      : undefined;
    if (action) capture(action, { placement });
  });

  document.addEventListener("toggle", (event) => {
    const details = event.target;
    if (!(details instanceof HTMLDetailsElement) || !details.open ||
        !details.matches(".case-details")) return;
    capture("case_study_opened", { case_id: details.closest("article")?.id || "unknown" });
  }, true);

  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      capture("section_viewed", { section: entry.target.id });
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -25% 0px", threshold: 0 });
  document.querySelectorAll("section[id]").forEach((section) => observer.observe(section));
}
