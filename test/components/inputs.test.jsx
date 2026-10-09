import React, { useState } from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
import { DEFAULT_INPUTS, STAFF_ROLES } from '../../src/calculations';
import BenefitRates from '../../src/components/inputs/BenefitRates';
import HospitalizationCosts from '../../src/components/inputs/HospitalizationCosts';
import Margin from '../../src/components/inputs/Margin';
import NonLaborCosts from '../../src/components/inputs/NonLaborCosts';
import PanelSizeBaseline from '../../src/components/inputs/PanelSizeBaseline';
import PanelSizeProactive from '../../src/components/inputs/PanelSizeProactive';
import PatientAgeMix from '../../src/components/inputs/PatientAgeMix';
import TeamBaseline from '../../src/components/inputs/TeamBaseline';
import TeamProactive from '../../src/components/inputs/TeamProactive';

afterEach(() => {
  cleanup();
  delete window.DEBUG;
});

// Holds the inputs in state, like the real app does.
const Harness = ({ Component }) => {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  return <Component inputs={inputs} setInputs={setInputs} />;
};

const input = (field) => document.querySelector(`input[name="${field}"]`);

const TEAM_LABELS = [
  'Primary Care Physician', 'APC, NP, or PA', 'Medical Assistant', 'Registered Nurse', 'Athletic Trainer',
  'Pharmacist', 'Healthcare Social Worker', 'Mental Health Professional', 'Clerical Staff', 'Community Health Worker',
];

const COMPONENTS = [
  { name: 'Current panel size', Component: PanelSizeBaseline, heading: /Current Panel Size/, fields: ['panelSizeBaseline'], labels: ['Panel Size'] },
  { name: 'Proactive panel size and offset', Component: PanelSizeProactive, heading: /Proactive Panel Size/, fields: ['panelSizeProactive', 'hospitalCostOffset'], labels: ['Panel Size', 'Hospital Cost Offset'] },
  { name: 'Current team FTEs', Component: TeamBaseline, heading: /Current Team FTEs, by Role/, fields: STAFF_ROLES.map((r) => `${r}Baseline`), labels: TEAM_LABELS },
  { name: 'Proactive team FTEs', Component: TeamProactive, heading: /Proactive Team FTEs, by Role/, fields: STAFF_ROLES.map((r) => `${r}Proactive`), labels: TEAM_LABELS },
  { name: 'Hospitalization costs', Component: HospitalizationCosts, heading: /Age Mix Alternative: Patient Hospitalization Costs/, fields: ['hospitalizationCosts'], labels: ['Baseline Hospital and ED spend'] },
  { name: 'Patient age mix', Component: PatientAgeMix, heading: /Patient Age Mix/, fields: ['age0_18', 'age19_44', 'age45_64', 'age65_plus'], labels: ['0 to 18', '19 to 44', '45 to 64', '65+'] },
  { name: 'Non-labor costs', Component: NonLaborCosts, heading: /Non-Labor Costs \(Annual\)/, fields: ['costPerPatient'], labels: ['Cost per patient'] },
  { name: 'Required net margin', Component: Margin, heading: /Required Net Margin/, fields: ['margin'], labels: ['Net Margin'] },
  { name: 'Benefit rates', Component: BenefitRates, heading: /Benefit Rates/, fields: ['benefitRates'], labels: ['Benefit Rates Including FICA'] },
];

describe('Input forms', () => {
  it.for(COMPONENTS)('$name: shows its heading, labels, and default values', ({ Component, heading, fields, labels }) => {
    render(<Harness Component={Component} />);

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    labels.forEach((label) => expect(screen.getAllByText(label, { exact: false }).length).toBeGreaterThan(0));
    fields.forEach((field) => expect(input(field)).toHaveValue(DEFAULT_INPUTS[field]));
  });

  it.for(COMPONENTS)('$name: typing a new value updates every field', ({ Component, fields }) => {
    render(<Harness Component={Component} />);

    fields.forEach((field, i) => {
      fireEvent.change(input(field), { target: { value: String(10 + i) } });
      expect(input(field)).toHaveValue(10 + i);
    });
  });

  it.for(COMPONENTS)('$name: clearing a field shows 0', ({ Component, fields }) => {
    render(<Harness Component={Component} />);

    fireEvent.change(input(fields[0]), { target: { value: '' } });

    expect(input(fields[0])).toHaveValue(0);
  });

  it.for(COMPONENTS)('$name: shows variable names instead of labels when debugging is on', ({ Component, fields }) => {
    window.DEBUG = true;
    render(<Harness Component={Component} />);

    expect(screen.getByText(fields[0])).toBeInTheDocument();
  });

  it('patient age mix: the Sum row shows 100.00 for the default mix', () => {
    render(<Harness Component={PatientAgeMix} />);

    expect(within(screen.getByText('Sum').closest('tr')).getByText('100.00')).toBeInTheDocument();
  });

  it('patient age mix: the Sum row updates when a value changes (25 -> 30 gives 105.00)', () => {
    render(<Harness Component={PatientAgeMix} />);

    fireEvent.change(input('age0_18'), { target: { value: '30' } });

    expect(within(screen.getByText('Sum').closest('tr')).getByText('105.00')).toBeInTheDocument();
  });

  it('team forms edit only their own team (baseline form never touches proactive fields)', () => {
    render(<Harness Component={TeamBaseline} />);

    expect(input('familyMedicineDoctorProactive')).toBeNull();
    expect(input('familyMedicineDoctorBaseline')).not.toBeNull();
  });
});
