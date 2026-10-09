// src/components/BenefitRates.js
import React from 'react';
import { renderTableRows, calculateSum, handleChangeFactory } from '../../helpers/Forms';
import Tooltip from './Tooltip';

const BenefitRates = ({ inputs, setInputs }) => {
  const handleChange = handleChangeFactory(setInputs);

  const tipText = "The cost of providing benefits (retirement, insurance, etc.), including FICA , as a share of payroll. " +
      "Should be between  0 and 100.";

  const inputFields = {
    benefitRates: [
      ['Benefit Rates Including FICA', 'benefitRates'],
    ],
  };

  return (
      <form>
          <div className="panel">
              <h3>{window.DEBUG ? 'BenefitRates.js' : 'Benefit Rates'}
                  <Tooltip tooltipText={tipText} ></Tooltip>
              </h3>
              <table>
                  <tbody>
                  {renderTableRows(inputFields.benefitRates, inputs, handleChange)}
                  </tbody>
              </table>
          </div>
      </form>
  );
};

export default BenefitRates;
