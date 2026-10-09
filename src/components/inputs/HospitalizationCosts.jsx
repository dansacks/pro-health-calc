// src/components/HospitalizationCosts.js
import React from 'react';
import { renderTableRows, handleChangeFactory } from '../../helpers/Forms';
import Tooltip from "./Tooltip";

const HospitalizationCosts = ({ inputs, setInputs }) => {
  const handleChange = handleChangeFactory(setInputs);

  const inputFields = {
    hospitalizationCosts: [['Baseline Hospital and ED spend', 'hospitalizationCosts']],
  };

  const tipText = "Hospital and ED spending for patients in the typical panel, average per member-month. " +
      "Include patients with zero hospital/ED spend in determining the average.";

  return (
    <form>
      <div className="panel">
        <h3>{window.DEBUG ? 'HospitalizationCosts.js' : 'Age Mix Alternative: Patient Hospitalization Costs'}
          <Tooltip tooltipText={tipText} ></Tooltip>
        </h3>
        <table>
          <tbody>
            {renderTableRows(inputFields.hospitalizationCosts, inputs, handleChange)}
          </tbody>
        </table>
      </div>
    </form>
  );
};

export default HospitalizationCosts;
