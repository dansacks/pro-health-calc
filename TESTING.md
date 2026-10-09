# Testing and verification

This page explains how to check that the calculator is working, how to read the test report, and what the
tests cover. You do not need to read any code to follow it.

## Run the tests

```bash
npm install     # first time only
npm test
```

The command runs every test in a few seconds. It prints a summary like this:

```
========================================================================
 PRO HEALTH CALCULATOR: TEST REPORT
========================================================================
 RESULT: ALL 331 CHECKS PASSED

 CALCULATIONS (18 results the calculator produces)
   PASS  Labor cost, current (baseline) team                21/21 checks (1 edge)
   PASS  Primary care capitation rate, baseline             14/14 checks (3 edge)
   ...
 COVERAGE: every calculation has at least 3 normal worked examples.

 Full report with every example: test-report/index.html
```

It also writes two files to the `test-report/` folder:

- `test-report/index.html`: open it in a web browser. It lists every worked example for every calculation.
- `test-report/results.md`: the same content as Markdown, suitable for attaching to a manuscript or repository.

The test report is regenerated on every run, so it always reflects the current code.

**The calculator is working correctly when the summary says `ALL ... CHECKS PASSED` and every line shows `PASS`.**
If anything fails, the summary lists each failed check with the expected and actual values.

## How to read the report

Each calculation the app performs has its own section containing:

- **How it is calculated:** the formula in plain words and the unit (dollars per month, percent, and so on).
- **Worked examples:** a table where each row describes a situation in words, gives the answer expected
  (worked out by hand), the answer the calculator produced, and PASS or FAIL.
- **Edge case** badges mark unusual inputs, such as a 100% margin or an empty panel. These rows document what
  the calculator does in those situations (see [Edge cases](#edge-cases)).

Example row from the report:

| Worked example | Expected | Actual | Result |
| --- | ---: | ---: | --- |
| 2 physicians at $110,000 + $10 per patient x 2,000 patients, 50% margin: $240,000 / 1,000 / 12 = $20 | 20 | 20 | PASS |

You can verify this row with a calculator: two physicians cost $220,000 and 2,000 patients at $10 add $20,000,
so total cost is $240,000. A 50% margin means the practice collects revenue on only half of each dollar, so the
divisor is 0.5 x 2,000 = 1,000 patients. Then $240,000 / 1,000 / 12 months = $20 per member per month.

## What is tested

### Every calculation, with multiple examples

All 18 results the calculator produces have at least 3 normal worked examples plus edge cases:

| Group | Calculations |
| --- | --- |
| Costs | Labor cost (baseline and proactive), non-labor costs (baseline and proactive), total cost (baseline and proactive) |
| Capitation rate | Rate per member per month (baseline and proactive), difference |
| Hospital and ED spending | Baseline, proactive, difference |
| Combined spending | Baseline, proactive, difference |
| Panel size | Difference |
| Break-even | Break-even hospital spending offset, break-even panel size |

Supporting calculations are tested the same way: the chart's break-even curve, the age-mix total shown on the
input form, and the conversion of typed text into numbers.

The labor cost tests also check each of the 10 staff roles individually, for both teams, so a role that was
accidentally left out of the sum would be caught.

### Relationships that must always hold

- Total cost equals labor cost plus non-labor costs.
- Combined spending difference equals the capitation rate difference plus the hospital spending difference.
- Using the calculated break-even offset as the hospital offset makes the two teams' combined spending equal.
- At the calculated break-even panel size, the two teams' capitation rates are equal.
- The chart's curve, evaluated at the proactive panel size, equals the break-even offset shown in the results.

### Known-good results for the default inputs

The results for the default inputs were calculated independently of the application code (a separate script
written from the formulas in [ARCHITECTURE.md](ARCHITECTURE.md)) and are stored in the tests. Any change to a
formula, default value, or reference data that alters these results makes the tests fail.

### The screens

Tests also load the page the way a user would and check that:

- the page shows the expected values for the default inputs,
- typing into input boxes updates the results (for example, changing the proactive panel size to 3,000 shows a
  panel size difference of 300),
- the four input tabs and the previous/next arrows work, and the values are kept when switching tabs,
- the chart and the break-even panel are drawn, and numbers are rounded as displayed (2 decimals for money,
  whole numbers for patients),
- the help tooltips show bold text and line breaks, and show any other HTML as plain text instead of running it.

### Edge cases

The calculator does not validate its inputs. The tests record what currently happens so that behavior is
known and any change is deliberate:

- A 100% margin, a panel size of 0, or a baseline with no staff divides by zero. The result is `Infinity`
  or `NaN` (not a number) instead of an error message.
- Negative values (for example, a negative FTE) are accepted and flow through the formulas.
- Blank or non-numeric text typed into a box becomes 0.
- The patient age mix is not rescaled if it does not add up to 100.
- A typed-in hospitalization cost is used only when it is not exactly 0; 0 means "estimate from the age mix".

## Check it yourself in the browser

Start the app (`npm run dev`, open http://localhost:3000) and compare these results.

**1. Default inputs.** Without changing anything, the Results table shows:

| | Baseline | Proactive | Difference |
| --- | ---: | ---: | ---: |
| Panel size | 2700 | 2700 | 0 |
| Primary care cap rate PMPM | $28.70 | $73.05 | $44.35 |
| Hospital spend PMPM | $224.94 | $168.70 | $-56.23 |
| Combined (PC + Hosp) spend | $253.64 | $241.76 | $-11.88 |

and the break-even panel shows an offset of 19.72% and a panel size of 7152.

**2. Typed-in hospital spending.** On the Patient Severity tab, enter 200 for "Baseline Hospital and ED
spend". With the default 25% offset, Hospital spend PMPM becomes $200.00 baseline, $150.00 proactive,
$-50.00 difference. (200 x (1 - 0.25) = 150.)

**3. A larger proactive panel.** On the Proactive Team tab, change the panel size to 3000. The panel size
difference becomes 300 and the proactive cap rate drops, because the same staff cost is spread over more
patients.

## Test files

| Folder | Contents |
| --- | --- |
| `test/calculations/` | The math: costs, capitation rates, hospital spending, combined spending, break-even, chart curve, and cross-checks |
| `test/helpers/` | The input form helpers |
| `test/components/` | The input forms, result displays, chart, help tooltips, and the whole page |
| `test/support/` | Shared scenario builders and the plain-English description of each calculation (`catalog.js`) |
| `test/reporters/` | The reporter that produces the readable summary and `test-report/` |

Most calculation tests use round numbers (for example a $100,000 salary and a $120,000 physician) so each
expected value can be confirmed with a pocket calculator. Each test's name states the situation and the working.

### Adding a test

1. Add a row to a table in the relevant file in `test/calculations/` with a plain-English name, the inputs to
   change from the neutral starting point (`test/support/scenarios.js`), and the expected value.
2. Run `npm test` and confirm the new row appears in the report.

If a new calculation is added to `src/calculations.js`, describe it in `test/support/catalog.js`. A test fails
until every calculation the app produces has an entry there, which keeps the report complete.

## Reference data

Earlier versions of the calculator were specified in an Excel workbook. The calculator has since changed
(facilities costs were removed and the reference cost data was updated for inflation), so the tests do not
compare against that workbook. They rely on the hand-worked examples and the independent
calculation described above.
