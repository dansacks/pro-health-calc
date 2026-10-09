// src/components/NonLaborCosts.js
import React from 'react';
import { renderTableRows, calculateSum, handleChangeFactory } from '../../helpers/Forms';

const NonLaborCosts = ({ inputs, setInputs }) => {
  const handleChange = handleChangeFactory(setInputs);

  const inputFields = {
    nonLaborCosts: [
      // ['Facilities Costs', 'facilitiesCosts'],
      ['Cost per patient',    'costPerPatient']
    ],
  };

  return (
    <form>
      <div className="panel">
        <h3>{window.DEBUG ? 'NonLaborCosts.js' : 'Non-Labor Costs (Annual)'}</h3>
        <table>
          <tbody>
            {renderTableRows(inputFields.nonLaborCosts, inputs, handleChange)}
          </tbody>
        </table>
      </div>
    </form>
  );
};

export default NonLaborCosts;
