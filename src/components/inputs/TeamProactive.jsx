// src/components/TeamProactive.js
import React from 'react';
import { renderTableRows, calculateSum, handleChangeFactory } from '../../helpers/Forms';
import Tooltip from "./Tooltip";

const TeamProactive = ({ inputs, setInputs }) => {
  const handleChange = handleChangeFactory(setInputs);

  const tooltipTexts = {
    familyMedicineDoctorProactive: '<b>Primary Care Physician</b> – Clinician who is assigned to a panel of patients, responsible for their acute, chronic and preventive care needs during and between visits.',
    npPaProactive: '<b>Advance Practice Clinician(APC), Nurse Practitioner(NP) or Physician Assistant(PA)</b> - Who see patients for visits for acute, chronic and preventive care.',
    medicalAssistantProactive: '<b>Medical Assistant</b> – Medical Assistant or Licensed Practicing Nurse, responsible for patient rooming and clinician visit needs, allied health visits (eg immunizations, suture removal, BP check) and addressing patient care questions that do not require triage.',
    rnProactive: '<b>Registered Nurse</b> - Nurses who provide phone triage of patient concerns and provide care in the office beyond the scope of a medical assistant including IV placement, anticoagulation management and some acute care visits.',
    athleticTrainerProactive: '<b>Athletic Trainer</b> - Provide care in collaboration with a physician for acute injuries including evaluation and treatment. Help with injury prevention and wellness promotion.  Can provide services overlapping with medical assistants.',
    pharmacistProactive: '<b>Pharmacist</b> - Assists patients and clinicians with medication needs including prior authorizations, medication reviews and medication de-escalation.  Additionally can see patients for visits for certain chronic conditions such as hypertension or diabetes with medication titration.',
    healthCareSocialWorkerProactive: '<b>Health Care Social Worker</b> - Assists patients with various care needs including advance care planning, insurance and cost of care issues, food insecurity, housing insecurity and social determinants of health.',
    mentalHealthProfessionalProactive: '<b>Health Professional</b> - Psychologist, Clincial Social Worker or other trained clinician who provides mental health therapy care in the primacy care environment, typically including warm handoff from clinician visits and shorter term follow up.',
    clericalStaffProactive: '<b>Clerical Staff</b> - Front office staff who greet and check in patients, check out patients after visits, take calls, schedule visits, assist with referrals, manage paper forms.',
    communityHealthWorkerProactive: '<b>Community Health Worker</b> - Staff member who engages with patients in the community in addition to the clinical space. Connects patients with community resources and supports.  Helps patients to navigate the care system and appropriate resources.  Provide health coaching and support.',
  };

  const inputFields = {
    teamProactive: [
      ['Primary Care Physician', 'familyMedicineDoctorProactive', tooltipTexts.familyMedicineDoctorProactive],
      ['APC, NP, or PA', 'npPaProactive', tooltipTexts.npPaProactive],
      ['Medical Assistant', 'medicalAssistantProactive', tooltipTexts.medicalAssistantProactive],
      ['Registered Nurse', 'rnProactive', tooltipTexts.rnProactive],
      ['Athletic Trainer', 'athleticTrainerProactive', tooltipTexts.athleticTrainerProactive],
      ['Pharmacist', 'pharmacistProactive', tooltipTexts.pharmacistProactive],
      ['Healthcare Social Worker', 'healthCareSocialWorkerProactive', tooltipTexts.healthCareSocialWorkerProactive],
      ['Mental Health Professional', 'mentalHealthProfessionalProactive', tooltipTexts.mentalHealthProfessionalProactive],
      ['Clerical Staff', 'clericalStaffProactive', tooltipTexts.clericalStaffProactive],
      ['Community Health Worker', 'communityHealthWorkerProactive', tooltipTexts.communityHealthWorkerProactive],
    ],
  };


  return (
    <form>
      <div className="panel">
        <h3>{window.DEBUG ? 'TeamProactive.js' : 'Proactive Team FTEs, by Role'}
        </h3>
        <table>
          <tbody>
            {renderTableRows(inputFields.teamProactive, inputs, handleChange)}
          </tbody>
        </table>
      </div>
    </form>
  );
};

export default TeamProactive;
