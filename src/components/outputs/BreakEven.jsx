// src/components/BreakEven.js
import React from 'react';
import Tooltip from '../inputs/Tooltip';

const BreakEven = ({ outputs }) => {


  return (
    <div className="output-panel">
      <h2>Output 2: Break even analysis</h2>
      <table>
        <tbody>
        <tr>
          <th>Break-even offset (at new panel size)<Tooltip  position="right" tooltipText="The percent reduction in hospital and ED spend that the alternative team has to generate so that the alternative team’s total cost equals the baseline team’s total cost, given the panel sizes of both.
          "></Tooltip></th>
          <td><span data-testid={'breakEvenOffset'}>{outputs.breakEvenOffset.toFixed(2)}</span>%</td>
        </tr>
        <tr>
          <th>Break-even panel size (with 0 offset)</th>
          <td><span data-testid={'breakEvenPanelSize'}>{outputs.breakEvenPanelSize.toFixed(0)}</span></td>
        </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BreakEven;
