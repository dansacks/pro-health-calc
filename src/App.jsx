// src/App.jsx
import React, { useState } from 'react';
import './App.css';
import { DEFAULT_INPUTS, calculateOutputs } from './calculations';

// Inputs
import BenefitRates         from './components/inputs/BenefitRates';
import HospitalizationCosts from './components/inputs/HospitalizationCosts';
import Margin               from './components/inputs/Margin';
import NonLaborCosts        from './components/inputs/NonLaborCosts';
import PanelSizeBaseline    from './components/inputs/PanelSizeBaseline';
import PanelSizeProactive   from './components/inputs/PanelSizeProactive';
import PatientAgeMix        from './components/inputs/PatientAgeMix';
import TeamBaseline         from './components/inputs/TeamBaseline';
import TeamProactive        from './components/inputs/TeamProactive';

// Outputs
import Chart                from './components/outputs/Chart';
import BreakEven            from './components/outputs/BreakEven';
import Results              from './components/outputs/Results';

// Hospital Spend Worksheet (DEBUG)
// import HospitalSpend     from './components/hospital_spend/HospitalSpend';
// import panelSizeBaseline from "./components/inputs/PanelSizeBaseline";


function App({ debug = false }) {

  // true shows debugging in the UI and displays variable names instead of the human labels.
  window.DEBUG = debug

  // Inputs With Defaults
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);

  const outputs = calculateOutputs(inputs);

  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    chart: false,
  });

  // Toggle function for collapsible sections
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const [activeTab, setActiveTab] = useState(0);

  // Labels for each tab
  const tabs = [
    'Current Team',
    'Proactive Team',
    'Patient Severity',
    'Financial Information',
  ];

  // Rendering content based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
            <>
              <div className="panel"><p>Enter the target panel size for a PCP, and indicate the total FTE of clinicians and staff of each type</p></div>
                <PanelSizeBaseline inputs={inputs} setInputs={setInputs} />
                <TeamBaseline inputs={inputs} setInputs={setInputs} />
            </>
        );
      case 1:
        return (
            <>
              <div className="panel"><p>Enter the anticipated hospital+ED spending offset from moving to the alternative team, the anticipated
                new panel size, and the total FTE of clinicians and staff of each type in the alternative team</p></div>
              <PanelSizeProactive inputs={inputs} setInputs={setInputs} />
              <TeamProactive inputs={inputs} setInputs={setInputs} />
            </>
        );

      case 2:
        return (
            <>
              <div className="panel"><p>Provide information on <b>EITHER</b> hospital and ED spending under the baseline team (if known), or
                the age distribution of patients in the typical patients</p></div>
              <HospitalizationCosts inputs={inputs} setInputs={setInputs} />
              <PatientAgeMix inputs={inputs} setInputs={setInputs} />
            </>
        );
      case 3:
        return (
            <>
              <div className="panel"><p>Enter some additional financial information about the primary care practice if you want to change
                from the defaults to make the calculations more specific to your context</p></div>
              <NonLaborCosts inputs={inputs} setInputs={setInputs} />
              <Margin inputs={inputs} setInputs={setInputs} />
              <BenefitRates inputs={inputs} setInputs={setInputs} />
            </>
        );

      default:
        return null;
    }
  };

  // Handlers for the Next and Previous buttons
  const handleNext = () => {
    if (activeTab < tabs.length - 1) {
      setActiveTab(activeTab + 1);
    }
  };

  const handlePrevious = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <h1>Financial Summary</h1>
        </div>

        <div>
          <Results inputs={inputs} outputs={outputs} />
          <BreakEven outputs={outputs} />
          <div className="expandable-section">
            <h3 onClick={() => toggleSection('chart')}
                className={`expand-collapse-icon ${expandedSections.chart ? "expanded" : "collapsed"}`}>
              Graph {expandedSections.chart ? "▼" : "►"}
            </h3>
            {expandedSections.chart && (
                <div className="section-content">
                  {expandedSections.chart && <Chart inputs={inputs} outputs={outputs} />}
                </div>
            )}
          </div>
        </div>
        <br/>
      </header>

      <main className="main-content">

        <div className="tab-layout">
          <div className="tabs">
            {tabs.map((tab, index) => (
                <button
                    key={index}
                    onClick={() => setActiveTab(index)}
                    className={activeTab === index ? 'active' : ''}
                >
                  {tab}
                </button>
            ))}
          </div>

          <div className="tab-content-with-arrows">
            <button
                onClick={handlePrevious}
                className="arrow-left"
                disabled={activeTab === 0}
            >
              &#8249; {/* Left arrow */}
            </button>

            <div className="tab-content">
              {renderTabContent()}
            </div>

            <button
                onClick={handleNext}
                className="arrow-right"
                disabled={activeTab === tabs.length - 1}
            >
              &#8250; {/* Right arrow */}
            </button>
          </div>

        </div>
        <br/>

        {/*<h3>Hospital Spend Worksheet (DEBUG)</h3>*/}
        {/*<HospitalSpend inputs={inputs} setInputs={setInputs} fixed={fixed} setFixed={setFixed}  />*/}


        {/*<CurrentTeam inputs={inputs} setInputs={setInputs} />*/}
        {/*<FutureTeam inputs={inputs} setInputs={setInputs} />*/}

        {/*<Results inputs={inputs} outputs={outputs} />*/}
        {/*<BreakEven inputs={inputs} outputs={outputs} />*/}
      </main>
      <footer className="footer">
        <p>Copyright © 2024, UW-Madison</p>
      </footer>
    </div>


  );
}

export default App;
