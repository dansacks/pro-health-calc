// src/components/Results.js
import React from 'react';
import Tooltip from '../inputs/Tooltip';

const Results = ({ inputs, outputs, DEBUG }) => {

  return (
    <div className="output-panel">
      <table>
        <thead>
        <tr>
          <th></th>
          <th>Baseline</th>
          <th>Proactive</th>
          <th>Difference</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <th>Panel size</th>
          <td title={'panelSizeBaseline (size0)'}><span data-testid={'panelSizeBaseline'}>{inputs.panelSizeBaseline}</span></td>
          <td title={'panelSizeProactive (size1)'}><span data-testid={'panelSizeProactive'}>{inputs.panelSizeProactive}</span></td>
          <td title={'panelSizeDifference'}><span data-testid={'panelSizeDifference'}>{outputs.panelSizeDifference}</span></td>
        </tr>
        <tr>
          <th>Primary care cap rate PMPM<Tooltip  position="right" tooltipText="The payment to the primary care organization for primary care costs, expressed on a per-member-month basis.
          "></Tooltip></th>
          <td title={'capRateBaseline (cap0)'}>$<span data-testid={'capRateBaseline'}>{outputs.capRateBaseline.toFixed(2)}</span></td>
          <td title={'capRateProactive (cap1_user)'}>$<span data-testid={'capRateProactive'}>{outputs.capRateProactive.toFixed(2)}</span></td>
          <td title={'capRateDifference'}>$<span data-testid={'capRateDifference'}>{outputs.capRateDifference.toFixed(2)}</span></td>
        </tr>
        <tr>
          <th>Hospital spend PMPM<Tooltip  position="right" tooltipText="Spending on hospital and emergency department care, per member month, averaging overall members, including those with zero hospital/ED spend.
          "></Tooltip></th>
          <td title={'hospitalSpendBaseline (hosp_cost)'}>$<span data-testid={'hospitalSpendBaseline'}>{outputs.hospitalSpendBaseline.toFixed(2)}</span></td>
          <td title={'hospitalSpendProactive'}>$<span data-testid={'hospitalSpendProactive'}>{outputs.hospitalSpendProactive.toFixed(2)}</span></td>
          <td title={'hospitalSpendDifference'}>$<span data-testid={'hospitalSpendDifference'}>{outputs.hospitalSpendDifference.toFixed(2)}</span></td>
        </tr>
        <tr>
          <th>Combined (PC + Hosp) spend<Tooltip  position="right" tooltipText="Primary care capitation rate plus hospital ED spend.
          "></Tooltip></th>
          <td title={'combinedSpendBaseline'}>$<span data-testid={'combinedSpendBaseline'}>{outputs.combinedSpendBaseline.toFixed(2)}</span></td>
          <td title={'combinedSpendProactive'}>$<span data-testid={'combinedSpendProactive'}>{outputs.combinedSpendProactive.toFixed(2)}</span></td>
          <td title={'combinedSpendDifference'}>$<span data-testid={'combinedSpendDifference'}>{outputs.combinedSpendDifference.toFixed(2)}</span></td>
        </tr>

        {window.DEBUG && (
          <tr>
            <th>DEBUG:</th>
            <td colSpan={'3'}>
              <dl>
                <dt>laborCostBaseline</dt>
                <dd data-testid={'laborCostBaseline'}>{outputs.laborCostBaseline.toFixed(2)}</dd>
                <dt>laborCostProactive</dt>
                <dd data-testid={'laborCostProactive'}>{outputs.laborCostProactive.toFixed(2)}</dd>

                <dt>totalCostBaseline</dt>
                <dd data-testid={'totalCostBaseline'}>{outputs.totalCostBaseline.toFixed(2)}</dd>
                <dt>totalCostProactive</dt>
                <dd data-testid={'totalCostProactive'}>{outputs.totalCostProactive.toFixed(2)}</dd>

                <dt>variableCostsBaseline</dt>
                <dd data-testid={'variableCostsBaseline'}>{outputs.variableCostsBaseline.toFixed(2)}</dd>
                <dt>variableCostsProactive</dt>
                <dd data-testid={'variableCostsProactive'}>{outputs.variableCostsProactive.toFixed(2)}</dd>
              </dl>
            </td>
          </tr>
        )}
        </tbody>
      </table>
    </div>
  );
};

export default Results;
