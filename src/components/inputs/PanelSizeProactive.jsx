// src/components/PanelSizeProactive.js
import React from 'react';
import { renderTableRows, calculateSum, handleChangeFactory } from '../../helpers/Forms';
import Tooltip from './Tooltip';

const PanelSizeProactive = ({ inputs, setInputs }) => {
  const handleChange = handleChangeFactory(setInputs);

  const tipText = "This is the panel size you think the enhanced proactive team could manage.  This may be left unchanged.";

  const inputFields = {
    panelSizeProactive: [
      ['Panel Size', 'panelSizeProactive'],
      ['Hospital Cost Offset', 'hospitalCostOffset'],
    ]
  };

  return (
    <form>
      <div className="panel">
        <h3>{window.DEBUG ? 'PanelSizeProactive.js' : 'Proactive Panel Size'}
          <Tooltip tooltipText={tipText} ></Tooltip>
        </h3>
        <table>
          <tbody>
          {renderTableRows(inputFields.panelSizeProactive, inputs, handleChange)}
          </tbody>
        </table>
      </div>
    </form>
  );
};

export default PanelSizeProactive;
