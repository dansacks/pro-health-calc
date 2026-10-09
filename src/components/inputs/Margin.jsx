// src/components/Margin.js
import React from 'react';
import { renderTableRows, handleChangeFactory } from '../../helpers/Forms';
import Tooltip from './Tooltip';

const Margin = ({ inputs, setInputs }) => {
  const handleChange = handleChangeFactory(setInputs);

  const tipText = "The net margin the primary care organization requires for sustainability. Should be between 0 and 100.";

  const inputFields = {
    margin: [['Net Margin', 'margin']],
  };

  return (
    <form>
      <div className="panel">
        <h3>{window.DEBUG ? 'Margin.js' : 'Required Net Margin'}<Tooltip tooltipText={tipText} ></Tooltip></h3>
        <table>
          <tbody>
            {renderTableRows(inputFields.margin, inputs, handleChange)}
          </tbody>
        </table>
      </div>
    </form>
  );
};

export default Margin;
