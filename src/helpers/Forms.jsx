// src/helpers/Forms.js
import React from 'react';
import Tooltip from '../components/inputs/Tooltip';

export const renderTableRows = (fields, inputs, handleChange) => {
  return fields.map(([label, field, tooltipText]) => {
    const displayLabel = window.DEBUG ? field : label;
    return (
      <tr key={field}>
        <th>{displayLabel}
          {tooltipText && <Tooltip tooltipText={tooltipText} />}
        </th>
        <td>
          <input
            type="number"
            name={field}
            value={inputs[field]}
            onChange={handleChange}
          />
        </td>
      </tr>
    );
  });
};


export const calculateSum = (fields, inputs) => {
  return fields.reduce((sum, field) => sum + inputs[field], 0).toFixed(2);
};


export const handleChangeFactory = (setInputs) => (e) => {
  const { name, value } = e.target;
  const numericValue = parseFloat(value) || 0;
  setInputs((prevInputs) => ({
    ...prevInputs,
    [name]: numericValue,
  }));
};
