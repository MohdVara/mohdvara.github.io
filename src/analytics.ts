import type { PostHog } from "posthog-js";
import { profile } from "./content";
import { readAnalyticsPreference, subscribeAnalyticsPreference } from "./analyticsPreference";

type AnalyticsClient = Pick<PostHog, "capture" | "register" | "opt_in_capturing" | "opt_out_capturing">;
let started = false;
let client: AnalyticsClient | undefined;
let active = false;
let loading: Promise<void> | undefined;
let stopTracking: (() => void) | undefined;

const allowed = () => readAnalyticsPreference() && import.meta.env.PROD &&
  !!import.meta.env.VITE_POSTHOG_PROJECT_TOKEN?.trim() &&
  window.location.hostname === "mohd.paramasvara.online" &&
  !navigator.webdriver && navigator.doNotTrack !== "1" &&
  !(navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;

function stopAnalytics() {
  stopTracking?.();
  stopTracking = undefined;
  if (active) client?.opt_out_capturing();
  active = false;
}
function activate(current: AnalyticsClient) {
  if (active || !allowed()) return;
  current.opt_in_capturing({ captureEventName: false });
  current.register({ site: "mohd_portfolio", environment: "production" });
  active = true;
  current.capture("$pageview", { page_path: window.location.pathname });
  stopTracking = trackInteractions(current);
}
async function syncAnalytics() {
  if (!allowed()) { stopAnalytics(); return; }
  if (client) { activate(client); return; }
  if (loading) return loading;
  loading = (async () => {
    try {
      const { default: posthog } = await import("posthog-js");
      // Consent can be withdrawn while the optional SDK is downloading.
      if (!allowed()) return;
      posthog.init(import.meta.env.VITE_POSTHOG_PROJECT_TOKEN!.trim(), {
        api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
        defaults: "2026-01-30",
        capture_pageview: false,
        capture_pageleave: true,
        autocapture: false,
        person_profiles: "identified_only",
        persistence: "sessionStorage",
        opt_out_capturing_by_default: true,
        opt_out_persistence_by_default: true,
        cross_subdomain_cookie: false,
        respect_dnt: true,
        save_campaign_params: false,
        save_referrer: false,
        disable_surveys: true,
        disable_session_recording: true,
        property_denylist: ["$current_url", "$referrer", "$initial_current_url", "$initial_referrer"],
        enable_recording_console_log: false,
        session_recording: {
          maskAllInputs: true,
          recordCrossOriginIframes: false,
          recordHeaders: false,
          recordBody: false,
        },
        loaded: current => {
          client = current;
          if (allowed()) activate(current);
          else current.opt_out_capturing();
        },
      });
    } catch {
      // Blocked/unavailable analytics never prevents portfolio use.
    }
  })();
  try { await loading; } finally { loading = undefined; }
}

// One preference subscription outside React: no SDK request before opt-in.
export async function startAnalytics() {
  if (!started) {
    started = true;
    subscribeAnalyticsPreference(() => { void syncAnalytics(); });
  }
  await syncAnalytics();
}

function trackInteractions(client: Pick<PostHog, "capture">) {
  const capture = (event: string, properties: Record<string, string>) => {
    if (active && allowed()) client.capture(event, { page_path: window.location.pathname, ...properties });
  };

  const click = (event: MouseEvent) => {
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
    if (action) capture(action, control.pathname === "/incident-zero/"
      ? { placement, mode: new URLSearchParams(control.search).get("mode") === "preview" ? "preview" : "play" }
      : { placement });
  };

  const toggle = (event: Event) => {
    const details = event.target;
    if (!(details instanceof HTMLDetailsElement) || !details.open ||
        !details.matches(".case-details")) return;
    capture("case_study_opened", { case_id: details.closest("article")?.id || "unknown" });
  };
  document.addEventListener("click", click);
  document.addEventListener("toggle", toggle, true);
  const observer = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      capture("section_viewed", { section: entry.target.id });
      observer?.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -25% 0px", threshold: 0 }) : undefined;
  document.querySelectorAll("section[id]").forEach((section) => observer?.observe(section));
  return () => {
    document.removeEventListener("click", click);
    document.removeEventListener("toggle", toggle, true);
    observer?.disconnect();
  };
}
