// src/components/PatientAgeMix.js
import React from 'react';
import { renderTableRows, calculateSum, handleChangeFactory } from '../../helpers/Forms';
import Tooltip from './Tooltip';

const PatientAgeMix = ({ inputs, setInputs }) => {
  const handleChange = handleChangeFactory(setInputs);

  const tipText = "0 to 18: Percent of patients in the typical panel aged 0 to 18\n" +
      "19 to 44: Percent of patients in the typical panel aged 19 to 44\n" +
      "45 to 64: Percent of patients in the typical panel aged 45 to 64\n" +
      "65+: Percent of patients in the typical panel aged 65 and older";

  const inputFields = {
    patientAgeMix: [
      ['0 to 18',     'age0_18'],
      ['19 to 44',    'age19_44'],
      ['45 to 64',    'age45_64'],
      ['65+',  'age65_plus']
    ],
  };

  return (
    <form>
      <div className="panel">
        <h3>{window.DEBUG ? 'PatientAgeMix.js' : 'Patient Age Mix'}
          <Tooltip tooltipText={tipText} ></Tooltip>
        </h3>
        <table>
          <tbody>
            {renderTableRows(inputFields.patientAgeMix, inputs, handleChange)}
          </tbody>
          <tfoot>
          <tr>
            <th>Sum</th>
            <td>{calculateSum(inputFields.patientAgeMix.map(([_, field]) => field), inputs)}</td>
          </tr>
          </tfoot>
        </table>
      </div>
    </form>
  );
};

export default PatientAgeMix;
