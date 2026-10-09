// src/components/TeamBaseline.js
import React from 'react';
import { renderTableRows, calculateSum, handleChangeFactory } from '../../helpers/Forms';
import Tooltip from './Tooltip';

const PanelSizeBaseline = ({ inputs, setInputs }) => {
  const handleChange = handleChangeFactory(setInputs);

  const tipText = "This is the panel size currently targeted for PCPs with your current team.";

  const inputFields = {
    panelSizeBaseline: [['Panel Size', 'panelSizeBaseline']],
  };

  return (
    <form>
      <div className="panel">
        <h3>{window.DEBUG ? 'PanelSizeBaseline.js' : 'Current Panel Size'}
          <Tooltip tooltipText={tipText} ></Tooltip>
        </h3>
        <table>
          <tbody>
          {renderTableRows(inputFields.panelSizeBaseline, inputs, handleChange)}
          </tbody>
        </table>
      </div>
    </form>
  );
};

export default PanelSizeBaseline;
