import { LitElement, css, html, nothing } from "lit";

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
}

interface CardConfig {
  type: string;
  title?: string;
  charger_name?: string;
  graph_points?: number;
  entities?: {
    power?: string;
    current?: string;
    charge_current?: string;
    charge_session?: string;
    surplus_mode?: string;
    surplus_profile?: string;
    regulation_active?: string;
    last_decision?: string;
    surplus_raw?: string;
    surplus_effective?: string;
    surplus_discharge_over_limit?: string;
    surplus_target_current?: string;
  };
}

interface ResolvedEntities {
  power?: string;
  current?: string;
  chargeCurrent?: string;
  chargeSession?: string;
  surplusMode?: string;
  surplusProfile?: string;
  regulationActive?: string;
  lastDecision?: string;
  surplusRaw?: string;
  surplusEffective?: string;
  surplusDischargeOverLimit?: string;
  surplusTargetCurrent?: string;
}

interface GraphSample {
  ts: number;
  powerW: number | null;
  surplusW: number | null;
}

const PROFILE_OPTIONS = ["eco", "balanced", "fast"] as const;
const ATTR_CARD_ROLE = "tuya_ev_charger_card_role";
const ATTR_CARD_INDEX = "tuya_ev_charger_card_index";
const ATTR_CHARGER_TOKEN = "tuya_ev_charger_token";

class TuyaEvChargerCard extends LitElement {
  public hass?: HomeAssistant;

  private _config?: CardConfig;
  private _detailsOpen = false;
  private _debugOpen = false;
  private _graphHistory: GraphSample[] = [];
  private _resolvedEntities: ResolvedEntities = {};

  static properties = {
    hass: { attribute: false },
    _config: { attribute: false, state: true },
    _detailsOpen: { state: true },
    _debugOpen: { state: true },
    _graphHistory: { state: true },
    _resolvedEntities: { state: true },
  };

  public static getStubConfig(): CardConfig {
    return {
      type: "custom:tuya-ev-charger-card",
      title: "EV Charger",
    };
  }

  public static getConfigElement(): HTMLElement {
    return document.createElement("tuya-ev-charger-card-editor");
  }

  public setConfig(config: CardConfig): void {
    if (!config || config.type !== "custom:tuya-ev-charger-card") {
      throw new Error("Invalid card configuration.");
    }
    this._config = config;
  }

  protected shouldUpdate(changed: Map<string, unknown>): boolean {
    if (changed.has("hass")) {
      this._resolveEntities();
      this._appendGraphSample();
    }
    return true;
  }

  protected render() {
    if (!this._config || !this.hass) {
      return html`<ha-card><div class="pad">Card not ready.</div></ha-card>`;
    }

    const title = this._config.title ?? "Tuya EV Charger";
    const chargeOn = this._isOn(this._resolvedEntities.chargeSession);
    const surplusOn = this._isOn(this._resolvedEntities.surplusMode);
    const regulationOn = this._isOn(this._resolvedEntities.regulationActive);

    const powerW = this._powerW(this._resolvedEntities.power);
    const currentA = this._numberState(this._resolvedEntities.current);
    const targetA = this._numberState(this._resolvedEntities.surplusTargetCurrent);
    const profile = this._state(this._resolvedEntities.surplusProfile) ?? "balanced";

    const lastDecision =
      this._state(this._resolvedEntities.lastDecision) ?? "unavailable";
    const rawSurplusW = this._powerW(this._resolvedEntities.surplusRaw);
    const effectiveSurplusW = this._powerW(this._resolvedEntities.surplusEffective);
    const dischargeOverLimitW = this._powerW(
      this._resolvedEntities.surplusDischargeOverLimit
    );

    const chargeCurrentEntity = this._entity(this._resolvedEntities.chargeCurrent);
    const chargeCurrentSetpoint = this._numberState(this._resolvedEntities.chargeCurrent);
    const allowedCurrents = this._allowedCurrents(chargeCurrentEntity);
    const currentMin =
      this._attrNumber(chargeCurrentEntity, "min") ??
      this._attrNumber(chargeCurrentEntity, "native_min_value") ??
      6;
    const currentMax =
      this._attrNumber(chargeCurrentEntity, "max") ??
      this._attrNumber(chargeCurrentEntity, "native_max_value") ??
      16;
    const currentStep =
      this._attrNumber(chargeCurrentEntity, "step") ??
      this._attrNumber(chargeCurrentEntity, "native_step") ??
      1;

    return html`
      <ha-card>
        <div class="card">
          <div class="header">
            <div>
              <div class="title">${title}</div>
              <div class="subtitle">Tuya EV Charger Local</div>
            </div>
            <div class="chips">
              <span class="chip ${chargeOn ? "ok" : "off"}"
                >${chargeOn ? "Charging" : "Idle"}</span
              >
              <span class="chip ${surplusOn ? "ok" : "off"}"
                >${surplusOn ? "Surplus" : "Manual"}</span
              >
              <span class="chip ${regulationOn ? "ok" : "off"}"
                >${regulationOn ? "Regulating" : "Hold"}</span
              >
            </div>
          </div>

          <div class="metrics">
            ${this._metric("Power", this._formatPower(powerW))}
            ${this._metric("Current", this._formatAmp(currentA))}
            ${this._metric("Target", this._formatAmp(targetA))}
          </div>

          ${this._renderGraph()}

          <div class="controls">
            <button
              class="btn primary"
              @click=${this._onChargeSessionToggle}
              ?disabled=${!this._resolvedEntities.chargeSession}
            >
              ${chargeOn ? "Stop" : "Start"}
            </button>
            <button
              class="btn"
              @click=${this._onSurplusModeToggle}
              ?disabled=${!this._resolvedEntities.surplusMode}
            >
              ${surplusOn ? "Surplus On" : "Surplus Off"}
            </button>
          </div>

          <div class="current-box">
            <button
              class="btn tiny"
              @click=${() => {
                const target = this._stepChargeCurrent(
                  -1,
                  chargeCurrentSetpoint,
                  allowedCurrents,
                  currentMin,
                  currentMax,
                  currentStep
                );
                this._setChargeCurrent(target, currentMin, currentMax, allowedCurrents);
              }}
              ?disabled=${!this._resolvedEntities.chargeCurrent}
            >
              -
            </button>
            <div class="current-value">${this._formatAmp(chargeCurrentSetpoint)}</div>
            <button
              class="btn tiny"
              @click=${() => {
                const target = this._stepChargeCurrent(
                  1,
                  chargeCurrentSetpoint,
                  allowedCurrents,
                  currentMin,
                  currentMax,
                  currentStep
                );
                this._setChargeCurrent(target, currentMin, currentMax, allowedCurrents);
              }}
              ?disabled=${!this._resolvedEntities.chargeCurrent}
            >
              +
            </button>
          </div>

          <div class="profiles">
            ${PROFILE_OPTIONS.map(
              (option) => html`
                <button
                  class="profile ${profile === option ? "active" : ""}"
                  @click=${() => this._setProfile(option)}
                  ?disabled=${!this._resolvedEntities.surplusProfile}
                >
                  ${option}
                </button>
              `
            )}
          </div>

          <button class="details-toggle" @click=${this._toggleDetails}>
            ${this._detailsOpen ? "Hide details" : "Show details"}
          </button>

          ${this._detailsOpen
            ? html`
                <div class="details">
                  <div class="detail-row">
                    <span>Last decision</span>
                    <strong>${lastDecision}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Surplus effective</span>
                    <strong>${this._formatPower(effectiveSurplusW)}</strong>
                  </div>
                  <button class="debug-toggle" @click=${this._toggleDebug}>
                    ${this._debugOpen ? "Hide debug" : "Show debug"}
                  </button>
                  ${this._debugOpen
                    ? html`
                        <div class="debug-grid">
                          ${this._debugValue("Raw surplus", this._formatPower(rawSurplusW))}
                          ${this._debugValue(
                            "Effective surplus",
                            this._formatPower(effectiveSurplusW)
                          )}
                          ${this._debugValue(
                            "Battery over limit",
                            this._formatPower(dischargeOverLimitW)
                          )}
                          ${this._debugValue(
                            "Target current",
                            this._formatAmp(targetA)
                          )}
                        </div>
                      `
                    : nothing}
                </div>
              `
            : nothing}
        </div>
      </ha-card>
    `;
  }

  private _renderGraph() {
    const points = this._graphHistory;
    if (points.length < 2) {
      return html`<div class="graph-empty">Collecting graph samples...</div>`;
    }
    const width = 360;
    const height = 90;

    const allValues = points.flatMap((sample) =>
      [sample.powerW, sample.surplusW].filter((v): v is number => v !== null)
    );
    const maxAbs = Math.max(500, ...allValues.map((v) => Math.abs(v)));
    const min = -maxAbs;
    const max = maxAbs;

    const powerPath = this._buildPath(
      points.map((sample) => sample.powerW),
      min,
      max,
      width,
      height
    );
    const surplusPath = this._buildPath(
      points.map((sample) => sample.surplusW),
      min,
      max,
      width,
      height
    );
    const zeroY = this._scaleY(0, min, max, height);

    return html`
      <div class="graph-wrap">
        <svg
          class="graph"
          viewBox="0 0 ${width} ${height}"
          preserveAspectRatio="none"
          aria-label="Power and surplus graph"
        >
          <line x1="0" y1="${zeroY}" x2="${width}" y2="${zeroY}" class="axis"></line>
          <path d="${powerPath}" class="line power"></path>
          <path d="${surplusPath}" class="line surplus"></path>
        </svg>
        <div class="legend">
          <span class="leg"><i class="dot power"></i>Grid+EV power</span>
          <span class="leg"><i class="dot surplus"></i>Effective surplus</span>
        </div>
      </div>
    `;
  }

  private _metric(label: string, value: string) {
    return html`<div class="metric"><span>${label}</span><strong>${value}</strong></div>`;
  }

  private _debugValue(label: string, value: string) {
    return html`<div class="debug-item"><span>${label}</span><strong>${value}</strong></div>`;
  }

  private _resolveEntities() {
    if (!this._config || !this.hass) {
      return;
    }
    const token = this._normalizeToken(this._config.charger_name);
    const cfg = this._config.entities ?? {};
    this._resolvedEntities = {
      power:
        cfg.power ??
        this._findEntity("sensor", ["power_l1"], token, "power"),
      current:
        cfg.current ??
        this._findEntity("sensor", ["current_l1"], token, "current"),
      chargeCurrent:
        cfg.charge_current ??
        this._findEntity("number", ["charge_current"], token, "charge_current"),
      chargeSession:
        cfg.charge_session ??
        this._findEntity("switch", ["charge_session"], token, "charge_session"),
      surplusMode:
        cfg.surplus_mode ??
        this._findEntity("switch", ["surplus_mode"], token, "surplus_mode"),
      surplusProfile:
        cfg.surplus_profile ??
        this._findEntity("select", ["surplus_profile"], token, "surplus_profile"),
      regulationActive:
        cfg.regulation_active ??
        this._findEntity(
          "binary_sensor",
          ["surplus_regulation_active"],
          token,
          "regulation_active"
        ),
      lastDecision:
        cfg.last_decision ??
        this._findEntity(
          "sensor",
          ["surplus_last_decision_reason"],
          token,
          "last_decision"
        ),
      surplusRaw:
        cfg.surplus_raw ??
        this._findEntity("sensor", ["surplus_raw_w"], token, "surplus_raw"),
      surplusEffective:
        cfg.surplus_effective ??
        this._findEntity("sensor", ["surplus_effective_w"], token, "surplus_effective"),
      surplusDischargeOverLimit:
        cfg.surplus_discharge_over_limit ??
        this._findEntity(
          "sensor",
          ["surplus_battery_discharge_over_limit_w"],
          token,
          "surplus_discharge_over_limit"
        ),
      surplusTargetCurrent:
        cfg.surplus_target_current ??
        this._findEntity(
          "sensor",
          ["surplus_target_current_a"],
          token,
          "surplus_target_current"
        ),
    };
  }

  private _findEntity(
    domain: string,
    suffixes: string[],
    preferToken: string,
    role: string
  ): string | undefined {
    if (!this.hass) {
      return undefined;
    }
    const all = Object.keys(this.hass.states)
      .filter((entityId) => entityId.startsWith(`${domain}.`))
      .sort();
    const roleMatches = all.filter((entityId) => this._entityRole(entityId) === role);
    const rankedByRole = this._rankCandidates(roleMatches, preferToken);
    if (rankedByRole.length) {
      return rankedByRole[0];
    }

    const suffixMatches = all.filter((entityId) =>
      suffixes.some((suffix) => entityId.endsWith(`_${suffix}`) || entityId.endsWith(suffix))
    );
    if (!suffixMatches.length) {
      return undefined;
    }
    const rankedBySuffix = this._rankCandidates(suffixMatches, preferToken);
    if (rankedBySuffix.length) {
      return rankedBySuffix[0];
    }
    return undefined;
  }

  private _entityRole(entityId: string): string {
    const entity = this._entity(entityId);
    return String(entity?.attributes[ATTR_CARD_ROLE] ?? "").trim();
  }

  private _entityToken(entityId: string): string {
    const entity = this._entity(entityId);
    return this._normalizeToken(String(entity?.attributes[ATTR_CHARGER_TOKEN] ?? ""));
  }

  private _entityIndex(entityId: string): number {
    const entity = this._entity(entityId);
    const parsed = Number(entity?.attributes[ATTR_CARD_INDEX]);
    return Number.isFinite(parsed) ? parsed : 9999;
  }

  private _rankCandidates(entityIds: string[], preferToken: string): string[] {
    const ranked = entityIds.slice().sort((a, b) => {
      const scoreDiff =
        this._tokenMatchScore(a, preferToken) - this._tokenMatchScore(b, preferToken);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
      const indexDiff = this._entityIndex(a) - this._entityIndex(b);
      if (indexDiff !== 0) {
        return indexDiff;
      }
      return a.localeCompare(b);
    });
    if (!preferToken) {
      return ranked;
    }
    const strict = ranked.filter(
      (entityId) => this._tokenMatchScore(entityId, preferToken) <= 1
    );
    return strict.length ? strict : ranked;
  }

  private _tokenMatchScore(entityId: string, token: string): number {
    if (!token) {
      return 1;
    }
    const technicalToken = this._entityToken(entityId);
    if (technicalToken && technicalToken === token) {
      return 0;
    }
    const objectId = this._normalizeToken(entityId.split(".")[1] ?? "");
    if (objectId === token || objectId.startsWith(`${token}_`)) {
      return 1;
    }
    if (objectId.includes(token)) {
      return 2;
    }
    return 3;
  }

  private _normalizeToken(input?: string): string {
    return String(input ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_");
  }

  private _appendGraphSample() {
    if (!this.hass) {
      return;
    }
    const powerW = this._powerW(this._resolvedEntities.power);
    const surplusW = this._powerW(this._resolvedEntities.surplusEffective);
    const now = Date.now();
    const next: GraphSample = { ts: now, powerW, surplusW };
    const maxPoints = Math.max(20, Number(this._config?.graph_points ?? 36));
    const history = [...this._graphHistory, next];
    this._graphHistory = history.slice(-maxPoints);
  }

  private _buildPath(
    values: Array<number | null>,
    min: number,
    max: number,
    width: number,
    height: number
  ): string {
    const step = width / Math.max(1, values.length - 1);
    let path = "";
    values.forEach((value, i) => {
      if (value === null) {
        return;
      }
      const x = i * step;
      const y = this._scaleY(value, min, max, height);
      path += path ? ` L ${x.toFixed(2)} ${y.toFixed(2)}` : `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    });
    return path;
  }

  private _scaleY(
    value: number,
    min: number,
    max: number,
    height: number
  ): number {
    if (max <= min) {
      return height / 2;
    }
    const ratio = (value - min) / (max - min);
    return height - ratio * height;
  }

  private _entity(entityId?: string): HassEntity | undefined {
    if (!entityId || !this.hass) {
      return undefined;
    }
    return this.hass.states[entityId];
  }

  private _state(entityId?: string): string | undefined {
    return this._entity(entityId)?.state;
  }

  private _isOn(entityId?: string): boolean {
    return this._state(entityId) === "on";
  }

  private _numberState(entityId?: string): number | null {
    const state = this._state(entityId);
    if (state === undefined || state === "unknown" || state === "unavailable") {
      return null;
    }
    const parsed = Number(state);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private _powerW(entityId?: string): number | null {
    const entity = this._entity(entityId);
    if (!entity) {
      return null;
    }
    const parsed = this._numberState(entityId);
    if (parsed === null) {
      return null;
    }
    const unit = String(
      entity.attributes.unit_of_measurement ?? entity.attributes.native_unit_of_measurement ?? ""
    )
      .trim()
      .toLowerCase();
    if (unit === "kw") {
      return parsed * 1000;
    }
    return parsed;
  }

  private _attrNumber(entity: HassEntity | undefined, key: string): number | null {
    if (!entity) {
      return null;
    }
    const raw = entity.attributes[key];
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private _allowedCurrents(entity: HassEntity | undefined): number[] {
    if (!entity) {
      return [];
    }

    const rawValues = [
      entity.attributes.allowed_currents,
      entity.attributes.available_currents,
      entity.attributes.adjust_current_options,
    ];

    const parsed: number[] = [];
    for (const raw of rawValues) {
      if (Array.isArray(raw)) {
        for (const value of raw) {
          const numberValue = Number(value);
          if (Number.isFinite(numberValue)) {
            parsed.push(Math.round(numberValue));
          }
        }
        continue;
      }
      if (typeof raw === "string") {
        for (const chunk of raw.split(",")) {
          const numberValue = Number(chunk.trim());
          if (Number.isFinite(numberValue)) {
            parsed.push(Math.round(numberValue));
          }
        }
      }
    }

    return [...new Set(parsed)].filter((value) => value > 0).sort((a, b) => a - b);
  }

  private _formatPower(valueW: number | null): string {
    if (valueW === null) {
      return "--";
    }
    const abs = Math.abs(valueW);
    if (abs >= 1000) {
      return `${(valueW / 1000).toFixed(2)} kW`;
    }
    return `${Math.round(valueW)} W`;
  }

  private _formatAmp(valueA: number | null): string {
    if (valueA === null) {
      return "--";
    }
    return `${Math.round(valueA)} A`;
  }

  private async _onChargeSessionToggle() {
    if (!this.hass || !this._resolvedEntities.chargeSession) {
      return;
    }
    const entityId = this._resolvedEntities.chargeSession;
    const service = this._isOn(entityId) ? "turn_off" : "turn_on";
    await this.hass.callService("switch", service, { entity_id: entityId });
  }

  private async _onSurplusModeToggle() {
    if (!this.hass || !this._resolvedEntities.surplusMode) {
      return;
    }
    const entityId = this._resolvedEntities.surplusMode;
    const service = this._isOn(entityId) ? "turn_off" : "turn_on";
    await this.hass.callService("switch", service, { entity_id: entityId });
  }

  private async _setProfile(option: string) {
    if (!this.hass || !this._resolvedEntities.surplusProfile) {
      return;
    }
    await this.hass.callService("select", "select_option", {
      entity_id: this._resolvedEntities.surplusProfile,
      option,
    });
  }

  private async _setChargeCurrent(
    value: number,
    minimum: number,
    maximum: number,
    allowedCurrents: number[] = []
  ) {
    if (!this.hass || !this._resolvedEntities.chargeCurrent) {
      return;
    }
    const rounded = Math.round(value);
    const clamped = Math.max(minimum, Math.min(maximum, rounded));
    const allowed = allowedCurrents.filter(
      (candidate) => candidate >= minimum && candidate <= maximum
    );
    const target =
      allowed.length > 0
        ? allowed.reduce((best, candidate) =>
            Math.abs(candidate - clamped) < Math.abs(best - clamped) ? candidate : best
          )
        : clamped;
    await this.hass.callService("number", "set_value", {
      entity_id: this._resolvedEntities.chargeCurrent,
      value: target,
    });
  }

  private _stepChargeCurrent(
    direction: -1 | 1,
    currentValue: number | null,
    allowedCurrents: number[],
    minimum: number,
    maximum: number,
    step: number
  ): number {
    const allowed = allowedCurrents
      .filter((candidate) => candidate >= minimum && candidate <= maximum)
      .sort((a, b) => a - b);
    if (allowed.length > 0) {
      const current = currentValue ?? allowed[0];
      if (direction < 0) {
        for (let index = allowed.length - 1; index >= 0; index -= 1) {
          if (allowed[index] < current) {
            return allowed[index];
          }
        }
        return allowed[0];
      }

      for (const candidate of allowed) {
        if (candidate > current) {
          return candidate;
        }
      }
      return allowed[allowed.length - 1];
    }

    const base = currentValue ?? minimum;
    return base + direction * step;
  }

  private _toggleDetails = () => {
    this._detailsOpen = !this._detailsOpen;
  };

  private _toggleDebug = () => {
    this._debugOpen = !this._debugOpen;
  };

  static styles = css`
    :host {
      --ev-accent: #2d6a4f;
      --ev-accent-soft: #d8ede5;
      --ev-warn: #9c4221;
      --ev-border: rgba(120, 135, 150, 0.28);
      --ev-text-muted: var(--secondary-text-color);
      font-family: "Manrope", "Avenir Next", "Segoe UI", sans-serif;
    }

    ha-card {
      border-radius: 18px;
      border: 1px solid var(--ev-border);
      box-shadow: 0 10px 30px rgba(20, 30, 38, 0.08);
      background:
        linear-gradient(150deg, rgba(45, 106, 79, 0.08), transparent 42%),
        var(--card-background-color);
      overflow: hidden;
    }

    .card {
      padding: 16px;
      display: grid;
      gap: 12px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
    }

    .title {
      font-size: 1.05rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .subtitle {
      margin-top: 2px;
      color: var(--ev-text-muted);
      font-size: 0.78rem;
      letter-spacing: 0.01em;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: flex-end;
    }

    .chip {
      border-radius: 999px;
      padding: 3px 9px;
      font-size: 0.72rem;
      border: 1px solid var(--ev-border);
      background: rgba(120, 135, 150, 0.08);
    }

    .chip.ok {
      border-color: rgba(45, 106, 79, 0.35);
      background: rgba(45, 106, 79, 0.12);
      color: var(--ev-accent);
    }

    .chip.off {
      color: var(--ev-text-muted);
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }

    .metric {
      border: 1px solid var(--ev-border);
      border-radius: 12px;
      padding: 10px;
      display: grid;
      gap: 4px;
      background: rgba(120, 135, 150, 0.06);
    }

    .metric span {
      color: var(--ev-text-muted);
      font-size: 0.73rem;
    }

    .metric strong {
      font-size: 1rem;
      line-height: 1.1;
    }

    .graph-wrap {
      border: 1px solid var(--ev-border);
      border-radius: 12px;
      padding: 8px 8px 6px;
      background: rgba(120, 135, 150, 0.05);
    }

    .graph {
      width: 100%;
      height: 90px;
      display: block;
    }

    .graph-empty {
      border: 1px dashed var(--ev-border);
      border-radius: 12px;
      color: var(--ev-text-muted);
      font-size: 0.8rem;
      padding: 12px;
      text-align: center;
    }

    .axis {
      stroke: rgba(120, 135, 150, 0.35);
      stroke-width: 1;
    }

    .line {
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .line.power {
      stroke: #2f4858;
    }

    .line.surplus {
      stroke: #2d6a4f;
    }

    .legend {
      margin-top: 6px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .leg {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      color: var(--ev-text-muted);
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }

    .dot.power {
      background: #2f4858;
    }

    .dot.surplus {
      background: #2d6a4f;
    }

    .controls {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .btn {
      height: 36px;
      border-radius: 10px;
      border: 1px solid var(--ev-border);
      background: rgba(120, 135, 150, 0.08);
      font-size: 0.83rem;
      font-weight: 600;
      color: var(--primary-text-color);
      cursor: pointer;
    }

    .btn.primary {
      border-color: rgba(45, 106, 79, 0.45);
      background: rgba(45, 106, 79, 0.16);
      color: #204738;
    }

    .btn.tiny {
      width: 38px;
      height: 32px;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .current-box {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .current-value {
      min-width: 70px;
      text-align: center;
      font-size: 0.95rem;
      font-weight: 700;
    }

    .profiles {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }

    .profile {
      height: 34px;
      border-radius: 999px;
      border: 1px solid var(--ev-border);
      background: transparent;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      cursor: pointer;
    }

    .profile.active {
      border-color: rgba(45, 106, 79, 0.45);
      background: rgba(45, 106, 79, 0.18);
      color: #204738;
      font-weight: 700;
    }

    .details-toggle,
    .debug-toggle {
      background: transparent;
      border: 0;
      color: var(--ev-text-muted);
      font-size: 0.78rem;
      cursor: pointer;
      justify-self: start;
      padding: 0;
    }

    .details {
      border-top: 1px dashed var(--ev-border);
      padding-top: 10px;
      display: grid;
      gap: 8px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      font-size: 0.82rem;
    }

    .debug-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .debug-item {
      border: 1px solid var(--ev-border);
      border-radius: 10px;
      padding: 8px;
      display: grid;
      gap: 4px;
      background: rgba(120, 135, 150, 0.05);
      font-size: 0.78rem;
    }

    .debug-item span {
      color: var(--ev-text-muted);
    }

    @media (max-width: 460px) {
      .metrics {
        grid-template-columns: 1fr;
      }
      .controls {
        grid-template-columns: 1fr;
      }
      .debug-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
}

customElements.define("tuya-ev-charger-card", TuyaEvChargerCard);

type EntityFieldKey = keyof NonNullable<CardConfig["entities"]>;

type EntityFieldSpec = {
  key: EntityFieldKey;
  label: string;
  domain: string;
  suffixes: string[];
};

const ENTITY_FIELD_SPECS: EntityFieldSpec[] = [
  {
    key: "charge_session",
    label: "Charge session switch",
    domain: "switch",
    suffixes: ["charge_session"],
  },
  {
    key: "surplus_mode",
    label: "Surplus mode switch",
    domain: "switch",
    suffixes: ["surplus_mode"],
  },
  {
    key: "surplus_profile",
    label: "Surplus profile select",
    domain: "select",
    suffixes: ["surplus_profile"],
  },
  {
    key: "charge_current",
    label: "Charge current number",
    domain: "number",
    suffixes: ["charge_current"],
  },
  {
    key: "power",
    label: "Power sensor",
    domain: "sensor",
    suffixes: ["power_l1"],
  },
  {
    key: "current",
    label: "Current sensor",
    domain: "sensor",
    suffixes: ["current_l1"],
  },
  {
    key: "last_decision",
    label: "Last decision sensor",
    domain: "sensor",
    suffixes: ["surplus_last_decision_reason"],
  },
  {
    key: "surplus_effective",
    label: "Effective surplus sensor",
    domain: "sensor",
    suffixes: ["surplus_effective_w"],
  },
  {
    key: "surplus_raw",
    label: "Raw surplus sensor",
    domain: "sensor",
    suffixes: ["surplus_raw_w"],
  },
  {
    key: "surplus_discharge_over_limit",
    label: "Battery over-limit sensor",
    domain: "sensor",
    suffixes: ["surplus_battery_discharge_over_limit_w"],
  },
  {
    key: "surplus_target_current",
    label: "Target current sensor",
    domain: "sensor",
    suffixes: ["surplus_target_current_a"],
  },
  {
    key: "regulation_active",
    label: "Regulation active binary sensor",
    domain: "binary_sensor",
    suffixes: ["surplus_regulation_active"],
  },
];

const normalizeToken = (input?: string): string =>
  String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_");

class TuyaEvChargerCardEditor extends LitElement {
  public hass?: HomeAssistant;
  private _config: CardConfig = TuyaEvChargerCard.getStubConfig();

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
            @input=${(event: Event) =>
              this._updateRootText("title", (event.target as HTMLInputElement).value)}
          />
        </label>
        <label>
          <span>Detected EV Charger instance</span>
          <div class="inline">
            <select
              .value=${selectedToken}
              @change=${(event: Event) =>
                this._autoFillFromToken((event.target as HTMLSelectElement).value)}
            >
              <option value="">Select...</option>
              ${detectedTokens.map(
                (token) => html`<option value=${token}>${token}</option>`
              )}
            </select>
            <button
              type="button"
              class="action"
              @click=${() => this._autoFillFromToken(cfg.charger_name ?? "")}
              ?disabled=${!selectedToken}
            >
              Auto-fill
            </button>
          </div>
        </label>
        <label>
          <span>Charger token (advanced)</span>
          <input
            type="text"
            .value=${cfg.charger_name ?? ""}
            @input=${(event: Event) =>
              this._updateRootText(
                "charger_name",
                (event.target as HTMLInputElement).value
              )}
          />
        </label>
        <label>
          <span>Graph points</span>
          <input
            type="number"
            min="20"
            max="120"
            step="1"
            .value=${String(cfg.graph_points ?? 40)}
            @input=${(event: Event) =>
              this._updateGraphPoints((event.target as HTMLInputElement).value)}
          />
        </label>

        <h3>Entity overrides</h3>
        <p class="hint">
          Optional. Keep "Auto-detected" when possible.
        </p>
        <div class="grid">
          ${ENTITY_FIELD_SPECS.map(
            (field) => html`
              <label>
                <span>${field.label}</span>
                <select
                  .value=${entities[field.key] ?? ""}
                  @change=${(event: Event) =>
                    this._updateEntity(
                      field.key,
                      (event.target as HTMLSelectElement).value
                    )}
                >
                  <option value="">Auto-detected</option>
                  ${this._entityOptions(field).map(
                    (entityId) =>
                      html`<option value=${entityId}>${entityId}</option>`
                  )}
                </select>
              </label>
            `
          )}
        </div>
      </div>
    `;
  }

  private _detectedChargerTokens(): string[] {
    if (!this.hass) {
      return [];
    }
    const technicalTokens = new Map<string, Set<EntityFieldKey>>();
    const eligibleRoles = new Set(ENTITY_FIELD_SPECS.map((field) => field.key));
    Object.keys(this.hass.states).forEach((entityId) => {
      const token = this._entityToken(entityId);
      const role = this._entityRole(entityId) as EntityFieldKey;
      if (!token || !role || !eligibleRoles.has(role)) {
        return;
      }
      const roles = technicalTokens.get(token) ?? new Set<EntityFieldKey>();
      roles.add(role);
      technicalTokens.set(token, roles);
    });

    const technicalRanked = [...technicalTokens.entries()]
      .filter(([, roles]) => roles.size >= 2)
      .sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0]))
      .map(([token]) => token);
    if (technicalRanked.length) {
      const selected = normalizeToken(this._config.charger_name);
      if (selected && !technicalRanked.includes(selected)) {
        technicalRanked.unshift(selected);
      }
      return technicalRanked.slice(0, 20);
    }

    const weighted = new Map<string, { count: number; domains: Set<string> }>();
    const all = Object.keys(this.hass.states).sort();

    // Pass 1: best-case extraction using known entity suffixes.
    for (const field of ENTITY_FIELD_SPECS) {
      const prefix = `${field.domain}.`;
      all.filter((entityId) => entityId.startsWith(prefix)).forEach((entityId) => {
        const token = this._extractToken(entityId, field.suffixes);
        if (!token) {
          return;
        }
        const bucket = weighted.get(token) ?? { count: 0, domains: new Set<string>() };
        bucket.count += 4;
        bucket.domains.add(field.domain);
        weighted.set(token, bucket);
      });
    }

    // Pass 2: fallback extraction from common object_id prefixes.
    const eligibleDomains = new Set(ENTITY_FIELD_SPECS.map((field) => field.domain));
    all.forEach((entityId) => {
      const [domain, objectIdRaw] = entityId.split(".");
      const objectId = normalizeToken(objectIdRaw);
      if (!domain || !objectId || !eligibleDomains.has(domain)) {
        return;
      }
      for (const token of this._candidatePrefixTokens(objectId)) {
        const bucket = weighted.get(token) ?? { count: 0, domains: new Set<string>() };
        bucket.count += 1;
        bucket.domains.add(domain);
        weighted.set(token, bucket);
      }
    });

    const ranked = [...weighted.entries()]
      .filter(([, value]) => value.count >= 3 && value.domains.size >= 2)
      .sort((a, b) => {
        const scoreDiff = b[1].count - a[1].count;
        if (scoreDiff !== 0) {
          return scoreDiff;
        }
        return b[0].length - a[0].length;
      })
      .map(([token]) => token);

    const selected = normalizeToken(this._config.charger_name);
    if (selected && !ranked.includes(selected)) {
      ranked.unshift(selected);
    }
    return ranked.slice(0, 20);
  }

  private _entityOptions(field: EntityFieldSpec): string[] {
    if (!this.hass) {
      return [];
    }
    const token = normalizeToken(this._config.charger_name);
    const prefix = `${field.domain}.`;
    const all = Object.keys(this.hass.states).filter((entityId) =>
      entityId.startsWith(prefix)
    );
    const roleMatches = all.filter((entityId) => this._entityRole(entityId) === field.key);
    const matchingSuffix = all.filter((entityId) =>
      this._matchesSuffix(entityId, field.suffixes)
    );
    const source = (roleMatches.length ? roleMatches : matchingSuffix.length ? matchingSuffix : all).slice();
    source.sort((a, b) => {
      const aScore = this._tokenScore(a, token);
      const bScore = this._tokenScore(b, token);
      if (aScore !== bScore) {
        return aScore - bScore;
      }
      const indexDiff = this._entityIndex(a) - this._entityIndex(b);
      if (indexDiff !== 0) {
        return indexDiff;
      }
      return a.localeCompare(b);
    });
    return source;
  }

  private _autoFillFromToken(rawToken: string): void {
    const token = normalizeToken(rawToken);
    const next: CardConfig = { ...this._config };
    if (token) {
      next.charger_name = token;
    } else {
      delete next.charger_name;
    }

    const entities: NonNullable<CardConfig["entities"]> = {};
    for (const field of ENTITY_FIELD_SPECS) {
      const guessed = this._guessEntity(field, token);
      if (guessed) {
        entities[field.key] = guessed;
      }
    }

    if (Object.keys(entities).length) {
      next.entities = entities;
    } else {
      delete next.entities;
    }
    this._emit(next);
  }

  private _guessEntity(field: EntityFieldSpec, token: string): string | undefined {
    if (!this.hass) {
      return undefined;
    }
    const all = Object.keys(this.hass.states)
      .filter((entityId) => entityId.startsWith(`${field.domain}.`))
      .sort();
    const roleMatches = all.filter((entityId) => this._entityRole(entityId) === field.key);
    const rankedByRole = roleMatches.sort((a, b) => {
      const scoreDiff = this._tokenScore(a, token) - this._tokenScore(b, token);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
      return this._entityIndex(a) - this._entityIndex(b);
    });
    if (rankedByRole.length) {
      return rankedByRole[0];
    }
    const matches = all.filter((entityId) =>
      this._matchesSuffix(entityId, field.suffixes)
    );
    const tokenMatches = token
      ? all.filter((entityId) => this._tokenScore(entityId, token) <= 1)
      : [];
    const source = matches.length ? matches : tokenMatches;
    if (!source.length) {
      return undefined;
    }
    if (!token) {
      return source[0];
    }
    return source.sort((a, b) => this._tokenScore(a, token) - this._tokenScore(b, token))[0];
  }

  private _matchesSuffix(entityId: string, suffixes: string[]): boolean {
    return suffixes.some(
      (suffix) => entityId.endsWith(`_${suffix}`) || entityId.endsWith(suffix)
    );
  }

  private _entityRole(entityId: string): string {
    if (!this.hass) {
      return "";
    }
    return String(this.hass.states[entityId]?.attributes[ATTR_CARD_ROLE] ?? "").trim();
  }

  private _entityToken(entityId: string): string {
    if (!this.hass) {
      return "";
    }
    const raw = this.hass.states[entityId]?.attributes[ATTR_CHARGER_TOKEN];
    return normalizeToken(String(raw ?? ""));
  }

  private _entityIndex(entityId: string): number {
    if (!this.hass) {
      return 9999;
    }
    const raw = this.hass.states[entityId]?.attributes[ATTR_CARD_INDEX];
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 9999;
  }

  private _candidatePrefixTokens(objectId: string): string[] {
    const normalized = normalizeToken(objectId);
    const parts = normalized.split("_").filter(Boolean);
    const tokens: string[] = [];
    for (let index = 1; index < parts.length; index += 1) {
      const token = parts.slice(0, index).join("_");
      if (token.length >= 3) {
        tokens.push(token);
      }
    }
    return tokens;
  }

  private _tokenScore(entityId: string, token: string): number {
    if (!token) {
      return 1;
    }
    const technicalToken = this._entityToken(entityId);
    if (technicalToken && technicalToken === token) {
      return 0;
    }
    const objectId = normalizeToken(entityId.split(".")[1] ?? "");
    if (!objectId) {
      return 4;
    }
    if (objectId === token || objectId.startsWith(`${token}_`)) {
      return 1;
    }
    if (objectId.includes(token)) {
      return 2;
    }
    return 3;
  }

  private _extractToken(
    entityId: string,
    suffixes: string[]
  ): string | undefined {
    const objectId = entityId.split(".")[1] ?? "";
    if (!objectId) {
      return undefined;
    }

    for (const suffix of suffixes) {
      if (objectId === suffix) {
        continue;
      }
      const underscored = `_${suffix}`;
      if (objectId.endsWith(underscored)) {
        const token = normalizeToken(
          objectId.slice(0, objectId.length - underscored.length)
        );
        return token || undefined;
      }
      if (objectId.endsWith(suffix)) {
        const token = normalizeToken(
          objectId
            .slice(0, objectId.length - suffix.length)
            .replace(/_+$/, "")
        );
        return token || undefined;
      }
    }
    return undefined;
  }

  private _updateRootText(key: "title" | "charger_name", value: string): void {
    const next: CardConfig = { ...this._config };
    const trimmed = key === "charger_name" ? normalizeToken(value) : value.trim();
    if (trimmed) {
      next[key] = trimmed;
    } else {
      delete next[key];
    }
    this._emit(next);
  }

  private _updateGraphPoints(rawValue: string): void {
    const parsed = Number(rawValue);
    const next: CardConfig = { ...this._config };
    if (!Number.isFinite(parsed)) {
      delete next.graph_points;
    } else {
      const clamped = Math.max(20, Math.min(120, Math.round(parsed)));
      next.graph_points = clamped;
    }
    this._emit(next);
  }

  private _updateEntity(key: EntityFieldKey, value: string): void {
    const trimmed = value.trim();
    const entities: NonNullable<CardConfig["entities"]> = {
      ...(this._config.entities ?? {}),
    };
    if (trimmed) {
      entities[key] = trimmed;
    } else {
      delete entities[key];
    }

    const next: CardConfig = { ...this._config };
    if (Object.keys(entities).length) {
      next.entities = entities;
    } else {
      delete next.entities;
    }
    this._emit(next);
  }

  private _emit(next: CardConfig): void {
    const normalized: CardConfig = {
      ...next,
      type: "custom:tuya-ev-charger-card",
    };
    this._config = normalized;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: normalized },
        bubbles: true,
        composed: true,
      })
    );
  }

  static styles = css`
    .editor {
      display: grid;
      gap: 12px;
      padding: 8px 0;
    }

    h3 {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 700;
    }

    .hint {
      margin: -6px 0 0;
      color: var(--secondary-text-color);
      font-size: 0.78rem;
    }

    .grid {
      display: grid;
      gap: 8px;
    }

    .inline {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
    }

    label {
      display: grid;
      gap: 4px;
    }

    span {
      font-size: 0.78rem;
      color: var(--secondary-text-color);
    }

    input,
    select {
      height: 34px;
      border: 1px solid rgba(120, 135, 150, 0.35);
      border-radius: 9px;
      padding: 0 10px;
      font: inherit;
      background: var(--card-background-color);
      color: var(--primary-text-color);
    }

    .action {
      height: 34px;
      padding: 0 12px;
      border: 1px solid rgba(45, 106, 79, 0.45);
      border-radius: 9px;
      font: inherit;
      font-size: 0.78rem;
      font-weight: 600;
      color: #204738;
      background: rgba(45, 106, 79, 0.14);
      cursor: pointer;
    }

    .action:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
}

customElements.define("tuya-ev-charger-card-editor", TuyaEvChargerCardEditor);

declare global {
  interface Window {
    customCards?: Array<Record<string, unknown>>;
  }
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "tuya-ev-charger-card",
  name: "Tuya EV Charger Card",
  description: "Modern and sober dashboard card for Tuya EV Charger Local",
  preview: true,
  configurable: true,
});
