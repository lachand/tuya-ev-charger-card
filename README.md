# Tuya EV Charger Card

Custom Lovelace card for the Tuya EV Charger Local integration.

Modern and sober UI with:

- Start/Stop charging
- Surplus mode toggle
- Surplus profile selector (`eco`, `balanced`, `fast`)
- Charge current adjust (`number.charge_current`)
- Mini graph (power and effective surplus)
- Details panel with debug values
- Built-in Lovelace visual editor (auto-detection + entity overrides)

## Installation (HACS)

1. Add this repository as a custom `Frontend` repository in HACS.
2. Install `Tuya EV Charger Card`.
3. Add `/hacsfiles/tuya-ev-charger-card/dist/tuya-ev-charger-card.js` as a dashboard resource if needed.

## Card example

```yaml
type: custom:tuya-ev-charger-card
title: EV Charger
charger_name: tuya_ev_charger
graph_points: 40
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

Output bundle: `dist/tuya-ev-charger-card.js`
