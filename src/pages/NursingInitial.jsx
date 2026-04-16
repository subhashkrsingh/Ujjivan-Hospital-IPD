import React, { useEffect, useMemo, useState } from 'react';
import BradenScaleTable from '../components/BradenScaleTable';

const NursingInitial = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    uhid: '',
    ipd: '',
    ageSex: '',
    bedNo: '',
    doa: '',
    patientAccompanied: '',
    accompaniedName: '',
    accompaniedRelation: '',
    accompaniedContact: '',
    primaryLanguage: '',
    languageOther: '',
    idBandColor: '',
    vulnerable: '',
    patientStatus: '',
    psychologicalStatus: '',
    temperature: '',
    pulse: '',
    respiration: '',
    otherVital: '',
    painPresent: '',
    painScore: '',
    painFrequency: '',
    painType: '',
    painLocation: '',
    painAction: '',
    orientPatientConscious: false,
    orientAttendantUnconscious: false,
    orientAttendantDisoriented: false,
    facilityRoom: false,
    facilityWashroom: false,
    facilityVisiting: false,
    facilityTV: false,
    facilitySmoking: false,
    facilityCrab: false,
    facilityExit: false,
    facilityDietary: false,
    facilityGrievance: false,
    facilityDoctor: false,
    facilityRights: false,
    allergies: '',
    skinCheck: '',
    ivLine: '',
    fallHistory: '',
    secondaryDiagnosis: '',
    ambulatoryAid: '',
    ivHeparin: '',
    gait: '',
    mentalStatus: '',
    assessmentDate: '',
    nurseName: '',
    orderDatetime: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [bradenScores, setBradenScores] = useState(() => Array(6).fill(0));

  const fallRiskTotal = useMemo(() => {
    return [
      formData.fallHistory,
      formData.secondaryDiagnosis,
      formData.ambulatoryAid,
      formData.ivHeparin,
      formData.gait,
      formData.mentalStatus
    ].reduce((sum, value) => sum + Number(value || 0), 0);
  }, [formData]);

  const fallRiskInterpretation = useMemo(() => {
    if (fallRiskTotal > 45) return 'High Risk - Patient Family should be informed';
    if (fallRiskTotal > 24) return 'Medium Risk';
    return 'Low Risk';
  }, [fallRiskTotal]);

  const shouldShowBradenScale = formData.skinCheck !== '';

  useEffect(() => {
    if (formData.patientAccompanied !== 'yes') {
      setFormData((prev) => ({
        ...prev,
        accompaniedName: '',
        accompaniedRelation: '',
        accompaniedContact: ''
      }));
    }
  }, [formData.patientAccompanied]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const fields = [
      'patientName',
      'uhid',
      'ipd',
      'ageSex',
      'bedNo',
      'doa',
      'primaryLanguage',
      'vulnerable',
      'patientStatus',
      'psychologicalStatus',
      'allergies',
      'skinCheck',
      'ivLine',
      'assessmentDate',
      'nurseName'
    ];

    const newErrors = {};
    fields.forEach((field) => {
      if (!formData[field]?.toString().trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    if (formData.patientAccompanied === 'yes') {
      ['accompaniedName', 'accompaniedRelation', 'accompaniedContact'].forEach((field) => {
        if (!formData[field]?.toString().trim()) {
          newErrors[field] = 'Required when patient is accompanied';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSuccessMessage('Nursing assessment submitted successfully!');
    setTimeout(() => {
      setSuccessMessage('');
    }, 8000);
  };

  return (
    <div className="container mt-4 mb-4">
      <div className="form-container">
        <div className="hospital-header">
          <div className="hospital-name">UJJIVAN HOSPITAL</div>
          <div className="hospital-address">PO. Vidyut Nagar, Distt. Gautam Budh Nagar</div>
        </div>

        {successMessage && (
          <div className="response-message success" style={{ display: 'block', marginBottom: '20px' }}>
            {successMessage}
          </div>
        )}

        <div className="patient-header">
          <div className="patient-info-grid">
            {[
              { label: 'PATIENT NAME', name: 'patientName', placeholder: 'Enter Patient Full Name' },
              { label: 'UHID NO.', name: 'uhid', placeholder: 'Unique Health ID Number' },
              { label: 'IPD NO.', name: 'ipd', placeholder: 'In-Patient Department Number' },
              { label: 'AGE/SEX', name: 'ageSex', placeholder: 'e.g., 35/M or 42/F' },
              { label: 'BED NO.', name: 'bedNo', placeholder: 'Bed/Ward Number' },
              { label: 'D.O.A', name: 'doa', type: 'date' }
            ].map((item) => (
              <div key={item.name} className="patient-info-item">
                <label className="patient-info-label required">{item.label}</label>
                <input
                  type={item.type || 'text'}
                  name={item.name}
                  value={formData[item.name]}
                  onChange={handleChange}
                  className="patient-info-input"
                  placeholder={item.placeholder}
                />
                {errors[item.name] && <div className="error-message" style={{ display: 'block' }}>{errors[item.name]}</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="form-title">NURSING INITIAL ASSESSMENT</div>

        <form id="nursingAssessmentForm" onSubmit={handleSubmit}>
          <table className="assessment-table">
            <tbody>
              <tr>
                <th>Patient Accompanied : Yes / No</th>
                <td>
                  <div className="checkbox-group">
                    {['yes', 'no'].map((value) => (
                      <div key={value} className="checkbox-item">
                        <input
                          type="radio"
                          id={`accompanied_${value}`}
                          name="patientAccompanied"
                          value={value}
                          checked={formData.patientAccompanied === value}
                          onChange={handleChange}
                        />
                        <label htmlFor={`accompanied_${value}`}>{value === 'yes' ? 'Yes' : 'No'}</label>
                      </div>
                    ))}
                  </div>

                  {formData.patientAccompanied === 'yes' && (
                    <div className="accompanied-fields" style={{ display: 'block' }}>
                      <h6>Accompanying Person Details:</h6>
                      <div className="row">
                        <div className="col-md-4 accompanied-field">
                          <label>Name:</label>
                          <input
                            type="text"
                            className="accompanied-input"
                            name="accompaniedName"
                            value={formData.accompaniedName}
                            onChange={handleChange}
                            placeholder="Enter person's name"
                          />
                          {errors.accompaniedName && <div className="error-message" style={{ display: 'block' }}>{errors.accompaniedName}</div>}
                        </div>
                        <div className="col-md-4 accompanied-field">
                          <label>Relation:</label>
                          <input
                            type="text"
                            className="accompanied-input"
                            name="accompaniedRelation"
                            value={formData.accompaniedRelation}
                            onChange={handleChange}
                            placeholder="Relation to patient"
                          />
                          {errors.accompaniedRelation && <div className="error-message" style={{ display: 'block' }}>{errors.accompaniedRelation}</div>}
                        </div>
                        <div className="col-md-4 accompanied-field">
                          <label>Contact No:</label>
                          <input
                            type="tel"
                            className="accompanied-input"
                            name="accompaniedContact"
                            value={formData.accompaniedContact}
                            onChange={handleChange}
                            placeholder="Phone number"
                          />
                          {errors.accompaniedContact && <div className="error-message" style={{ display: 'block' }}>{errors.accompaniedContact}</div>}
                        </div>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <th>Primary Language : Hindi / English / Local / Other</th>
                <td>
                  <div className="checkbox-group">
                    {[
                      { value: 'hindi', label: 'Hindi' },
                      { value: 'english', label: 'English' },
                      { value: 'local', label: 'Local' },
                      { value: 'other', label: 'Other' }
                    ].map((item) => (
                      <div key={item.value} className="checkbox-item">
                        <input
                          type="radio"
                          name="primaryLanguage"
                          id={`lang_${item.value}`}
                          value={item.value}
                          checked={formData.primaryLanguage === item.value}
                          onChange={handleChange}
                        />
                        <label htmlFor={`lang_${item.value}`}>{item.label}</label>
                      </div>
                    ))}
                    {formData.primaryLanguage === 'other' && (
                      <input
                        type="text"
                        className="form-input form-input-medium"
                        name="languageOther"
                        value={formData.languageOther}
                        onChange={handleChange}
                        placeholder="Specify"
                        style={{ marginLeft: '10px' }}
                      />
                    )}
                  </div>
                  {errors.primaryLanguage && <div className="error-message" style={{ display: 'block' }}>{errors.primaryLanguage}</div>}
                </td>
              </tr>
              <tr>
                <th>ID Band Color : _____</th>
                <td>
                  <input
                    type="text"
                    className="form-input form-input-large"
                    name="idBandColor"
                    value={formData.idBandColor}
                    onChange={handleChange}
                    placeholder="Enter color"
                  />
                </td>
              </tr>
              <tr>
                <th>Vulnerable : Yes / No</th>
                <td>
                  <div className="checkbox-group">
                    {['yes', 'no'].map((value) => (
                      <div key={value} className="checkbox-item">
                        <input
                          type="radio"
                          name="vulnerable"
                          id={`vulnerable_${value}`}
                          value={value}
                          checked={formData.vulnerable === value}
                          onChange={handleChange}
                        />
                        <label htmlFor={`vulnerable_${value}`}>{value === 'yes' ? 'Yes' : 'No'}</label>
                      </div>
                    ))}
                  </div>
                  {errors.vulnerable && <div className="error-message" style={{ display: 'block' }}>{errors.vulnerable}</div>}
                </td>
              </tr>
              <tr>
                <th>Patient Status : Conscious / Unconscious / Disoriented</th>
                <td>
                  <div className="checkbox-group">
                    {[
                      { value: 'conscious', label: 'Conscious' },
                      { value: 'unconscious', label: 'Unconscious' },
                      { value: 'disoriented', label: 'Disoriented' }
                    ].map((item) => (
                      <div key={item.value} className="checkbox-item">
                        <input
                          type="radio"
                          name="patientStatus"
                          id={`status_${item.value}`}
                          value={item.value}
                          checked={formData.patientStatus === item.value}
                          onChange={handleChange}
                        />
                        <label htmlFor={`status_${item.value}`}>{item.label}</label>
                      </div>
                    ))}
                  </div>
                  {errors.patientStatus && <div className="error-message" style={{ display: 'block' }}>{errors.patientStatus}</div>}
                </td>
              </tr>
              <tr>
                <th>Psychological Status : Calm / Agitated / Depressed / Sleeping Difficulty</th>
                <td>
                  <div className="checkbox-group">
                    {[
                      { value: 'calm', label: 'Calm' },
                      { value: 'agitated', label: 'Agitated' },
                      { value: 'depressed', label: 'Depressed' },
                      { value: 'sleeping_difficulty', label: 'Sleeping Difficulty' }
                    ].map((item) => (
                      <div key={item.value} className="checkbox-item">
                        <input
                          type="radio"
                          name="psychologicalStatus"
                          id={`psych_${item.value}`}
                          value={item.value}
                          checked={formData.psychologicalStatus === item.value}
                          onChange={handleChange}
                        />
                        <label htmlFor={`psych_${item.value}`}>{item.label}</label>
                      </div>
                    ))}
                  </div>
                  {errors.psychologicalStatus && <div className="error-message" style={{ display: 'block' }}>{errors.psychologicalStatus}</div>}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="section-title">Vital Signs</div>
          <div className="vitals-grid">
            {[
              { name: 'temperature', label: 'Temperature (°C)' },
              { name: 'pulse', label: 'Pulse (BPM)' },
              { name: 'respiration', label: 'Respiration (RPM)' },
              { name: 'SPo2', label: 'SPo2' },
              { name: 'otherVital', label: 'Other' }
            ].map((item) => (
              <div key={item.name}>
                <label className="form-label">{item.label}</label>
                <input
                  type="text"
                  className="form-input"
                  name={item.name}
                  value={formData[item.name]}
                  onChange={handleChange}
                  placeholder={`Enter ${item.label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>

          <div className="section-title">Pain Assessment</div>
          <table className="assessment-table">
            <tbody>
              <tr>
                <th>Pain Assessment : Yes / No, If Yes, Score (0-5): _____ Frequency : _____ Type : Sharp/Dull/Aching/Throbbing</th>
                <td>
                  <div className="inline-input-group">
                    {['yes', 'no'].map((value) => (
                      <div key={value} className="checkbox-item">
                        <input
                          type="radio"
                          name="painPresent"
                          id={`pain_${value}`}
                          value={value}
                          checked={formData.painPresent === value}
                          onChange={handleChange}
                        />
                        <label htmlFor={`pain_${value}`}>{value === 'yes' ? 'Yes' : 'No'}</label>
                      </div>
                    ))}
                    <span>Score:</span>
                    <input
                      type="text"
                      className="form-input form-input-small"
                      name="painScore"
                      value={formData.painScore}
                      onChange={handleChange}
                      placeholder="0-5"
                    />
                    <span>Frequency:</span>
                    <input
                      type="text"
                      className="form-input form-input-small"
                      name="painFrequency"
                      value={formData.painFrequency}
                      onChange={handleChange}
                      placeholder="How often"
                    />
                    <span>Type:</span>
                    <input
                      type="text"
                      className="form-input form-input-medium"
                      name="painType"
                      value={formData.painType}
                      onChange={handleChange}
                      placeholder="Sharp/Dull/etc"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <th>Location Of Pain</th>
                <td>
                  <input
                    type="text"
                    className="form-input"
                    name="painLocation"
                    value={formData.painLocation}
                    onChange={handleChange}
                    placeholder="Where is the pain?"
                  />
                </td>
              </tr>
              <tr>
                <th>Action Needed : Yes / No</th>
                <td>
                  <div className="checkbox-group">
                    {['yes', 'no'].map((value) => (
                      <div key={value} className="checkbox-item">
                        <input
                          type="radio"
                          name="painAction"
                          id={`action_${value}`}
                          value={value}
                          checked={formData.painAction === value}
                          onChange={handleChange}
                        />
                        <label htmlFor={`action_${value}`}>{value === 'yes' ? 'Yes' : 'No'}</label>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="section-title">Orientation</div>
          <div className="checkbox-group">
            {[
              { name: 'orientPatientConscious', label: 'Orient Patient If Conscious' },
              { name: 'orientAttendantUnconscious', label: 'Orient Attendant If Unconscious' },
              { name: 'orientAttendantDisoriented', label: 'Orient Attendant If Disoriented' }
            ].map((item) => (
              <div key={item.name} className="checkbox-item">
                <input
                  type="checkbox"
                  name={item.name}
                  checked={formData[item.name]}
                  onChange={handleChange}
                />
                <label>{item.label}</label>
              </div>
            ))}
          </div>

          <hr className="my-4" />

          <div className="section-title">Facilities Orientation</div>
          <div className="facilities-grid">
            {[
              { name: 'facilityRoom', label: 'Room' },
              { name: 'facilityWashroom', label: 'Washroom' },
              { name: 'facilityVisiting', label: 'Visiting Policy' },
              { name: 'facilityTV', label: 'Television' },
              { name: 'facilitySmoking', label: 'Smoking Policy' },
              { name: 'facilityCrab', label: 'Crab Bars' },
              { name: 'facilityExit', label: 'Emergency Exit' },
              { name: 'facilityDietary', label: 'Dietary Services' },
              { name: 'facilityGrievance', label: 'Grievance Handling' },
              { name: 'facilityDoctor', label: 'Doctor\'s Visiting Timings' },
              { name: 'facilityRights', label: 'Patient Rights & Responsibilities' }
            ].map((item) => (
              <div key={item.name} className="checkbox-item">
                <input
                  type="checkbox"
                  name={item.name}
                  checked={formData[item.name]}
                  onChange={handleChange}
                />
                <label>{item.label}</label>
              </div>
            ))}
          </div>

          <hr className="my-4" />

          <div className="section-title">Allergies / Adverse Reactions</div>
          <div className="checkbox-group">
            {[
              { value: 'known', label: 'Known' },
              { value: 'not_known', label: 'Not Known' }
            ].map((item) => (
              <div key={item.value} className="checkbox-item">
                <input
                  type="radio"
                  name="allergies"
                  id={`allergies_${item.value}`}
                  value={item.value}
                  checked={formData.allergies === item.value}
                  onChange={handleChange}
                />
                <label htmlFor={`allergies_${item.value}`}>{item.label}</label>
              </div>
            ))}
          </div>
          {errors.allergies && <div className="error-message" style={{ display: 'block' }}>{errors.allergies}</div>}

          <div className="section-title" style={{ marginTop: '20px' }}>Skin Assessment</div>
          <div className="inline-input-group">
            <div className="checkbox-item">
              <label>Checked for Bed Sore / Redness of Skin:</label>
              <select
                name="skinCheck"
                className="form-input form-input-medium"
                value={formData.skinCheck}
                onChange={handleChange}
                style={{ marginLeft: '10px' }}
              >
                <option value="">Select</option>
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </div>
            <div className="checkbox-item">
              <label>IV Line Started:</label>
              <select
                name="ivLine"
                className="form-input form-input-medium"
                value={formData.ivLine}
                onChange={handleChange}
                style={{ marginLeft: '10px' }}
              >
                <option value="">Select</option>
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </div>
          </div>
          {errors.skinCheck && <div className="error-message" style={{ display: 'block' }}>{errors.skinCheck}</div>}
          {errors.ivLine && <div className="error-message" style={{ display: 'block' }}>{errors.ivLine}</div>}

          {shouldShowBradenScale && (
            <BradenScaleTable
              initialScores={bradenScores}
              onScoresChange={setBradenScores}
            />
          )}

          <div className="section-title" style={{ marginTop: '25px' }}>Fall Risk Assessment (Modified Morse Scale)</div>
          <table className="fall-risk-table">
            <thead>
              <tr>
                <th>S. No.</th>
                <th>Parameter</th>
                <th>Value</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'History of Falling', name: 'fallHistory' },
                { label: 'Secondary Diagnosis', name: 'secondaryDiagnosis' },
                { label: 'Ambulatory Aid', name: 'ambulatoryAid' },
                { label: 'IV / Heparin Lock', name: 'ivHeparin' },
                { label: 'Gait', name: 'gait' },
                { label: 'Mental Status', name: 'mentalStatus' }
              ].map((item, index) => (
                <tr key={item.name}>
                  <td>{index + 1}</td>
                  <td>{item.label}</td>
                  <td>
                    <select
                      name={item.name}
                      className="form-input"
                      value={formData[item.name]}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      {item.name === 'fallHistory' && [
                        { value: '0', label: 'No = 0' },
                        { value: '25', label: 'Yes = 25' }
                      ].map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                      {item.name === 'secondaryDiagnosis' && [
                        { value: '0', label: 'No = 0' },
                        { value: '15', label: 'Yes = 15' }
                      ].map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                      {item.name === 'ambulatoryAid' && [
                        { value: '0', label: 'Bed Rest / Nurse Assist = 0' },
                        { value: '15', label: 'Crutches / Walker / Wheel Chair = 15' },
                        { value: '30', label: 'Furniture / Complete Bed Rest = 30' }
                      ].map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                      {item.name === 'ivHeparin' && [
                        { value: '0', label: 'No = 0' },
                        { value: '20', label: 'Yes = 20' }
                      ].map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                      {item.name === 'gait' && [
                        { value: '0', label: 'Normal / Bed Rest / Wheel Chair = 0' },
                        { value: '10', label: 'Weak = 10' },
                        { value: '20', label: 'Impaired = 20' }
                      ].map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                      {item.name === 'mentalStatus' && [
                        { value: '0', label: 'Oriented to Own Ability = 0' },
                        { value: '15', label: 'Forgets Limitations = 15' }
                      ].map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={Number(formData[item.name] || 0)}
                      readOnly
                      className="score-input"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="score-section">
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold">Total Score:</label>
                  <input
                    type="text"
                    className="form-input total-score-input"
                    value={fallRiskTotal}
                    readOnly
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold">Interpretation:</label>
                  <input
                    type="text"
                    className="form-input interpretation-input"
                    value={fallRiskInterpretation}
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="alert alert-info">
              <strong>Interpretation Guidelines:</strong> 0-24 = Low Risk, 25-45 = Medium Risk, 45+ = High Risk<br />
              <strong>Note:</strong> If score &gt; 24, Patient Family should be informed about fall risk and precautions
            </div>
          </div>

          <div className="signature-section">
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label required">Date</label>
                <input
                  type="date"
                  name="assessmentDate"
                  className="form-input"
                  value={formData.assessmentDate}
                  onChange={handleChange}
                />
                {errors.assessmentDate && <div className="error-message" style={{ display: 'block' }}>{errors.assessmentDate}</div>}
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label required">Name of the Nurse</label>
                <input
                  type="text"
                  name="nurseName"
                  className="form-input"
                  value={formData.nurseName}
                  onChange={handleChange}
                  placeholder="Enter Nurse Name"
                />
                {errors.nurseName && <div className="error-message" style={{ display: 'block' }}>{errors.nurseName}</div>}
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label required">Signature</label>
                <div className="signature-line"></div>
              </div>
            </div>
          </div>

          <div className="alert alert-light border mt-4">
            <strong>Note:</strong> All orders must be legible.
            <strong>Date & Time:</strong>
            <input
              type="datetime-local"
              name="orderDatetime"
              className="form-input"
              style={{ width: '250px', display: 'inline-block' }}
              value={formData.orderDatetime}
              onChange={handleChange}
            />
          </div>

          <div className="submit-section">
            <button type="submit" className="btn-submit">
              Submit Nursing Assessment
            </button>
            <button type="button" className="btn" onClick={() => window.print()} style={{ marginLeft: '10px' }}>
              Print Form
            </button>
            <p className="mt-2 text-muted">Please ensure all required fields (marked with *) are filled before submission</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NursingInitial;
