# Proactive Primary Care Team Financial Calculator

A web calculator that compares the finances of a current ("baseline") primary care team with a proactive
(expanded) team. Given team staffing, salaries, panel sizes, patient mix, and a few financial assumptions, it
shows:

- the primary care capitation rate per member per month (PMPM) for each team,
- estimated hospital and emergency department spending PMPM for each team,
- combined spending, and
- two break-even measures: the reduction in hospital spending the proactive team must achieve to cost the same
  overall, and the panel size at which the proactive team costs the same per patient.

The calculator runs entirely in the browser. There is no server, database, or network service, and no data
leaves the user's computer.

Developed at the UW-Madison School of Medicine and Public Health.

## Quick start

Requires Node.js 22.22.2 or newer (Node 24 LTS recommended). See [SETUP.md](SETUP.md) for details.

```bash
git clone https://github.com/dansacks/pro-health-calc.git
cd pro-health-calc
npm install
npm run dev        # open http://localhost:3000
npm test           # runs every test and prints a plain-English report
```

## Documentation

| Document | Contents |
| --- | --- |
| [SETUP.md](SETUP.md) | Installing and running the calculator locally |
| [TESTING.md](TESTING.md) | How to run the tests, read the report, and verify the calculator is working |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technical architecture, data flow, and every formula |

## Project layout

```
src/calculations.js   all calculation logic (no UI code)
src/App.jsx           page layout and state
src/components/       input forms and result displays
test/                 automated tests and the readable test reporter
```

## License

Released under the [MIT License](LICENSE).
