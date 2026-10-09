// src/components/hospital_spend/HospitalSpend.js
import React from 'react';

const HospitalSpend = ({inputs, setInputs, fixed, setFixed}, ) => {

  return (
    <div className="panel">
      <h1>HospitalSpend Worksheet</h1>

      <table>
        <tbody>
        <tr>
          <th></th>
          <th>Age Group</th>
          <th>Hospital Costs</th>
          <th>Population</th>
          <th>Share</th>
        </tr>
        <tr>
          <th></th>
          <td>0-18</td>
          <td>{fixed.hospitalCost0_18}</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th></th>
          <td>19-44</td>
          <td>{fixed.hospitalCost19_44}</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th></th>
          <td>45-64</td>
          <td>{fixed.hospitalCost45_64}</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th></th>
          <td>65+</td>
          <td>{fixed.hospitalCost65_plus}</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th></th>
          <td>All</td>
          <td>{fixed.hospitalCostAll}</td>
          <td></td>
          <td></td>
        </tr>

        <tr>
          <th colSpan={5}></th>
        </tr>

        <tr>
          <th>0</th>
          <td>365121921</td>
          <td>685.5533</td>
          <td>130.918</td>
          <td>554.6353</td>
        </tr>
        <tr>
          <th>19</th>
          <td>450576687</td>
          <td>1324.44</td>
          <td>247.4347</td>
          <td>1077.006</td>
        </tr>
        <tr>
          <th>45</th>
          <td>386916272</td>
          <td>2335.109</td>
          <td>320.718</td>
          <td>2014.39</td>
        </tr>
        <tr>
          <th>66 (65?)</th>
          <td>236637024</td>
          <td>3812.974</td>
          <td>299.3261</td>
          <td>3513.648</td>
        </tr>

        <tr>
          <th colSpan={5}></th>
        </tr>

        <tr>
          <th></th>
          <td>Adjustment Factor</td>
          <td>0</td>
          <td></td>
          <td></td>
        </tr>

        <tr>
          <th colSpan={5}></th>
        </tr>


        <tr>
          <th></th>
          <td>Implied Cost (hosp_cost)</td>
          <td>258.6326692</td>
          <td></td>
          <td></td>
        </tr>

        <tr>
          <th></th>
          <td>Entered Cost (hosp_cost_input / hospitalizationCosts)</td>
          <td>{inputs.hospitalizationCosts}</td>
          <td></td>
          <td></td>
        </tr>
        </tbody>
      </table>
    </div>


  );
};
export default HospitalSpend
