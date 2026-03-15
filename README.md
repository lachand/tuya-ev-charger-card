# Tuya EV Charger Card

Custom Lovelace card for the Tuya EV Charger Local integration.

Modern and sober UI with:

- Start/Stop charging
- Surplus mode toggle
- Surplus profile selector (`eco`, `balanced`, `fast`)
- Charge current adjust (`number.charge_current`)
- Optimistic controls (instant UI feedback before state sync)
- Mini graph (preloads 1h from Home Assistant Recorder, then live 30s samples)
- Details panel with debug values
- Built-in Lovelace visual editor (instance auto-detection + dropdown entity selectors + auto-fill)

## Installation (HACS)

1. Add this repository as a custom `Frontend` repository in HACS.
2. Install `Tuya EV Charger Card`.
3. Add `/hacsfiles/tuya-ev-charger-card/tuya-ev-charger-card.js` as a dashboard resource if needed.

## Card example

```yaml
type: custom:tuya-ev-charger-card
title: EV Charger
charger_name: tuya_ev_charger
entities:
  charge_session: switch.tuya_ev_charger_charge_session
  surplus_mode: switch.tuya_ev_charger_surplus_mode
  surplus_profile: select.tuya_ev_charger_surplus_profile
```

## Development

```bash
npm install
npm run build
```

Build outputs:
- `tuya-ev-charger-card.js` (primary HACS bundle)
- `dist/tuya-ev-charger-card.js` (compatibility copy)
