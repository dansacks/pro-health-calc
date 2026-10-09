// src/components/TeamBaseline.js
import React from 'react';
import { renderTableRows, calculateSum, handleChangeFactory } from '../../helpers/Forms';
import Tooltip from './Tooltip';

const TeamBaseline = ({ inputs, setInputs }) => {
  const handleChange = handleChangeFactory(setInputs);

  const tooltipTexts = {
    familyMedicineDoctorBaseline: '<b>Primary Care Physician</b> – Clinician who is assigned to a panel of patients, responsible for their acute, chronic and preventive care needs during and between visits.',
    npPaBaseline: '<b>Advance Practice Clinician(APC), Nurse Practitioner(NP) or Physician Assistant(PA)</b> - Who see patients for visits for acute, chronic and preventive care.',
    medicalAssistantBaseline: '<b>Medical Assistant</b> – Medical Assistant or Licensed Practicing Nurse, responsible for patient rooming and clinician visit needs, allied health visits (eg immunizations, suture removal, BP check) and addressing patient care questions that do not require triage.',
    rnBaseline: '<b>Registered Nurse</b> - Nurses who provide phone triage of patient concerns and provide care in the office beyond the scope of a medical assistant including IV placement, anticoagulation management and some acute care visits.',
    athleticTrainerBaseline: '<b>Athletic Trainer</b> - Provide care in collaboration with a physician for acute injuries including evaluation and treatment. Help with injury prevention and wellness promotion.  Can provide services overlapping with medical assistants.',
    pharmacistBaseline: '<b>Pharmacist</b> - Assists patients and clinicians with medication needs including prior authorizations, medication reviews and medication de-escalation.  Additionally can see patients for visits for certain chronic conditions such as hypertension or diabetes with medication titration.',
    healthCareSocialWorkerBaseline: '<b>Health Care Social Worker</b> - Assists patients with various care needs including advance care planning, insurance and cost of care issues, food insecurity, housing insecurity and social determinants of health.',
    mentalHealthProfessionalBaseline: '<b>Health Professional</b> - Psychologist, Clincial Social Worker or other trained clinician who provides mental health therapy care in the primacy care environment, typically including warm handoff from clinician visits and shorter term follow up.',
    clericalStaffBaseline: '<b>Clerical Staff</b> - Front office staff who greet and check in patients, check out patients after visits, take calls, schedule visits, assist with referrals, manage paper forms.',
    communityHealthWorkerBaseline: '<b>Community Health Worker</b> - Staff member who engages with patients in the community in addition to the clinical space. Connects patients with community resources and supports.  Helps patients to navigate the care system and appropriate resources.  Provide health coaching and support.',
  };

  const inputFields = {
    teamBaseline: [
      ['Primary Care Physician', 'familyMedicineDoctorBaseline', tooltipTexts.familyMedicineDoctorBaseline],
      ['APC, NP, or PA', 'npPaBaseline', tooltipTexts.npPaBaseline],
      ['Medical Assistant', 'medicalAssistantBaseline', tooltipTexts.medicalAssistantBaseline],
      ['Registered Nurse', 'rnBaseline', tooltipTexts.rnBaseline],
      ['Athletic Trainer', 'athleticTrainerBaseline', tooltipTexts.athleticTrainerBaseline],
      ['Pharmacist', 'pharmacistBaseline', tooltipTexts.pharmacistBaseline],
      ['Healthcare Social Worker', 'healthCareSocialWorkerBaseline', tooltipTexts.healthCareSocialWorkerBaseline],
      ['Mental Health Professional', 'mentalHealthProfessionalBaseline', tooltipTexts.mentalHealthProfessionalBaseline],
      ['Clerical Staff', 'clericalStaffBaseline', tooltipTexts.clericalStaffBaseline],
      ['Community Health Worker', 'communityHealthWorkerBaseline', tooltipTexts.communityHealthWorkerBaseline],

    ],
  };

  return (
    <form>
      <div className="panel">
        <h3>{window.DEBUG ? 'TeamBaseline.js' : 'Current Team FTEs, by Role'}
        </h3>
        <table>
          <tbody>
            {renderTableRows(inputFields.teamBaseline, inputs, handleChange)}
          </tbody>
        </table>
      </div>
    </form>
  );
};

export default TeamBaseline;
