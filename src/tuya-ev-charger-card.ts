import { LitElement, css, html, nothing } from "lit";

/* ─── Interfaces ─────────────────────────────────────────────────────────── */

interface HassEntity {
  entity_id?: string;
  state: string;
  attributes: Record<string, unknown>;
}

interface HomeAssistant {
  states: Record<string, HassEntity>;
  callService: (
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>
  ) => Promise<void>;
  callApi?: (
    method: string,
    path: string,
    parameters?: Record<string, unknown>
  ) => Promise<unknown>;
}

type ThemeId = "kinetic" | "minimal" | "ocean" | "solar-amber" | "arctic-flow" | "deep-mono";

const THEME_LABELS: Record<ThemeId, string> = {
  "kinetic":     "KINETIC",
  "minimal":     "MINIMAL",
  "ocean":       "OCEAN",
  "solar-amber": "SOLAR",
  "arctic-flow": "ARCTIC",
  "deep-mono":   "MONO",
};

interface CardConfig {
  type: string;
  title?: string;
  theme?: ThemeId;
  charger_name?: string;
  entities?: {
    power?: string;
    current?: string;
    voltage?: string;
    temperature?: string;
    work_state?: string;
    charge_current?: string;
    charge_session?: string;
    reboot?: string;
    surplus_mode?: string;
    surplus_profile?: string;
    surplus_start_threshold?: string;
    surplus_stop_threshold?: string;
    schedule_enabled?: string;
    schedule_start?: string;
    schedule_end?: string;
    regulation_active?: string;
    last_decision?: string;
    surplus_raw?: string;
    surplus_effective?: string;
    surplus_discharge_over_limit?: string;
    surplus_target_current?: string;
    selftest?: string;
    alarm?: string;
  };
}

interface ResolvedEntities {
  power?: string;
  current?: string;
  voltage?: string;
  temperature?: string;
  workState?: string;
  chargeCurrent?: string;
  chargeSession?: string;
  reboot?: string;
  surplusMode?: string;
  surplusProfile?: string;
  surplusStartThreshold?: string;
  surplusStopThreshold?: string;
  scheduleEnabled?: string;
  scheduleStart?: string;
  scheduleEnd?: string;
  regulationActive?: string;
  lastDecision?: string;
  surplusRaw?: string;
  surplusEffective?: string;
  surplusDischargeOverLimit?: string;
  surplusTargetCurrent?: string;
  selftest?: string;
  alarm?: string;
}

interface GraphSample {
  ts: number;
  powerW: number | null;
  surplusW: number | null;
}

interface HistorySeriesPoint {
  ts: number;
  valueW: number | null;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

type TabId = "dashboard" | "strategy" | "logs";
const PROFILE_OPTIONS = ["eco", "balanced", "fast"] as const;
type ProfileKey = (typeof PROFILE_OPTIONS)[number];

const PROFILE_META: Record<
  ProfileKey,
  { label: string; start: number; stop: number; icon: string }
> = {
  eco:      { label: "Eco",      start: 2200, stop: 1700, icon: "eco" },
  balanced: { label: "Balanced", start: 1600, stop: 1200, icon: "balance" },
  fast:     { label: "Fast",     start: 1200, stop: 900,  icon: "bolt" },
};

const ATTR_CARD_ROLE = "tuya_ev_charger_card_role";
const ATTR_CHARGER_TOKEN = "tuya_ev_charger_token";
const GRAPH_SAMPLE_INTERVAL_MS = 30_000;
const GRAPH_WINDOW_MS = 3_600_000;
const GRAPH_MAX_POINTS = GRAPH_WINDOW_MS / GRAPH_SAMPLE_INTERVAL_MS;
const GRAPH_HISTORY_RETRY_MS = 60_000;
const OPTIMISTIC_TIMEOUT_MS = 12_000;
const GAUGE_R = 43;
const GAUGE_CIRC = 2 * Math.PI * GAUGE_R; // ≈ 270.2
const GAUGE_MAX_W = 11_000;
const THRESHOLD_MAX_W = 6_000;
const THRESHOLD_STEP_W = 100;

/* ─── Main Card ──────────────────────────────────────────────────────────── */

class TuyaEvChargerCard extends LitElement {
  public hass?: HomeAssistant;

  private _config?: CardConfig;
  private _activeTab: TabId = "dashboard";
  private _graphHistory: GraphSample[] = [];
  private _graphHistoryLoading = false;
  private _resolvedEntities: ResolvedEntities = {};
  private _lastRenderSignature = "";
  private _optimisticStates: Record<string, string> = {};
  private _optimisticTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
  private _sliderValues: Record<string, number> = {};
  private _graphHistoryFetchInFlight = false;
  private _graphHistoryHydratedKey = "";
  private _graphHistoryLastFailedAt = 0;

  static properties = {
    hass: { attribute: false },
    _config: { attribute: false, state: true },
    _activeTab: { state: true },
    _graphHistory: { state: true },
    _graphHistoryLoading: { state: true },
    _resolvedEntities: { state: true },
    _optimisticStates: { state: true },
    _sliderValues: { state: true },
  };

  public static getStubConfig(): CardConfig {
    return { type: "custom:tuya-ev-charger-card", title: "EV Charger" };
  }

  public static getConfigElement(): HTMLElement {
    return document.createElement("tuya-ev-charger-card-editor");
  }

  public connectedCallback(): void {
    super.connectedCallback();
    this._injectFonts();
  }

  private _injectFonts(): void {
    if (document.querySelector("#tuya-ev-charger-fonts")) return;
    const link = document.createElement("link");
    link.id = "tuya-ev-charger-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;900&family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Noto+Serif:wght@400;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap";
    document.head.appendChild(link);
  }

  public setConfig(config: CardConfig): void {
    if (!config || config.type !== "custom:tuya-ev-charger-card") {
      throw new Error("Invalid card configuration.");
    }
    this._config = config;
    this.setAttribute("theme", config.theme ?? "kinetic");
    this._resolvedEntities = this._resolveEntities(config);
    this._graphHistory = [];
    this._graphHistoryLoading = false;
    this._graphHistoryHydratedKey = "";
    this._graphHistoryLastFailedAt = 0;
    this._clearAllOptimisticStates();
    this._sliderValues = {};
    this._lastRenderSignature = "";
  }

  public disconnectedCallback(): void {
    this._clearAllOptimisticStates();
    this._graphHistoryFetchInFlight = false;
    this._graphHistoryLoading = false;
    super.disconnectedCallback();
  }

  protected shouldUpdate(changed: Map<string, unknown>): boolean {
    if (
      changed.has("_config") ||
      changed.has("_resolvedEntities") ||
      changed.has("_activeTab") ||
      changed.has("_graphHistory") ||
      changed.has("_optimisticStates") ||
      changed.has("_sliderValues")
    ) {
      return true;
    }
    if (changed.has("hass")) {
      this._syncOptimisticStatesWithHass();
      this._maybeHydrateGraphHistory();
      const graphChanged = this._appendGraphSample();
      const next = this._stateSignature();
      const stateChanged = next !== this._lastRenderSignature;
      if (stateChanged) this._lastRenderSignature = next;
      return graphChanged || stateChanged;
    }
    return false;
  }

  /* ─── Render ─────────────────────────────────────────────────────────── */

  protected render() {
    if (!this._config || !this.hass) {
      return html`<ha-card><div class="pad">Card not ready.</div></ha-card>`;
    }
    return html`
      <ha-card>
        <div class="app">
          <div class="app-content">${this._renderTab()}</div>
          ${this._renderNav()}
        </div>
      </ha-card>
    `;
  }

  private _renderTab() {
    switch (this._activeTab) {
      case "dashboard": return this._renderDashboard();
      case "strategy":  return this._renderStrategy();
      case "logs":      return this._renderLogs();
    }
  }

  /* ─── Dashboard ──────────────────────────────────────────────────────── */

  private _renderDashboard() {
    const e = this._resolvedEntities;
    const chargeOn = this._isOn(e.chargeSession);
    const surplusOn = this._isOn(e.surplusMode);
    const regulationOn = this._isOn(e.regulationActive);
    const powerW = this._powerW(e.power);
    const currentA = this._numberState(e.current);
    const voltageV = this._numberState(e.voltage);
    const tempC = this._numberState(e.temperature);
    const workState = this._state(e.workState) ?? "—";
    const chargeCurrentA = this._numberState(e.chargeCurrent);
    const chargeCurrentEntity = this._entity(e.chargeCurrent);
    const allowedCurrents = this._allowedCurrents(chargeCurrentEntity);
    const currentMin =
      this._attrNumber(chargeCurrentEntity, "min") ??
      this._attrNumber(chargeCurrentEntity, "native_min_value") ?? 6;
    const currentMax =
      this._attrNumber(chargeCurrentEntity, "max") ??
      this._attrNumber(chargeCurrentEntity, "native_max_value") ?? 16;
    const currentStep =
      this._attrNumber(chargeCurrentEntity, "step") ??
      this._attrNumber(chargeCurrentEntity, "native_step") ?? 1;

    const title = this._config?.title ?? "EV Charger";
    const wsInfo = this._workStateInfo(workState);
    const isWorking = workState.toUpperCase() === "WORKING" || chargeOn;

    return html`
      <div class="dashboard">
        <!-- Header -->
        <header class="dash-header">
          <div>
            <div class="app-label">${THEME_LABELS[this._config?.theme ?? "kinetic"]}</div>
            <div class="dash-title">${title}</div>
          </div>
          <div class="chips">
            <span class="chip ${wsInfo.chipClass}">
              ${wsInfo.chipLabel}
            </span>
            <span class="chip ${surplusOn ? "chip-ok" : "chip-off"}">
              ${surplusOn ? "Surplus" : "Manual"}
            </span>
            ${regulationOn
              ? html`<span class="chip chip-ok">Regulating</span>`
              : nothing}
          </div>
        </header>

        <!-- Hero Gauge -->
        <section class="gauge-section">
          ${this._renderGauge(powerW, isWorking)}
          <!-- Status bar -->
          <div class="status-bar ${wsInfo.barClass}">
            <span class="status-dot ${wsInfo.dotClass}"></span>
            <span class="status-label">${workState.toUpperCase()}</span>
            <div class="status-divider"></div>
            <span class="mso status-icon ${wsInfo.iconClass}">${wsInfo.icon}</span>
            <span class="status-sub">${surplusOn ? "SOLAR" : "GRID"}</span>
          </div>
        </section>

        <!-- Telemetry grid -->
        <div class="tele-grid">
          <div class="tele-tile">
            <span class="mso tele-icon tele-icon--tertiary">bolt</span>
            <div class="tele-label">Voltage</div>
            <div class="tele-value">
              ${voltageV !== null ? voltageV.toFixed(0) : "—"}
              <span class="tele-unit">V</span>
            </div>
          </div>
          <div class="tele-tile">
            <span class="mso tele-icon tele-icon--secondary">speed</span>
            <div class="tele-label">Current</div>
            <div class="tele-value">
              ${currentA !== null ? currentA.toFixed(0) : "—"}
              <span class="tele-unit">A</span>
            </div>
          </div>
          <div class="tele-tile">
            <span class="mso tele-icon tele-icon--error">thermostat</span>
            <div class="tele-label">Charger</div>
            <div class="tele-value">
              ${tempC !== null ? tempC.toFixed(0) : "—"}
              <span class="tele-unit">°C</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="action-grid">
          <button
            class="btn-action btn-pause"
            @click=${this._onChargeToggle}
            ?disabled=${!e.chargeSession}
          >
            <span class="mso">${chargeOn ? "pause_circle" : "play_circle"}</span>
            ${chargeOn ? "Pause Session" : "Start Session"}
          </button>
          <button
            class="btn-action btn-emergency"
            @click=${this._onReboot}
            ?disabled=${!e.reboot}
          >
            <span class="mso" style="font-variation-settings:'FILL' 1">emergency_home</span>
            Emergency Stop
          </button>
        </div>

        <!-- Charge current control -->
        <div class="current-box">
          <div class="current-label">
            <span class="mso" style="font-size:1rem;color:var(--kin-primary)">tune</span>
            Charge current
          </div>
          <div class="current-ctrl">
            <button
              class="btn-step"
              @click=${() => {
                const t = this._stepCurrent(-1, chargeCurrentA, allowedCurrents, currentMin, currentMax, currentStep);
                this._setChargeCurrent(t, currentMin, currentMax, allowedCurrents);
              }}
              ?disabled=${!e.chargeCurrent}
            >−</button>
            <div class="current-val">${this._formatAmp(chargeCurrentA)}</div>
            <button
              class="btn-step"
              @click=${() => {
                const t = this._stepCurrent(1, chargeCurrentA, allowedCurrents, currentMin, currentMax, currentStep);
                this._setChargeCurrent(t, currentMin, currentMax, allowedCurrents);
              }}
              ?disabled=${!e.chargeCurrent}
            >+</button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderGauge(powerW: number | null, active: boolean) {
    const pct = powerW !== null ? Math.max(0, Math.min(1, powerW / GAUGE_MAX_W)) : 0;
    const fill = pct * GAUGE_CIRC;
    const displayKw = powerW !== null ? (powerW / 1000).toFixed(2) : "—";
    const unit = powerW !== null ? "kW" : "";

    return html`
      <div class="gauge-wrap">
        <svg class="gauge-svg" viewBox="0 0 100 100" aria-label="Power gauge">
          <!-- Track -->
          <circle
            cx="50" cy="50" r="${GAUGE_R}"
            class="gauge-track"
          />
          <!-- Arc -->
          <circle
            cx="50" cy="50" r="${GAUGE_R}"
            fill="none"
            stroke="var(--kin-primary)"
            stroke-width="8"
            stroke-linecap="round"
            stroke-dasharray="${fill.toFixed(2)} ${GAUGE_CIRC.toFixed(2)}"
            transform="rotate(-90 50 50)"
            class="${active ? "gauge-arc--glow" : ""}"
          />
        </svg>
        <div class="gauge-center">
          <div class="gauge-sublabel">Power Output</div>
          <div class="gauge-value">${displayKw}</div>
          <div class="gauge-unit">${unit}</div>
        </div>
      </div>
    `;
  }

  /* ─── Strategy ───────────────────────────────────────────────────────── */

  private _renderStrategy() {
    const e = this._resolvedEntities;
    const surplusOn = this._isOn(e.surplusMode);
    const profile = (this._state(e.surplusProfile) ?? "balanced") as ProfileKey;

    const startW = this._sliderValues[e.surplusStartThreshold ?? ""] ??
      this._numberState(e.surplusStartThreshold) ?? 1600;
    const stopW = this._sliderValues[e.surplusStopThreshold ?? ""] ??
      this._numberState(e.surplusStopThreshold) ?? 1200;

    const startPct = ((startW / THRESHOLD_MAX_W) * 100).toFixed(1);
    const stopPct = ((stopW / THRESHOLD_MAX_W) * 100).toFixed(1);

    const lastDecision = this._state(e.lastDecision) ?? "—";
    const targetA = this._numberState(e.surplusTargetCurrent);

    return html`
      <div class="strategy">
        <header class="page-header">
          <div class="page-sup">Energy Management</div>
          <div class="page-title">Surplus Strategy</div>
        </header>

        <!-- Surplus mode toggle -->
        <section class="strat-section">
          <div class="strat-row">
            <div class="strat-row-left">
              <span class="mso strat-icon">solar_power</span>
              <div>
                <div class="strat-row-title">Surplus Mode</div>
                <div class="strat-row-sub">Solar regulation active</div>
              </div>
            </div>
            <button
              class="toggle ${surplusOn ? "toggle--on" : ""}"
              @click=${this._onSurplusToggle}
              ?disabled=${!e.surplusMode}
              aria-label="Toggle surplus mode"
            >
              <div class="toggle-thumb"></div>
            </button>
          </div>
        </section>

        <!-- Profile selector -->
        <section class="strat-section">
          <div class="strat-section-label">Strategy Profile</div>
          <div class="profile-grid">
            ${PROFILE_OPTIONS.map((p) => {
              const m = PROFILE_META[p];
              const active = profile === p;
              return html`
                <button
                  class="profile-btn ${active ? "profile-btn--active" : ""}"
                  @click=${() => this._setProfile(p)}
                  ?disabled=${!e.surplusProfile}
                >
                  <span class="mso profile-icon">${m.icon}</span>
                  <span class="profile-name">${m.label}</span>
                  <span class="profile-thresholds">${m.start}/${m.stop}W</span>
                </button>
              `;
            })}
          </div>
        </section>

        <!-- Thresholds -->
        <section class="strat-section">
          <div class="strat-section-label">Power Thresholds</div>

          <!-- Start threshold -->
          <div class="threshold-block">
            <div class="threshold-header">
              <div>
                <div class="threshold-label">Start Threshold</div>
                <div class="threshold-value">
                  ${startW}<span class="threshold-unit">W</span>
                </div>
              </div>
              <div class="threshold-right-label">Surplus Power</div>
            </div>
            <input
              type="range"
              min="0"
              max="${THRESHOLD_MAX_W}"
              step="${THRESHOLD_STEP_W}"
              .value=${String(startW)}
              style="--pct: ${startPct}%"
              @input=${(ev: Event) => this._onThresholdInput(e.surplusStartThreshold, ev)}
              @change=${(ev: Event) => this._onThresholdChange(e.surplusStartThreshold, ev)}
              ?disabled=${!this._entityExists(e.surplusStartThreshold)}
              class="slider slider--primary"
            />
          </div>

          <!-- Stop threshold -->
          <div class="threshold-block">
            <div class="threshold-header">
              <div>
                <div class="threshold-label">Stop Threshold</div>
                <div class="threshold-value threshold-value--stop">
                  ${stopW}<span class="threshold-unit">W</span>
                </div>
              </div>
              <div class="threshold-right-label">Grid Draw</div>
            </div>
            <input
              type="range"
              min="0"
              max="${THRESHOLD_MAX_W}"
              step="${THRESHOLD_STEP_W}"
              .value=${String(stopW)}
              style="--pct: ${stopPct}%"
              @input=${(ev: Event) => this._onThresholdInput(e.surplusStopThreshold, ev)}
              @change=${(ev: Event) => this._onThresholdChange(e.surplusStopThreshold, ev)}
              ?disabled=${!this._entityExists(e.surplusStopThreshold)}
              class="slider slider--error"
            />
          </div>
        </section>

        <!-- Scheduled charging -->
        <section class="strat-section">
          <div class="strat-row">
            <div class="strat-row-left">
              <span class="mso strat-icon">schedule</span>
              <div>
                <div class="strat-row-title">Scheduled Charging</div>
                <div class="strat-row-sub">Charge within a time window</div>
              </div>
            </div>
            <button
              class="toggle ${this._isOn(e.scheduleEnabled) ? "toggle--on" : ""}"
              @click=${this._onScheduleToggle}
              ?disabled=${!e.scheduleEnabled}
              aria-label="Toggle scheduled charging"
            >
              <div class="toggle-thumb"></div>
            </button>
          </div>
          <div class="schedule-times ${this._isOn(e.scheduleEnabled) ? "" : "schedule-times--disabled"}">
            <div class="schedule-time-field">
              <label class="schedule-time-label">Start</label>
              <input
                type="time"
                class="schedule-time-input"
                .value=${(this._state(e.scheduleStart) ?? "00:00").substring(0, 5)}
                ?disabled=${!this._isOn(e.scheduleEnabled) || !e.scheduleStart}
                @change=${(ev: Event) => this._onScheduleTimeChange(e.scheduleStart, ev)}
              />
            </div>
            <div class="schedule-time-field">
              <label class="schedule-time-label">End</label>
              <input
                type="time"
                class="schedule-time-input"
                .value=${(this._state(e.scheduleEnd) ?? "00:00").substring(0, 5)}
                ?disabled=${!this._isOn(e.scheduleEnabled) || !e.scheduleEnd}
                @change=${(ev: Event) => this._onScheduleTimeChange(e.scheduleEnd, ev)}
              />
            </div>
          </div>
        </section>

        <!-- Live status -->
        <section class="strat-section">
          <div class="strat-section-label">Live Status</div>
          <div class="live-grid">
            <div class="live-item">
              <div class="live-item-label">Target Current</div>
              <div class="live-item-value">${this._formatAmp(targetA)}</div>
            </div>
            <div class="live-item">
              <div class="live-item-label">Last Decision</div>
              <div class="live-item-value live-item-value--decision">${lastDecision}</div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  /* ─── Logs ───────────────────────────────────────────────────────────── */

  private _renderLogs() {
    const e = this._resolvedEntities;
    const selftest = this._state(e.selftest) ?? "—";
    const alarm = this._state(e.alarm) ?? "—";
    const lastDecision = this._state(e.lastDecision) ?? "—";
    const surplusRawW = this._powerW(e.surplusRaw);
    const surplusEffectiveW = this._powerW(e.surplusEffective);
    const selftestOk =
      selftest.toUpperCase().includes("OK") ||
      selftest.toUpperCase().includes("PASS") ||
      selftest === "—";
    const alarmOk =
      alarm === "—" || alarm === "" || alarm === "0" ||
      alarm.toUpperCase() === "NONE" || alarm.toUpperCase() === "OK";

    return html`
      <div class="logs">
        <header class="page-header">
          <div class="page-sup">Monitoring</div>
          <div class="page-title">Charge Logs</div>
        </header>

        <!-- Graph -->
        <section class="logs-section">
          <div class="logs-section-label">Last Hour — Power &amp; Surplus</div>
          ${this._renderGraph()}
        </section>

        <!-- Diagnostics -->
        <section class="logs-section">
          <div class="logs-section-label">Diagnostics</div>
          <div class="diag-row">
            <div class="diag-card">
              <div class="diag-icon-wrap ${selftestOk ? "diag-icon-wrap--ok" : "diag-icon-wrap--warn"}">
                <span class="mso">${selftestOk ? "health_and_safety" : "warning"}</span>
              </div>
              <div>
                <div class="diag-label">Self-Test</div>
                <div class="diag-value">${selftest.toUpperCase()}</div>
              </div>
            </div>
            <div class="diag-card">
              <div class="diag-icon-wrap ${alarmOk ? "" : "diag-icon-wrap--warn"}">
                <span class="mso">${alarmOk ? "notifications_off" : "notification_important"}</span>
              </div>
              <div>
                <div class="diag-label">Alarms</div>
                <div class="diag-value">${alarmOk ? "NONE ACTIVE" : alarm.toUpperCase()}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Surplus debug -->
        <section class="logs-section">
          <div class="logs-section-label">Surplus Debug</div>
          <div class="debug-grid">
            <div class="debug-item">
              <div class="debug-item-label">Raw surplus</div>
              <div class="debug-item-value">${this._formatPower(surplusRawW)}</div>
            </div>
            <div class="debug-item">
              <div class="debug-item-label">Effective surplus</div>
              <div class="debug-item-value">${this._formatPower(surplusEffectiveW)}</div>
            </div>
          </div>
        </section>

        <!-- Terminal log -->
        <section class="logs-section">
          <div class="logs-section-label">Decision Log</div>
          <div class="terminal">
            <div class="terminal-icon-bg">
              <span class="mso">terminal</span>
            </div>
            <div class="terminal-line">
              <span class="terminal-ts">${this._nowHMS()}</span>
              <span class="terminal-tag terminal-tag--active">LIVE</span>
              <span class="terminal-msg">${lastDecision}</span>
            </div>
            <div class="terminal-footer">
              <div class="terminal-live">
                <span class="terminal-live-dot"></span>
                <span>Live Monitoring Active</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  /* ─── Graph (1h history) ─────────────────────────────────────────────── */

  private _renderGraph() {
    const points = this._graphHistory;
    if (points.length < 2) {
      return html`
        <div class="graph-empty">
          ${this._graphHistoryLoading ? "Loading history…" : "Collecting samples…"}
        </div>
      `;
    }
    const width = 360;
    const height = 90;
    const allValues = points.flatMap((s) =>
      [s.powerW, s.surplusW].filter((v): v is number => v !== null)
    );
    const maxAbs = Math.max(500, ...allValues.map((v) => Math.abs(v)));
    const min = -maxAbs;
    const max = maxAbs;

    const powerPath = this._buildPath(points.map((s) => s.powerW), min, max, width, height);
    const surplusPath = this._buildPath(points.map((s) => s.surplusW), min, max, width, height);
    const zeroY = this._scaleY(0, min, max, height);

    return html`
      <div class="graph-wrap">
        <svg class="graph-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-label="Power graph">
          <line x1="0" y1="${zeroY}" x2="${width}" y2="${zeroY}" class="graph-axis"></line>
          <path d="${powerPath}" class="graph-line graph-line--power"></path>
          <path d="${surplusPath}" class="graph-line graph-line--surplus"></path>
        </svg>
        <div class="graph-legend">
          <span class="legend-item">
            <i class="legend-dot legend-dot--power"></i>Power
          </span>
          <span class="legend-item">
            <i class="legend-dot legend-dot--surplus"></i>Eff. Surplus
          </span>
        </div>
      </div>
    `;
  }

  /* ─── Bottom nav ─────────────────────────────────────────────────────── */

  private _renderNav() {
    const tabs: { id: TabId; icon: string; label: string }[] = [
      { id: "dashboard", icon: "speed",        label: "Dashboard" },
      { id: "strategy",  icon: "settings_suggest", label: "Strategy" },
      { id: "logs",      icon: "history",      label: "Logs" },
    ];
    return html`
      <nav class="bottom-nav">
        ${tabs.map(
          (t) => html`
            <button
              class="nav-item ${this._activeTab === t.id ? "nav-item--active" : ""}"
              @click=${() => { this._activeTab = t.id; }}
            >
              <span class="mso nav-icon">${t.icon}</span>
              <span class="nav-label">${t.label}</span>
            </button>
          `
        )}
      </nav>
    `;
  }

  /* ─── Graph data / history ───────────────────────────────────────────── */

  private _appendGraphSample(): boolean {
    if (!this.hass) return false;
    const now = Date.now();
    const last = this._graphHistory[this._graphHistory.length - 1];
    if (last && now - last.ts < GRAPH_SAMPLE_INTERVAL_MS) return false;
    const powerW = this._powerW(this._resolvedEntities.power);
    const surplusW = this._powerW(this._resolvedEntities.surplusEffective);
    const next: GraphSample = { ts: now, powerW, surplusW };
    const cutoff = now - GRAPH_WINDOW_MS;
    this._graphHistory = [...this._graphHistory, next]
      .filter((s) => s.ts >= cutoff)
      .slice(-GRAPH_MAX_POINTS);
    return true;
  }

  private _graphHydrationKey(): string {
    return [this._resolvedEntities.power, this._resolvedEntities.surplusEffective]
      .filter((v): v is string => Boolean(v))
      .join("|");
  }

  private _maybeHydrateGraphHistory(): void {
    const key = this._graphHydrationKey();
    if (!this.hass?.callApi || !key) return;
    if (this._graphHistoryFetchInFlight) return;
    if (this._graphHistoryHydratedKey === key && this._graphHistory.length >= 2) return;
    if (
      this._graphHistoryLastFailedAt > 0 &&
      Date.now() - this._graphHistoryLastFailedAt < GRAPH_HISTORY_RETRY_MS
    ) return;
    void this._hydrateGraphHistory(key);
  }

  private async _hydrateGraphHistory(key: string): Promise<void> {
    if (!this.hass?.callApi) return;
    const entityIds = [
      this._resolvedEntities.power,
      this._resolvedEntities.surplusEffective,
    ].filter((v): v is string => Boolean(v));
    if (!entityIds.length) return;

    this._graphHistoryFetchInFlight = true;
    this._graphHistoryLoading = true;
    const endTs = Date.now();
    const startTs = endTs - GRAPH_WINDOW_MS;
    const startIso = encodeURIComponent(new Date(startTs).toISOString());
    const endIso = encodeURIComponent(new Date(endTs).toISOString());
    const filterEntityId = encodeURIComponent([...new Set(entityIds)].join(","));
    const path =
      `history/period/${startIso}?filter_entity_id=${filterEntityId}` +
      `&end_time=${endIso}&significant_changes_only=0`;

    try {
      const payload = await this.hass.callApi("GET", path);
      if (key !== this._graphHydrationKey()) return;
      const merged = this._buildHistoryGraphSamples(payload, startTs, endTs);
      this._graphHistoryHydratedKey = key;
      if (merged.length) {
        this._graphHistory = merged;
        this._graphHistoryLastFailedAt = 0;
      }
    } catch {
      this._graphHistoryLastFailedAt = Date.now();
    } finally {
      this._graphHistoryFetchInFlight = false;
      this._graphHistoryLoading = false;
    }
  }

  private _buildHistoryGraphSamples(
    payload: unknown,
    startTs: number,
    endTs: number
  ): GraphSample[] {
    const grouped = this._historyByEntity(payload);
    const powerSeries = this._seriesFromHistory(
      grouped.get(this._resolvedEntities.power ?? "") ?? [],
      this._resolvedEntities.power
    );
    const surplusSeries = this._seriesFromHistory(
      grouped.get(this._resolvedEntities.surplusEffective ?? "") ?? [],
      this._resolvedEntities.surplusEffective
    );
    if (!powerSeries.length && !surplusSeries.length) return [];

    const alignedStart = Math.floor(startTs / GRAPH_SAMPLE_INTERVAL_MS) * GRAPH_SAMPLE_INTERVAL_MS;
    const points: GraphSample[] = [];
    let pi = 0, si = 0;
    let powerValue: number | null = null;
    let surplusValue: number | null = null;

    for (let ts = alignedStart; ts <= endTs; ts += GRAPH_SAMPLE_INTERVAL_MS) {
      while (pi < powerSeries.length && powerSeries[pi].ts <= ts) { powerValue = powerSeries[pi].valueW; pi++; }
      while (si < surplusSeries.length && surplusSeries[si].ts <= ts) { surplusValue = surplusSeries[si].valueW; si++; }
      points.push({ ts, powerW: powerValue, surplusW: surplusValue });
    }
    return points
      .filter((s) => s.powerW !== null || s.surplusW !== null)
      .slice(-GRAPH_MAX_POINTS);
  }

  private _historyByEntity(payload: unknown): Map<string, Array<Record<string, unknown>>> {
    const grouped = new Map<string, Array<Record<string, unknown>>>();
    if (!Array.isArray(payload)) return grouped;
    for (const rawSeries of payload) {
      if (!Array.isArray(rawSeries)) continue;
      let fallback = "";
      for (const rawState of rawSeries) {
        if (!rawState || typeof rawState !== "object") continue;
        const state = rawState as Record<string, unknown>;
        const id = state.entity_id;
        if (typeof id === "string" && id.trim()) fallback = id.trim();
        if (!fallback) continue;
        const list = grouped.get(fallback) ?? [];
        list.push(state);
        grouped.set(fallback, list);
      }
    }
    return grouped;
  }

  private _seriesFromHistory(
    history: Array<Record<string, unknown>>,
    entityId?: string
  ): HistorySeriesPoint[] {
    const unit = this._entityPowerUnit(entityId);
    const series: HistorySeriesPoint[] = [];
    for (const row of history) {
      const rawTs = row.last_changed ?? row.last_updated;
      if (typeof rawTs !== "string") continue;
      const ts = Date.parse(rawTs);
      if (!Number.isFinite(ts)) continue;
      const raw = String(row.state ?? "").trim().toLowerCase();
      if (!raw || raw === "unknown" || raw === "unavailable" || raw === "none") {
        series.push({ ts, valueW: null });
        continue;
      }
      const parsed = Number(row.state);
      const valueW = Number.isFinite(parsed) ? this._convertPowerToWatts(parsed, unit) : null;
      series.push({ ts, valueW });
    }
    series.sort((a, b) => a.ts - b.ts);
    return series;
  }

  private _buildPath(
    values: Array<number | null>,
    min: number, max: number,
    width: number, height: number
  ): string {
    const step = width / Math.max(1, values.length - 1);
    let path = "";
    values.forEach((v, i) => {
      if (v === null) return;
      const x = i * step;
      const y = this._scaleY(v, min, max, height);
      path += path ? ` L ${x.toFixed(2)} ${y.toFixed(2)}` : `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    });
    return path;
  }

  private _scaleY(v: number, min: number, max: number, height: number): number {
    if (max <= min) return height / 2;
    return height - ((v - min) / (max - min)) * height;
  }

  /* ─── Entity accessors ───────────────────────────────────────────────── */

  private _entity(id?: string): HassEntity | undefined {
    if (!id || !this.hass) return undefined;
    return this.hass.states[id];
  }

  /** True only if the entity ID is configured AND present in hass.states. */
  private _entityExists(id?: string): boolean {
    return Boolean(id && this.hass?.states[id]);
  }

  private _state(id?: string): string | undefined {
    if (!id) return undefined;
    const opt = this._optimisticStates[id];
    if (opt !== undefined) return opt;
    return this._entity(id)?.state;
  }

  private _workStateInfo(state: string): {
    icon: string; barClass: string; dotClass: string;
    iconClass: string; chipLabel: string; chipClass: string;
  } {
    switch (state.toUpperCase()) {
      case "WORKING":
        return { icon: "bolt",           barClass: "status-bar--active",    dotClass: "status-dot--pulse",     iconClass: "status-icon--ok",        chipLabel: "Charging",  chipClass: "chip-ok" };
      case "IDLEINS":
        return { icon: "cable",          barClass: "status-bar--connected",  dotClass: "status-dot--connected", iconClass: "status-icon--connected", chipLabel: "Connected", chipClass: "chip-connected" };
      case "WAIT":
        return { icon: "schedule",       barClass: "status-bar--wait",       dotClass: "status-dot--wait",      iconClass: "status-icon--warn",      chipLabel: "Waiting",   chipClass: "chip-wait" };
      case "ERRORPAUSE":
        return { icon: "warning",        barClass: "status-bar--error",      dotClass: "status-dot--error",     iconClass: "status-icon--error",     chipLabel: "Error",     chipClass: "chip-error" };
      case "PAUSE":
        return { icon: "pause_circle",   barClass: "status-bar--wait",       dotClass: "status-dot--wait",      iconClass: "status-icon--warn",      chipLabel: "Paused",    chipClass: "chip-wait" };
      case "STOP":
        return { icon: "stop_circle",    barClass: "",                       dotClass: "",                      iconClass: "",                       chipLabel: "Stopped",   chipClass: "chip-off" };
      case "SLEEP":
        return { icon: "bedtime",        barClass: "",                       dotClass: "",                      iconClass: "",                       chipLabel: "Sleep",     chipClass: "chip-off" };
      case "EMPTY":
        return { icon: "device_unknown", barClass: "",                       dotClass: "",                      iconClass: "",                       chipLabel: "Unknown",   chipClass: "chip-off" };
      case "IDLE":
      default:
        return { icon: "ev_station",     barClass: "",                       dotClass: "",                      iconClass: "",                       chipLabel: "Idle",      chipClass: "chip-off" };
    }
  }

  private _isOn(id?: string): boolean {
    return this._state(id) === "on";
  }

  private _numberState(id?: string): number | null {
    const s = this._state(id);
    if (s === undefined || s === "unknown" || s === "unavailable") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  private _powerW(id?: string): number | null {
    const entity = this._entity(id);
    if (!entity) return null;
    const n = this._numberState(id);
    if (n === null) return null;
    return this._convertPowerToWatts(n, this._entityPowerUnit(id));
  }

  private _entityPowerUnit(id?: string): string {
    const e = this._entity(id);
    return String(
      e?.attributes.unit_of_measurement ?? e?.attributes.native_unit_of_measurement ?? ""
    ).trim().toLowerCase();
  }

  private _convertPowerToWatts(v: number, unit: string): number {
    return unit === "kw" ? v * 1000 : v;
  }

  private _attrNumber(entity: HassEntity | undefined, key: string): number | null {
    if (!entity) return null;
    const n = Number(entity.attributes[key]);
    return Number.isFinite(n) ? n : null;
  }

  private _allowedCurrents(entity: HassEntity | undefined): number[] {
    if (!entity) return [];
    const raws = [
      entity.attributes.allowed_currents,
      entity.attributes.available_currents,
      entity.attributes.adjust_current_options,
    ];
    const parsed: number[] = [];
    for (const raw of raws) {
      if (Array.isArray(raw)) {
        for (const v of raw) {
          const n = Number(v);
          if (Number.isFinite(n)) parsed.push(Math.round(n));
        }
      } else if (typeof raw === "string") {
        for (const chunk of raw.split(",")) {
          const n = Number(chunk.trim());
          if (Number.isFinite(n)) parsed.push(Math.round(n));
        }
      }
    }
    return [...new Set(parsed)].filter((v) => v > 0).sort((a, b) => a - b);
  }

  /* ─── Formatters ─────────────────────────────────────────────────────── */

  private _formatPower(w: number | null): string {
    if (w === null) return "—";
    const abs = Math.abs(w);
    return abs >= 1000 ? `${(w / 1000).toFixed(2)} kW` : `${Math.round(w)} W`;
  }

  private _formatAmp(a: number | null): string {
    if (a === null) return "—";
    return `${Math.round(a)} A`;
  }

  private _nowHMS(): string {
    return new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  /* ─── State signature ────────────────────────────────────────────────── */

  private _stateSignature(): string {
    if (!this.hass) return "no-hass";
    const ids = this._trackedEntityIds();
    if (!ids.length) return "no-entities";
    return ids.map((id) => {
      const e = this.hass!.states[id];
      if (!e) return `${id}:missing`;
      return `${id}:${e.state}`;
    }).join(";");
  }

  private _trackedEntityIds(): string[] {
    const r = this._resolvedEntities;
    const all = [
      r.power, r.current, r.voltage, r.temperature, r.workState,
      r.chargeCurrent, r.chargeSession, r.reboot,
      r.surplusMode, r.surplusProfile, r.surplusStartThreshold, r.surplusStopThreshold,
      r.scheduleEnabled, r.scheduleStart, r.scheduleEnd,
      r.regulationActive, r.lastDecision, r.surplusRaw, r.surplusEffective,
      r.surplusDischargeOverLimit, r.surplusTargetCurrent,
      r.selftest, r.alarm,
    ];
    return [...new Set(all.filter((v): v is string => Boolean(v)))];
  }

  /* ─── Entity resolution ──────────────────────────────────────────────── */

  private _resolveEntities(config: CardConfig): ResolvedEntities {
    const token = this._normalizeToken(config.charger_name);
    const c = config.entities ?? {};
    const fb = (domain: string, suffix: string): string | undefined =>
      token ? `${domain}.${token}_${suffix}` : undefined;

    // Also try auto-discovery via card_role attributes
    const byRole = this._discoverByRole();

    return {
      power:    c.power    ?? byRole.power    ?? fb("sensor", "power_l1"),
      current:  c.current  ?? byRole.current  ?? fb("sensor", "current_l1"),
      voltage:  c.voltage  ?? fb("sensor", "voltage_l1"),
      temperature: c.temperature ?? fb("sensor", "temperature"),
      workState: c.work_state ?? fb("sensor", "work_state"),
      chargeCurrent: c.charge_current ?? byRole.chargeCurrent ?? fb("number", "charge_current"),
      chargeSession: c.charge_session ?? byRole.chargeSession ?? fb("switch", "charge_session"),
      reboot: c.reboot ?? fb("button", "reboot_charger"),
      surplusMode: c.surplus_mode ?? byRole.surplusMode ?? fb("switch", "surplus_mode"),
      surplusProfile: c.surplus_profile ?? byRole.surplusProfile ?? fb("select", "surplus_profile"),
      surplusStartThreshold: c.surplus_start_threshold ?? fb("number", "surplus_start_threshold_w"),
      surplusStopThreshold: c.surplus_stop_threshold ?? fb("number", "surplus_stop_threshold_w"),
      scheduleEnabled: c.schedule_enabled ?? byRole.scheduleEnabled ?? fb("switch", "schedule_enabled"),
      scheduleStart: c.schedule_start ?? byRole.scheduleStart ?? fb("time", "schedule_start"),
      scheduleEnd: c.schedule_end ?? byRole.scheduleEnd ?? fb("time", "schedule_end"),
      regulationActive: c.regulation_active ?? byRole.regulationActive ?? fb("binary_sensor", "surplus_regulation_active"),
      lastDecision: c.last_decision ?? byRole.lastDecision ?? fb("sensor", "surplus_last_decision_reason"),
      surplusRaw: c.surplus_raw ?? byRole.surplusRaw ?? fb("sensor", "surplus_raw_w"),
      surplusEffective: c.surplus_effective ?? byRole.surplusEffective ?? fb("sensor", "surplus_effective_w"),
      surplusDischargeOverLimit: c.surplus_discharge_over_limit ?? byRole.surplusDischargeOverLimit ?? fb("sensor", "surplus_battery_discharge_over_limit_w"),
      surplusTargetCurrent: c.surplus_target_current ?? byRole.surplusTargetCurrent ?? fb("sensor", "surplus_target_current_a"),
      selftest: c.selftest ?? fb("sensor", "selftest"),
      alarm: c.alarm ?? fb("sensor", "alarm"),
    };
  }

  private _discoverByRole(): Partial<ResolvedEntities> {
    if (!this.hass) return {};
    const result: Partial<ResolvedEntities> = {};
    for (const [entityId, entity] of Object.entries(this.hass.states)) {
      const role = entity.attributes[ATTR_CARD_ROLE];
      if (!role) continue;
      switch (role) {
        case "power":          result.power = entityId; break;
        case "current":        result.current = entityId; break;
        case "charge_current": result.chargeCurrent = entityId; break;
        case "charge_session": result.chargeSession = entityId; break;
        case "surplus_mode":   result.surplusMode = entityId; break;
        case "surplus_profile": result.surplusProfile = entityId; break;
        case "regulation_active": result.regulationActive = entityId; break;
        case "last_decision":  result.lastDecision = entityId; break;
        case "surplus_raw":    result.surplusRaw = entityId; break;
        case "surplus_effective": result.surplusEffective = entityId; break;
        case "surplus_discharge_over_limit": result.surplusDischargeOverLimit = entityId; break;
        case "surplus_target_current": result.surplusTargetCurrent = entityId; break;
        case "voltage":                result.voltage = entityId; break;
        case "temperature":            result.temperature = entityId; break;
        case "work_state":             result.workState = entityId; break;
        case "selftest":               result.selftest = entityId; break;
        case "alarm":                  result.alarm = entityId; break;
        case "reboot":                 result.reboot = entityId; break;
        case "surplus_start_threshold": result.surplusStartThreshold = entityId; break;
        case "surplus_stop_threshold":  result.surplusStopThreshold = entityId; break;
        case "schedule_enabled": result.scheduleEnabled = entityId; break;
        case "schedule_start":   result.scheduleStart = entityId; break;
        case "schedule_end":     result.scheduleEnd = entityId; break;
      }
    }
    return result;
  }

  private _normalizeToken(input?: string): string {
    return String(input ?? "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
  }

  /* ─── Optimistic states ──────────────────────────────────────────────── */

  private _syncOptimisticStatesWithHass(): void {
    if (!this.hass) return;
    const entries = Object.entries(this._optimisticStates);
    if (!entries.length) return;
    let changed = false;
    const next = { ...this._optimisticStates };
    for (const [id, opt] of entries) {
      const real = this.hass.states[id]?.state;
      if (real === undefined || real === opt) {
        delete next[id];
        const t = this._optimisticTimeouts.get(id);
        if (t) { clearTimeout(t); this._optimisticTimeouts.delete(id); }
        changed = true;
      }
    }
    if (changed) this._optimisticStates = next;
  }

  private _setOptimisticState(id: string | undefined, state: string): void {
    if (!id) return;
    const prev = this._optimisticTimeouts.get(id);
    if (prev) clearTimeout(prev);
    this._optimisticStates = { ...this._optimisticStates, [id]: state };
    const t = setTimeout(() => this._clearOptimisticState(id), OPTIMISTIC_TIMEOUT_MS);
    this._optimisticTimeouts.set(id, t);
  }

  private _clearOptimisticState(id: string | undefined): void {
    if (!id || !(id in this._optimisticStates)) return;
    const next = { ...this._optimisticStates };
    delete next[id];
    this._optimisticStates = next;
    const t = this._optimisticTimeouts.get(id);
    if (t) { clearTimeout(t); this._optimisticTimeouts.delete(id); }
  }

  private _clearAllOptimisticStates(): void {
    for (const t of this._optimisticTimeouts.values()) clearTimeout(t);
    this._optimisticTimeouts.clear();
    this._optimisticStates = {};
  }

  /* ─── Action handlers ────────────────────────────────────────────────── */

  private async _onChargeToggle(): Promise<void> {
    const id = this._resolvedEntities.chargeSession;
    if (!this.hass || !id) return;
    const next = this._isOn(id) ? "off" : "on";
    this._setOptimisticState(id, next);
    try {
      await this.hass.callService("switch", next === "on" ? "turn_on" : "turn_off", { entity_id: id });
    } catch { this._clearOptimisticState(id); }
  }

  private async _onSurplusToggle(): Promise<void> {
    const id = this._resolvedEntities.surplusMode;
    if (!this.hass || !id) return;
    const next = this._isOn(id) ? "off" : "on";
    this._setOptimisticState(id, next);
    try {
      await this.hass.callService("switch", next === "on" ? "turn_on" : "turn_off", { entity_id: id });
    } catch { this._clearOptimisticState(id); }
  }

  private async _onScheduleToggle(): Promise<void> {
    const id = this._resolvedEntities.scheduleEnabled;
    if (!this.hass || !id) return;
    const next = this._isOn(id) ? "off" : "on";
    this._setOptimisticState(id, next);
    try {
      await this.hass.callService("switch", next === "on" ? "turn_on" : "turn_off", { entity_id: id });
    } catch { this._clearOptimisticState(id); }
  }

  private async _onScheduleTimeChange(entityId: string | undefined, ev: Event): Promise<void> {
    if (!this.hass || !entityId) return;
    const value = (ev.target as HTMLInputElement).value; // "HH:MM"
    if (!value) return;
    try {
      await this.hass.callService("time", "set_value", { entity_id: entityId, value: `${value}:00` });
    } catch { /* ignore */ }
  }

  private async _onReboot(): Promise<void> {
    const id = this._resolvedEntities.reboot;
    if (!this.hass || !id) return;
    try { await this.hass.callService("button", "press", { entity_id: id }); } catch { /* ignore */ }
  }

  private async _setProfile(option: string): Promise<void> {
    const id = this._resolvedEntities.surplusProfile;
    if (!this.hass || !id) return;
    this._setOptimisticState(id, option);
    try {
      await this.hass.callService("select", "select_option", { entity_id: id, option });
    } catch { this._clearOptimisticState(id); }
  }

  private _onThresholdInput(entityId: string | undefined, ev: Event): void {
    if (!entityId) return;
    const value = parseInt((ev.target as HTMLInputElement).value, 10);
    this._sliderValues = { ...this._sliderValues, [entityId]: value };
  }

  private async _onThresholdChange(entityId: string | undefined, ev: Event): Promise<void> {
    if (!this.hass || !entityId || !this._entityExists(entityId)) return;
    const value = parseInt((ev.target as HTMLInputElement).value, 10);
    // Clear slider tracking and use optimistic state instead
    const next = { ...this._sliderValues };
    delete next[entityId];
    this._sliderValues = next;
    this._setOptimisticState(entityId, String(value));
    try {
      await this.hass.callService("number", "set_value", { entity_id: entityId, value });
    } catch { this._clearOptimisticState(entityId); }
  }

  private async _setChargeCurrent(
    value: number, minimum: number, maximum: number, allowed: number[] = []
  ): Promise<void> {
    const id = this._resolvedEntities.chargeCurrent;
    if (!this.hass || !this._entityExists(id)) return;
    const clamped = Math.max(minimum, Math.min(maximum, Math.round(value)));
    const target = allowed.length > 0
      ? allowed.filter((c) => c >= minimum && c <= maximum)
          .reduce((best, c) => Math.abs(c - clamped) < Math.abs(best - clamped) ? c : best, clamped)
      : clamped;
    this._setOptimisticState(id, String(target));
    try {
      await this.hass.callService("number", "set_value", { entity_id: id, value: target });
    } catch { this._clearOptimisticState(id); }
  }

  private _stepCurrent(
    dir: -1 | 1, current: number | null, allowed: number[],
    min: number, max: number, step: number
  ): number {
    const filtered = allowed.filter((c) => c >= min && c <= max).sort((a, b) => a - b);
    if (filtered.length > 0) {
      const cur = current ?? filtered[0];
      if (dir < 0) {
        for (let i = filtered.length - 1; i >= 0; i--) {
          if (filtered[i] < cur) return filtered[i];
        }
        return filtered[0];
      }
      for (const c of filtered) { if (c > cur) return c; }
      return filtered[filtered.length - 1];
    }
    return (current ?? min) + dir * step;
  }

  /* ─── Styles ─────────────────────────────────────────────────────────── */

  static styles = css`
    /* ── Design tokens ── */
    :host {
      --kin-primary: #8eff71;
      --kin-on-primary: #0d6100;
      --kin-secondary: #6bfe9c;
      --kin-tertiary: #69daff;
      --kin-error: #ff7351;
      --kin-surface: #0e0e0e;
      --kin-surface-low: #131313;
      --kin-surface-container: #1a1a1a;
      --kin-surface-high: #20201f;
      --kin-surface-highest: #262626;
      --kin-on-surface: #ffffff;
      --kin-on-variant: #adaaaa;
      --kin-outline: #484847;

      /* Extended theme tokens */
      --kin-gauge-track: #20201f;
      --kin-card-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
      --kin-nav-bg: rgba(19, 19, 19, 0.85);
      --kin-glow-color: rgba(142, 255, 113, 0.55);
      --kin-primary-alpha-08: rgba(142, 255, 113, 0.08);
      --kin-primary-alpha-12: rgba(142, 255, 113, 0.12);
      --kin-primary-alpha-30: rgba(142, 255, 113, 0.3);
      --kin-pulse-rgba: rgba(142, 255, 113, 0.5);

      display: block;
      font-family: 'Inter', 'Segoe UI', sans-serif;
      color: var(--kin-on-surface);
    }

    ha-card {
      background: var(--kin-surface);
      border-radius: 20px;
      overflow: hidden;
      border: none;
      box-shadow: var(--kin-card-shadow);
    }

    .pad { padding: 16px; }

    /* ── App shell ── */
    .app {
      display: flex;
      flex-direction: column;
      min-height: 560px;
    }
    .app-content {
      flex: 1;
      overflow-y: auto;
    }

    /* Material Symbols icon class */
    .mso {
      font-family: 'Material Symbols Outlined', sans-serif;
      font-weight: normal;
      font-style: normal;
      font-size: 1.25rem;
      line-height: 1;
      display: inline-block;
      vertical-align: middle;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    /* ── Dashboard ── */
    .dashboard {
      padding: 20px 20px 8px;
      display: grid;
      gap: 16px;
    }

    .dash-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .app-label {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.25em;
      color: var(--kin-primary);
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .dash-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.3rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      text-transform: uppercase;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      justify-content: flex-end;
    }

    .chip {
      border-radius: 999px;
      padding: 3px 10px;
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .chip-ok {
      background: var(--kin-primary-alpha-12);
      color: var(--kin-primary);
      border: 1px solid var(--kin-primary-alpha-30);
    }
    .chip-connected {
      background: color-mix(in srgb, var(--kin-secondary) 12%, transparent);
      color: var(--kin-secondary);
      border: 1px solid color-mix(in srgb, var(--kin-secondary) 30%, transparent);
    }
    .chip-wait {
      background: color-mix(in srgb, var(--kin-tertiary) 12%, transparent);
      color: var(--kin-tertiary);
      border: 1px solid color-mix(in srgb, var(--kin-tertiary) 30%, transparent);
    }
    .chip-error {
      background: color-mix(in srgb, var(--kin-error) 12%, transparent);
      color: var(--kin-error);
      border: 1px solid color-mix(in srgb, var(--kin-error) 30%, transparent);
    }
    .chip-off {
      background: rgba(255, 255, 255, 0.05);
      color: var(--kin-on-variant);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    /* ── Gauge ── */
    .gauge-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }

    .gauge-wrap {
      position: relative;
      width: 220px;
      height: 220px;
    }

    .gauge-svg {
      width: 100%;
      height: 100%;
    }

    .gauge-track {
      fill: none;
      stroke: var(--kin-gauge-track);
      stroke-width: 8;
    }

    .gauge-arc--glow {
      filter: drop-shadow(0 0 10px var(--kin-glow-color));
    }

    .gauge-center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .gauge-sublabel {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--kin-on-variant);
      margin-bottom: 4px;
    }

    .gauge-value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2.8rem;
      font-weight: 700;
      line-height: 1;
      color: var(--kin-primary);
      letter-spacing: -0.03em;
    }

    .gauge-unit {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.2rem;
      font-weight: 500;
      color: var(--kin-primary);
      margin-top: 2px;
    }

    /* ── Status bar ── */
    .status-bar {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--kin-surface-low);
      padding: 8px 20px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .status-bar--active    { border-color: rgba(142, 255, 113, 0.2); }
    .status-bar--connected { border-color: color-mix(in srgb, var(--kin-secondary) 30%, transparent); }
    .status-bar--wait      { border-color: color-mix(in srgb, var(--kin-tertiary)  30%, transparent); }
    .status-bar--error     { border-color: color-mix(in srgb, var(--kin-error)     30%, transparent); }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--kin-on-variant);
      flex-shrink: 0;
    }
    .status-dot--pulse     { background: var(--kin-primary);    animation: pulse-ring 1.5s ease-out infinite; }
    .status-dot--connected { background: var(--kin-secondary); }
    .status-dot--wait      { background: var(--kin-tertiary);  }
    .status-dot--error     { background: var(--kin-error);     animation: pulse-ring 1s ease-out infinite; }

    @keyframes pulse-ring {
      0%   { box-shadow: 0 0 0 0 var(--kin-pulse-rgba); }
      70%  { box-shadow: 0 0 0 7px transparent; }
      100% { box-shadow: 0 0 0 0 transparent; }
    }

    .status-label {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .status-divider {
      width: 1px;
      height: 14px;
      background: rgba(255,255,255,0.15);
    }
    .status-icon             { font-size: 1rem; color: var(--kin-secondary); }
    .status-icon--ok         { color: var(--kin-primary);   }
    .status-icon--connected  { color: var(--kin-secondary); }
    .status-icon--warn       { color: var(--kin-tertiary);  }
    .status-icon--error      { color: var(--kin-error);     }
    .status-sub {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--kin-on-variant);
    }

    /* ── Telemetry ── */
    .tele-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .tele-tile {
      background: var(--kin-surface-low);
      border-radius: 14px;
      padding: 14px 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      border: 1px solid rgba(255, 255, 255, 0.04);
    }

    .tele-icon { font-size: 1.3rem; }
    .tele-icon--tertiary { color: var(--kin-tertiary); }
    .tele-icon--secondary { color: var(--kin-secondary); }
    .tele-icon--error { color: var(--kin-error); }

    .tele-label {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--kin-on-variant);
    }

    .tele-value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.2rem;
      font-weight: 700;
      line-height: 1;
    }

    .tele-unit {
      font-size: 0.65rem;
      font-weight: 400;
      color: var(--kin-on-variant);
      margin-left: 1px;
    }

    /* ── Action buttons ── */
    .action-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .btn-action {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 10px;
      border-radius: 14px;
      border: none;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      transition: opacity 0.15s, transform 0.1s;
    }
    .btn-action:active { transform: scale(0.96); }
    .btn-action:disabled { opacity: 0.4; cursor: not-allowed; }

    .btn-pause {
      background: rgba(255, 255, 255, 0.06);
      color: var(--kin-on-surface);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .btn-pause:not(:disabled):hover { background: rgba(255,255,255,0.1); }

    .btn-emergency {
      background: #b92902;
      color: #ffd2c8;
      box-shadow: 0 6px 24px rgba(185, 41, 2, 0.3);
    }
    .btn-emergency:not(:disabled):hover { opacity: 0.9; }

    /* ── Charge current control ── */
    .current-box {
      background: var(--kin-surface-low);
      border-radius: 14px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid rgba(255, 255, 255, 0.04);
    }

    .current-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--kin-on-variant);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .current-ctrl {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-step {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.1);
      background: var(--kin-surface-highest);
      color: var(--kin-on-surface);
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.12s;
    }
    .btn-step:not(:disabled):hover { background: rgba(142, 255, 113, 0.12); }
    .btn-step:disabled { opacity: 0.4; cursor: not-allowed; }

    .current-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      min-width: 52px;
      text-align: center;
      color: var(--kin-primary);
    }

    /* ── Strategy ── */
    .strategy {
      padding: 20px 20px 8px;
      display: grid;
      gap: 16px;
    }

    .page-header { display: grid; gap: 4px; }

    .page-sup {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--kin-primary);
    }

    .page-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .strat-section {
      background: var(--kin-surface-container);
      border-radius: 16px;
      padding: 16px;
      display: grid;
      gap: 12px;
    }

    .strat-section-label {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--kin-on-variant);
    }

    .strat-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .strat-row-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .strat-icon {
      font-size: 1.4rem;
      color: var(--kin-primary);
    }

    .strat-row-title {
      font-size: 0.88rem;
      font-weight: 600;
    }

    .strat-row-sub {
      font-size: 0.72rem;
      color: var(--kin-on-variant);
    }

    /* Toggle switch */
    .toggle {
      width: 52px;
      height: 30px;
      border-radius: 999px;
      background: var(--kin-surface-highest);
      border: none;
      position: relative;
      cursor: pointer;
      transition: background 0.2s;
      flex-shrink: 0;
    }
    .toggle--on { background: var(--kin-primary); }
    .toggle:disabled { opacity: 0.4; cursor: not-allowed; }

    .toggle-thumb {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--kin-on-variant);
      transition: transform 0.2s, background 0.2s;
    }
    .toggle--on .toggle-thumb {
      transform: translateX(22px);
      background: var(--kin-on-primary);
    }

    /* Schedule time pickers */
    .schedule-times {
      display: flex;
      gap: 12px;
      margin-top: 12px;
      transition: opacity 0.2s;
    }
    .schedule-times--disabled { opacity: 0.35; pointer-events: none; }
    .schedule-time-field {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .schedule-time-label {
      font-size: 0.7rem;
      color: var(--kin-on-variant);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .schedule-time-input {
      background: var(--kin-surface-high);
      border: 1px solid var(--kin-outline);
      border-radius: 8px;
      color: var(--kin-on-surface);
      font-size: 1rem;
      font-family: inherit;
      padding: 8px 10px;
      width: 100%;
      box-sizing: border-box;
      color-scheme: dark;
    }
    .schedule-time-input:focus {
      outline: none;
      border-color: var(--kin-primary);
    }
    .schedule-time-input:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Profile grid */
    .profile-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .profile-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      padding: 14px 8px;
      border-radius: 14px;
      border: 2px solid rgba(255,255,255,0.06);
      background: var(--kin-surface-highest);
      color: var(--kin-on-variant);
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
    }
    .profile-btn--active {
      border-color: var(--kin-primary-alpha-30);
      background: var(--kin-primary-alpha-08);
      color: var(--kin-on-surface);
    }
    .profile-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .profile-icon {
      font-size: 1.2rem;
      color: inherit;
    }
    .profile-btn--active .profile-icon { color: var(--kin-primary); }

    .profile-name {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .profile-thresholds {
      font-size: 0.58rem;
      color: var(--kin-on-variant);
    }

    /* Threshold sliders */
    .threshold-block { display: grid; gap: 10px; }

    .threshold-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
    }

    .threshold-label {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--kin-on-variant);
      margin-bottom: 4px;
    }

    .threshold-value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
      color: var(--kin-on-surface);
    }
    .threshold-value--stop { color: var(--kin-error); }

    .threshold-unit {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1rem;
      font-weight: 500;
      color: var(--kin-primary);
      margin-left: 3px;
    }
    .threshold-value--stop .threshold-unit { color: var(--kin-error); }

    .threshold-right-label {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--kin-on-variant);
      padding-bottom: 2px;
    }

    /* Range inputs */
    .slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 5px;
      border-radius: 999px;
      outline: none;
      cursor: pointer;
      border: none;
      padding: 0;
    }
    .slider:disabled { opacity: 0.4; cursor: not-allowed; }

    .slider--primary {
      background: linear-gradient(
        to right,
        var(--kin-primary) var(--pct, 0%),
        var(--kin-surface-highest) var(--pct, 0%)
      );
    }
    .slider--error {
      background: linear-gradient(
        to right,
        var(--kin-error) var(--pct, 0%),
        var(--kin-surface-highest) var(--pct, 0%)
      );
    }

    .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--kin-on-surface);
      cursor: pointer;
      box-shadow: 0 2px 12px rgba(0,0,0,0.4);
      transition: transform 0.1s;
    }
    .slider:not(:disabled)::-webkit-slider-thumb:active { transform: scale(1.15); }

    .slider::-moz-range-thumb {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--kin-on-surface);
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 12px rgba(0,0,0,0.4);
    }

    /* Live status */
    .live-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .live-item {
      background: var(--kin-surface-high);
      border-radius: 12px;
      padding: 12px;
    }

    .live-item-label {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--kin-on-variant);
      margin-bottom: 5px;
    }

    .live-item-value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--kin-primary);
    }

    .live-item-value--decision {
      font-family: 'Inter', sans-serif;
      font-size: 0.72rem;
      font-weight: 500;
      color: var(--kin-on-surface);
      word-break: break-word;
    }

    /* ── Logs ── */
    .logs {
      padding: 20px 20px 8px;
      display: grid;
      gap: 16px;
    }

    .logs-section { display: grid; gap: 10px; }

    .logs-section-label {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--kin-on-variant);
    }

    /* Graph */
    .graph-wrap {
      background: var(--kin-surface-low);
      border-radius: 14px;
      padding: 10px 10px 8px;
    }

    .graph-svg {
      width: 100%;
      height: 90px;
      display: block;
    }

    .graph-empty {
      background: var(--kin-surface-low);
      border-radius: 14px;
      color: var(--kin-on-variant);
      font-size: 0.78rem;
      padding: 20px;
      text-align: center;
    }

    .graph-axis { stroke: rgba(255,255,255,0.1); stroke-width: 1; }

    .graph-line {
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .graph-line--power   { stroke: #69daff; }
    .graph-line--surplus { stroke: var(--kin-primary); }

    .graph-legend {
      display: flex;
      gap: 14px;
      margin-top: 8px;
      flex-wrap: wrap;
    }
    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.68rem;
      color: var(--kin-on-variant);
    }
    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .legend-dot--power   { background: #69daff; }
    .legend-dot--surplus { background: var(--kin-primary); }

    /* Diagnostics */
    .diag-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .diag-card {
      background: var(--kin-surface-container);
      border-radius: 14px;
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .diag-icon-wrap {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--kin-on-variant);
      flex-shrink: 0;
    }
    .diag-icon-wrap--ok   { background: rgba(142, 255, 113, 0.1); color: var(--kin-primary); }
    .diag-icon-wrap--warn { background: rgba(255, 115, 81, 0.12); color: var(--kin-error); }

    .diag-label {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--kin-on-variant);
      margin-bottom: 3px;
    }

    .diag-value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.78rem;
      font-weight: 700;
    }

    /* Debug grid */
    .debug-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .debug-item {
      background: var(--kin-surface-container);
      border-radius: 12px;
      padding: 12px;
    }

    .debug-item-label {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--kin-on-variant);
      margin-bottom: 5px;
    }

    .debug-item-value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--kin-primary);
    }

    /* Terminal log */
    .terminal {
      background: #000;
      border-radius: 14px;
      padding: 16px;
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
      border: 1px solid rgba(255,255,255,0.06);
      position: relative;
      overflow: hidden;
    }

    .terminal-icon-bg {
      position: absolute;
      top: 8px;
      right: 10px;
      opacity: 0.08;
      pointer-events: none;
      font-size: 2.5rem;
      color: var(--kin-on-surface);
    }

    .terminal-line {
      display: flex;
      gap: 10px;
      align-items: baseline;
      flex-wrap: wrap;
    }

    .terminal-ts { color: var(--kin-on-variant); flex-shrink: 0; }

    .terminal-tag {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 1px 6px;
      border-radius: 4px;
      flex-shrink: 0;
    }
    .terminal-tag--active {
      background: rgba(142, 255, 113, 0.15);
      color: var(--kin-primary);
    }

    .terminal-msg { color: var(--kin-on-surface); flex: 1; word-break: break-word; }

    .terminal-footer {
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }

    .terminal-live {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.6rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--kin-on-variant);
    }

    .terminal-live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--kin-primary);
      animation: pulse-ring 1.5s ease-out infinite;
    }

    /* ── Bottom nav ── */
    .bottom-nav {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      background: var(--kin-nav-bg);
      backdrop-filter: blur(16px);
      border-top: 1px solid rgba(255,255,255,0.06);
      padding: 10px 8px 14px;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 4px;
      border-radius: 14px;
      border: none;
      background: transparent;
      color: var(--kin-on-variant);
      cursor: pointer;
      transition: color 0.15s, background 0.15s;
    }
    .nav-item:hover { color: var(--kin-on-surface); }
    .nav-item--active {
      background: var(--kin-surface-highest);
      color: var(--kin-primary);
    }

    .nav-icon {
      font-size: 1.3rem;
      transition: color 0.15s;
    }

    .nav-label {
      font-size: 0.58rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    /* ── Minimal theme (light / blue) ── */
    :host([theme="minimal"]) {
      --kin-primary: #2563eb;
      --kin-on-primary: #ffffff;
      --kin-secondary: #0891b2;
      --kin-tertiary: #7c3aed;
      --kin-error: #dc2626;
      --kin-surface: #ffffff;
      --kin-surface-low: #f4f4f5;
      --kin-surface-container: #e4e4e7;
      --kin-surface-high: #d4d4d8;
      --kin-surface-highest: #a1a1aa;
      --kin-on-surface: #09090b;
      --kin-on-variant: #71717a;
      --kin-outline: #d4d4d8;
      --kin-gauge-track: #e4e4e7;
      --kin-card-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
      --kin-nav-bg: rgba(255, 255, 255, 0.92);
      --kin-glow-color: rgba(37, 99, 235, 0.5);
      --kin-primary-alpha-08: rgba(37, 99, 235, 0.08);
      --kin-primary-alpha-12: rgba(37, 99, 235, 0.12);
      --kin-primary-alpha-30: rgba(37, 99, 235, 0.3);
      --kin-pulse-rgba: rgba(37, 99, 235, 0.5);
      font-family: 'Inter', system-ui, sans-serif;
    }
    :host([theme="minimal"]) .schedule-time-input { color-scheme: light; }

    /* ── Ocean theme (dark blue / cyan) ── */
    :host([theme="ocean"]) {
      --kin-primary: #00e5ff;
      --kin-on-primary: #003040;
      --kin-secondary: #40c9ff;
      --kin-tertiary: #a78bfa;
      --kin-error: #ff7351;
      --kin-surface: #020f1a;
      --kin-surface-low: #061524;
      --kin-surface-container: #0a1e35;
      --kin-surface-high: #0d2645;
      --kin-surface-highest: #113050;
      --kin-on-surface: #e0f4ff;
      --kin-on-variant: #7ec8e3;
      --kin-outline: #1e4060;
      --kin-gauge-track: #0d2645;
      --kin-card-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
      --kin-nav-bg: rgba(2, 15, 26, 0.9);
      --kin-glow-color: rgba(0, 229, 255, 0.55);
      --kin-primary-alpha-08: rgba(0, 229, 255, 0.08);
      --kin-primary-alpha-12: rgba(0, 229, 255, 0.12);
      --kin-primary-alpha-30: rgba(0, 229, 255, 0.3);
      --kin-pulse-rgba: rgba(0, 229, 255, 0.5);
    }

    /* ── Solar Amber theme (charcoal / amber) ── */
    :host([theme="solar-amber"]) {
      --kin-primary: #FFBF00;
      --kin-on-primary: #1D1B19;
      --kin-secondary: #FFD54F;
      --kin-tertiary: #FF9800;
      --kin-error: #FF5252;
      --kin-surface: #1D1B19;
      --kin-surface-low: #232119;
      --kin-surface-container: #2A2720;
      --kin-surface-high: #332F26;
      --kin-surface-highest: #3D382D;
      --kin-on-surface: #F5F0E8;
      --kin-on-variant: #B5A882;
      --kin-outline: #4D4535;
      --kin-gauge-track: #332F26;
      --kin-card-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
      --kin-nav-bg: rgba(29, 27, 25, 0.92);
      --kin-glow-color: rgba(255, 191, 0, 0.55);
      --kin-primary-alpha-08: rgba(255, 191, 0, 0.08);
      --kin-primary-alpha-12: rgba(255, 191, 0, 0.12);
      --kin-primary-alpha-30: rgba(255, 191, 0, 0.3);
      --kin-pulse-rgba: rgba(255, 191, 0, 0.5);
      font-family: 'Manrope', 'Inter', sans-serif;
    }
    :host([theme="solar-amber"]) .tele-tile {
      background: radial-gradient(ellipse at top, rgba(255, 191, 0, 0.1) 0%, var(--kin-surface-low) 70%);
    }
    :host([theme="solar-amber"]) .gauge-section::before {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at center, rgba(255, 191, 0, 0.06) 0%, transparent 70%);
      pointer-events: none;
    }
    :host([theme="solar-amber"]) .gauge-section { position: relative; }
    :host([theme="solar-amber"]) .strat-section {
      background: linear-gradient(135deg, var(--kin-surface-container) 0%, rgba(61, 56, 45, 0.4) 100%);
    }

    /* ── Arctic Flow theme (night blue / cyan glassmorphism) ── */
    :host([theme="arctic-flow"]) {
      --kin-primary: #00E5FF;
      --kin-on-primary: #002030;
      --kin-secondary: #40C9FF;
      --kin-tertiary: #7986CB;
      --kin-error: #FF5252;
      --kin-surface: #050D1A;
      --kin-surface-low: #071222;
      --kin-surface-container: rgba(10, 25, 50, 0.55);
      --kin-surface-high: #0D2140;
      --kin-surface-highest: #122A50;
      --kin-on-surface: #E8F4FF;
      --kin-on-variant: #7EC8E3;
      --kin-outline: rgba(255, 255, 255, 0.1);
      --kin-gauge-track: #0D2140;
      --kin-card-shadow: 0 12px 60px rgba(0, 229, 255, 0.1);
      --kin-nav-bg: rgba(5, 13, 26, 0.88);
      --kin-glow-color: rgba(0, 229, 255, 0.6);
      --kin-primary-alpha-08: rgba(0, 229, 255, 0.08);
      --kin-primary-alpha-12: rgba(0, 229, 255, 0.12);
      --kin-primary-alpha-30: rgba(0, 229, 255, 0.3);
      --kin-pulse-rgba: rgba(0, 229, 255, 0.5);
      font-family: 'Space Grotesk', sans-serif;
    }
    :host([theme="arctic-flow"]) .strat-section,
    :host([theme="arctic-flow"]) .tele-tile,
    :host([theme="arctic-flow"]) .current-box,
    :host([theme="arctic-flow"]) .diag-card,
    :host([theme="arctic-flow"]) .debug-item,
    :host([theme="arctic-flow"]) .live-item {
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    :host([theme="arctic-flow"]) .tele-icon--tertiary,
    :host([theme="arctic-flow"]) .tele-icon--secondary { text-shadow: 0 0 12px #00E5FF; }
    :host([theme="arctic-flow"]) .status-bar--active {
      box-shadow: 0 0 24px rgba(0, 229, 255, 0.15);
      border-color: rgba(0, 229, 255, 0.25);
    }
    :host([theme="arctic-flow"]) .nav-item--active {
      box-shadow: 0 0 12px rgba(0, 229, 255, 0.2);
    }

    /* ── Deep Mono theme (noir / blanc / serif) ── */
    :host([theme="deep-mono"]) {
      --kin-primary: #FFFFFF;
      --kin-on-primary: #000000;
      --kin-secondary: #E0E0E0;
      --kin-tertiary: #BDBDBD;
      --kin-error: #FF1744;
      --kin-surface: #000000;
      --kin-surface-low: #080808;
      --kin-surface-container: #0F0F0F;
      --kin-surface-high: #1A1A1A;
      --kin-surface-highest: #2A2A2A;
      --kin-on-surface: #FFFFFF;
      --kin-on-variant: #9E9E9E;
      --kin-outline: rgba(255, 255, 255, 0.18);
      --kin-gauge-track: #1A1A1A;
      --kin-card-shadow: none;
      --kin-nav-bg: #000000;
      --kin-glow-color: rgba(255, 255, 255, 0);
      --kin-primary-alpha-08: rgba(255, 255, 255, 0.06);
      --kin-primary-alpha-12: rgba(255, 255, 255, 0.10);
      --kin-primary-alpha-30: rgba(255, 255, 255, 0.25);
      --kin-pulse-rgba: rgba(255, 255, 255, 0.4);
      font-family: 'Inter', sans-serif;
    }
    :host([theme="deep-mono"]) .page-title,
    :host([theme="deep-mono"]) .dash-title {
      font-family: 'Noto Serif', Georgia, serif;
      font-weight: 400;
      letter-spacing: 0.01em;
    }
    :host([theme="deep-mono"]) .gauge-value {
      font-family: 'Noto Serif', Georgia, serif;
      font-weight: 700;
    }
    :host([theme="deep-mono"]) .strat-section,
    :host([theme="deep-mono"]) .tele-tile,
    :host([theme="deep-mono"]) .current-box,
    :host([theme="deep-mono"]) .diag-card,
    :host([theme="deep-mono"]) .debug-item,
    :host([theme="deep-mono"]) .live-item {
      background: transparent;
      border: 0.5px solid rgba(255, 255, 255, 0.18);
      box-shadow: none;
    }
    :host([theme="deep-mono"]) .btn-action,
    :host([theme="deep-mono"]) .btn-emergency { box-shadow: none; }
    :host([theme="deep-mono"]) .gauge-arc--glow { filter: none; }
    :host([theme="deep-mono"]) .bottom-nav { border-top: 0.5px solid rgba(255, 255, 255, 0.18); }

    /* ── Responsive ── */
    @media (max-width: 380px) {
      .tele-grid, .action-grid { grid-template-columns: 1fr; }
      .profile-grid { grid-template-columns: repeat(3, 1fr); }
      .diag-row, .debug-grid, .live-grid { grid-template-columns: 1fr; }
    }
  `;
}

customElements.define("tuya-ev-charger-card", TuyaEvChargerCard);

/* ─── Editor ─────────────────────────────────────────────────────────────── */

type EntityFieldKey = keyof NonNullable<CardConfig["entities"]>;

type EntityFieldSpec = {
  key: EntityFieldKey;
  label: string;
  domain: string;
  suffixes: string[];
};

const ENTITY_FIELD_SPECS: EntityFieldSpec[] = [
  { key: "charge_session",            label: "Charge session switch",         domain: "switch",        suffixes: ["charge_session"] },
  { key: "surplus_mode",              label: "Surplus mode switch",            domain: "switch",        suffixes: ["surplus_mode"] },
  { key: "surplus_profile",           label: "Surplus profile select",         domain: "select",        suffixes: ["surplus_profile"] },
  { key: "charge_current",            label: "Charge current number",          domain: "number",        suffixes: ["charge_current"] },
  { key: "surplus_start_threshold",   label: "Start threshold number",         domain: "number",        suffixes: ["surplus_start_threshold_w"] },
  { key: "surplus_stop_threshold",    label: "Stop threshold number",          domain: "number",        suffixes: ["surplus_stop_threshold_w"] },
  { key: "schedule_enabled",          label: "Schedule switch",                domain: "switch",        suffixes: ["schedule_enabled"] },
  { key: "schedule_start",            label: "Schedule start time",            domain: "time",          suffixes: ["schedule_start"] },
  { key: "schedule_end",              label: "Schedule end time",              domain: "time",          suffixes: ["schedule_end"] },
  { key: "power",                     label: "Power sensor",                   domain: "sensor",        suffixes: ["power_l1"] },
  { key: "current",                   label: "Current sensor",                 domain: "sensor",        suffixes: ["current_l1"] },
  { key: "voltage",                   label: "Voltage sensor",                 domain: "sensor",        suffixes: ["voltage_l1"] },
  { key: "temperature",               label: "Temperature sensor",             domain: "sensor",        suffixes: ["temperature"] },
  { key: "work_state",                label: "Work state sensor",              domain: "sensor",        suffixes: ["work_state"] },
  { key: "selftest",                  label: "Self-test sensor",               domain: "sensor",        suffixes: ["selftest"] },
  { key: "alarm",                     label: "Alarm sensor",                   domain: "sensor",        suffixes: ["alarm"] },
  { key: "last_decision",             label: "Last decision sensor",           domain: "sensor",        suffixes: ["surplus_last_decision_reason"] },
  { key: "surplus_effective",         label: "Effective surplus sensor",       domain: "sensor",        suffixes: ["surplus_effective_w"] },
  { key: "surplus_raw",               label: "Raw surplus sensor",             domain: "sensor",        suffixes: ["surplus_raw_w"] },
  { key: "surplus_discharge_over_limit", label: "Battery over-limit sensor",  domain: "sensor",        suffixes: ["surplus_battery_discharge_over_limit_w"] },
  { key: "surplus_target_current",    label: "Target current sensor",          domain: "sensor",        suffixes: ["surplus_target_current_a"] },
  { key: "regulation_active",         label: "Regulation active binary sensor", domain: "binary_sensor", suffixes: ["surplus_regulation_active"] },
  { key: "reboot",                    label: "Reboot button",                  domain: "button",        suffixes: ["reboot_charger"] },
];

const normalizeToken = (input?: string): string =>
  String(input ?? "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");

const ENTITY_FIELD_KEY_SET = new Set<string>(ENTITY_FIELD_SPECS.map((f) => f.key));

type EditorStateIndex = {
  all: string[];
  byDomain: Map<string, string[]>;
  byRole: Map<EntityFieldKey, string[]>;
  rolesByToken: Map<string, Set<EntityFieldKey>>;
};

class TuyaEvChargerCardEditor extends LitElement {
  public hass?: HomeAssistant;
  private _config: CardConfig = TuyaEvChargerCard.getStubConfig();
  private _stateIndexCache = new WeakMap<Record<string, HassEntity>, EditorStateIndex>();

  static properties = {
    hass: { attribute: false },
    _config: { attribute: false, state: true },
  };

  public setConfig(config: CardConfig): void {
    this._config = {
      ...TuyaEvChargerCard.getStubConfig(),
      ...config,
      entities: { ...(config.entities ?? {}) },
    };
  }

  protected render() {
    const cfg = this._config;
    const entities = cfg.entities ?? {};
    const detectedTokens = this._detectedChargerTokens();
    const selectedToken = normalizeToken(cfg.charger_name);

    return html`
      <div class="editor">
        <h3>Layout</h3>
        <label>
          <span>Card title</span>
          <input
            type="text"
            .value=${cfg.title ?? ""}
            @input=${(e: Event) =>
              this._updateRootText("title", (e.target as HTMLInputElement).value)}
          />
        </label>
        <label>
          <span>Theme</span>
          <select
            .value=${cfg.theme ?? "kinetic"}
            @change=${(e: Event) =>
              this._fireConfigChanged({ ...cfg, theme: (e.target as HTMLSelectElement).value as ThemeId })}
          >
            <option value="kinetic">Kinetic — dark, neon green</option>
            <option value="solar-amber">Solar Amber — charbon, ambre chaud</option>
            <option value="arctic-flow">Arctic Flow — nuit bleue, glassmorphism cyan</option>
            <option value="deep-mono">Deep Mono — noir absolu, blanc pur, serif</option>
            <option value="ocean">Ocean — dark blue, cyan</option>
            <option value="minimal">Minimal — light, bleu</option>
          </select>
        </label>
        <label>
          <span>Detected EV Charger instance</span>
          <div class="inline">
            <select
              .value=${selectedToken}
              @change=${(e: Event) =>
                this._autoFillFromToken((e.target as HTMLSelectElement).value)}
            >
              <option value="">Select…</option>
              ${detectedTokens.map(
                (t) => html`<option value=${t}>${t}</option>`
              )}
            </select>
            ${selectedToken
              ? html`<button @click=${this._clearAutoFill}>Clear</button>`
              : nothing}
          </div>
        </label>

        <h3>Entities</h3>
        ${ENTITY_FIELD_SPECS.map((spec) => {
          const value = (entities as Record<string, string | undefined>)[spec.key] ?? "";
          const suggestions = this._suggestionsForField(spec, selectedToken);
          return html`
            <label>
              <span>${spec.label}</span>
              <input
                type="text"
                .value=${value}
                list="suggestions-${spec.key}"
                @input=${(e: Event) =>
                  this._updateEntityField(spec.key, (e.target as HTMLInputElement).value)}
                placeholder=${suggestions[0] ?? `${spec.domain}.*`}
              />
              <datalist id="suggestions-${spec.key}">
                ${suggestions.map((s) => html`<option value=${s}></option>`)}
              </datalist>
            </label>
          `;
        })}
      </div>
    `;
  }

  private _detectedChargerTokens(): string[] {
    if (!this.hass) return [];
    const idx = this._stateIndex();
    return [...idx.rolesByToken.keys()].sort();
  }

  private _stateIndex(): EditorStateIndex {
    if (!this.hass) {
      return { all: [], byDomain: new Map(), byRole: new Map(), rolesByToken: new Map() };
    }
    const states = this.hass.states;
    if (this._stateIndexCache.has(states)) {
      return this._stateIndexCache.get(states)!;
    }
    const all = Object.keys(states);
    const byDomain = new Map<string, string[]>();
    const byRole = new Map<EntityFieldKey, string[]>();
    const rolesByToken = new Map<string, Set<EntityFieldKey>>();

    for (const id of all) {
      const domain = id.split(".")[0];
      const existing = byDomain.get(domain) ?? [];
      existing.push(id);
      byDomain.set(domain, existing);

      const attrs = states[id].attributes;
      const role = attrs[ATTR_CARD_ROLE] as string | undefined;
      const token = attrs[ATTR_CHARGER_TOKEN] as string | undefined;

      if (role && ENTITY_FIELD_KEY_SET.has(role)) {
        const rKey = role as EntityFieldKey;
        const rList = byRole.get(rKey) ?? [];
        rList.push(id);
        byRole.set(rKey, rList);

        if (token) {
          const tokenSet = rolesByToken.get(token) ?? new Set();
          tokenSet.add(rKey);
          rolesByToken.set(token, tokenSet);
        }
      }
    }

    const idx: EditorStateIndex = { all, byDomain, byRole, rolesByToken };
    this._stateIndexCache.set(states, idx);
    return idx;
  }

  private _suggestionsForField(spec: EntityFieldSpec, token: string): string[] {
    if (!this.hass) return [];
    const idx = this._stateIndex();
    const fromRole = idx.byRole.get(spec.key) ?? [];
    const fromDomain = idx.byDomain.get(spec.domain) ?? [];
    const fromSuffix = token
      ? spec.suffixes.map((s) => `${spec.domain}.${token}_${s}`).filter((id) => this.hass!.states[id])
      : [];
    return [...new Set([...fromSuffix, ...fromRole, ...fromDomain])].slice(0, 8);
  }

  private _autoFillFromToken(token: string): void {
    if (!token || !this.hass) {
      this._updateRootText("charger_name", "");
      return;
    }
    this._updateRootText("charger_name", token);
    const newEntities = { ...(this._config.entities ?? {}) };
    for (const spec of ENTITY_FIELD_SPECS) {
      for (const suffix of spec.suffixes) {
        const candidate = `${spec.domain}.${token}_${suffix}`;
        if (this.hass.states[candidate]) {
          (newEntities as Record<string, string>)[spec.key] = candidate;
          break;
        }
      }
    }
    this._fireConfigChanged({ ...this._config, charger_name: token, entities: newEntities });
  }

  private _clearAutoFill(): void {
    this._fireConfigChanged({ ...this._config, charger_name: undefined, entities: {} });
  }

  private _updateRootText(key: keyof CardConfig, value: string): void {
    this._fireConfigChanged({ ...this._config, [key]: value || undefined });
  }

  private _updateEntityField(key: EntityFieldKey, value: string): void {
    const entities = { ...(this._config.entities ?? {}), [key]: value || undefined };
    this._fireConfigChanged({ ...this._config, entities });
  }

  private _fireConfigChanged(config: CardConfig): void {
    this._config = config;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }

  static styles = css`
    .editor { display: grid; gap: 10px; padding: 8px 0; }
    h3 { margin: 8px 0 2px; font-size: 0.85rem; font-weight: 600; color: var(--secondary-text-color); }
    label { display: grid; gap: 4px; font-size: 0.82rem; }
    label span { color: var(--secondary-text-color); font-size: 0.78rem; }
    input, select {
      width: 100%;
      padding: 6px 10px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 0.85rem;
      box-sizing: border-box;
    }
    .inline { display: flex; gap: 6px; }
    .inline select { flex: 1; }
    .inline button {
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid var(--divider-color);
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 0.8rem;
      white-space: nowrap;
    }
  `;
}

customElements.define("tuya-ev-charger-card-editor", TuyaEvChargerCardEditor);
