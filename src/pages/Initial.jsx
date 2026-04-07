import React, { useEffect, useState } from 'react';

const Initial = () => {
  const [formData, setFormData] = useState({
    unid: '',
    ipd: '',
    patientName: '',
    age: '',
    gender: '',
    presentIllness: '',
    pastHistory: [],
    bp: '',
    pulse: '',
    temp: '',
    rr: '',
    dehydration: false,
    pallor: false,
    icterus: false,
    jvp: false,
    cyanosis: false,
    clubbing: false,
    edema: false,
    lymphadenopathy: false,
    otherExamination: '',
    systemEvaluation: '',
    diagnosis: '',
    investigations: '',
    treatment: '',
    figure: '',
    rmoName: '',
    rmoSignatureTime: '',
    consultantName: '',
    consultantSignatureTime: '',
    ordersLegible: false
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      unid: `UN${Math.floor(10000 + Math.random() * 90000)}`,
      ipd: `IPD${Math.floor(1000 + Math.random() * 9000)}`
    }));
  }, []);

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

  const handlePastHistoryChange = (name) => {
    setFormData((prev) => {
      const list = prev.pastHistory.includes(name)
        ? prev.pastHistory.filter((item) => item !== name)
        : [...prev.pastHistory, name];
      return { ...prev, pastHistory: list };
    });
  };

  const validate = () => {
    const newErrors = {};
    const requiredFields = [
      'patientName',
      'gender',
      'diagnosis',
      'investigations',
      'treatment',
      'rmoName',
      'rmoSignatureTime',
      'consultantName',
      'consultantSignatureTime'
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]?.toString().trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    if (!formData.ordersLegible) {
      newErrors.ordersLegible = 'Please confirm that orders are legible, dated & signed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setSuccessMessage('Assessment submitted successfully!');
      setIsSubmitting(false);
      setFormData((prev) => ({
        ...prev,
        patientName: '',
        age: '',
        gender: '',
        presentIllness: '',
        pastHistory: [],
        bp: '',
        pulse: '',
        temp: '',
        rr: '',
        dehydration: false,
        pallor: false,
        icterus: false,
        jvp: false,
        cyanosis: false,
        clubbing: false,
        edema: false,
        lymphadenopathy: false,
        otherExamination: '',
        systemEvaluation: '',
        diagnosis: '',
        investigations: '',
        treatment: '',
        figure: '',
        rmoName: '',
        rmoSignatureTime: '',
        consultantName: '',
        consultantSignatureTime: '',
        ordersLegible: false
      }));
      setTimeout(() => setSuccessMessage(''), 8000);
    }, 1200);
  };

  return (
    <div className="container">
      <div className="hospital-header">
        <h1>UJJIVAN HOSPITAL</h1>
        <h2>INITIAL ASSESSMENT SHEET</h2>
        <p>PO. Vidyut Nagar, Distt. Gautam Budh Nagar</p>
        <div className="patient-id-section" style={{ marginTop: '20px' }}>
          <div className="patient-id-group">
            <label htmlFor="unid">UNID No.</label>
            <input type="text" id="unid" name="unid" value={formData.unid} readOnly />
          </div>
          <div className="patient-id-group">
            <label htmlFor="ipd">IPD No.</label>
            <input type="text" id="ipd" name="ipd" value={formData.ipd} readOnly />
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="response-message success" style={{ display: 'block', marginTop: '20px' }}>
          {successMessage}
        </div>
      )}

      <form id="assessmentForm" onSubmit={handleSubmit} className="form-container">
        <div className="form-section">
          <h3 className="section-title">Initial Assessment Sheet</h3>
          <div className="form-group">
            <label htmlFor="patientName" className="required">Patient Name</label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              placeholder="Enter patient's full name"
            />
            {errors.patientName && <div className="error-message" style={{ display: 'block' }}>{errors.patientName}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Years"
                min="0"
                max="150"
              />
            </div>
            <div className="form-group">
              <label htmlFor="gender" className="required">Gender</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <div className="error-message" style={{ display: 'block' }}>{errors.gender}</div>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">History of Present Illness</h3>
          <div className="form-group">
            <textarea
              id="presentIllness"
              name="presentIllness"
              value={formData.presentIllness}
              onChange={handleChange}
              placeholder="Describe the history of present illness..."
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Past History</h3>
          <p>Check all that apply:</p>
          <div className="checkbox-group">
            {[
              { id: 'hypertension', label: 'Hypertension' },
              { id: 'diabetes', label: 'Diabetes' },
              { id: 'ihd', label: 'IHD' },
              { id: 'copd', label: 'COPD' },
              { id: 'tb', label: 'TB' },
              { id: 'dentalCaries', label: 'Dental Caries' },
              { id: 'surgery', label: 'Surgery' },
              { id: 'thyroid', label: 'Thyroid' },
              { id: 'stroke', label: 'Stroke' },
              { id: 'renalFailure', label: 'Renal Failure' }
            ].map((item) => (
              <div key={item.id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={item.id}
                  checked={formData.pastHistory.includes(item.label)}
                  onChange={() => handlePastHistoryChange(item.label)}
                />
                <label htmlFor={item.id}>{item.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">General Physical & Local Examination</h3>
          <div className="vitals-grid">
            {[
              { name: 'bp', label: 'BP (mm/Hg)', placeholder: 'e.g. 120/80' },
              { name: 'pulse', label: 'Pulse (bpm)', placeholder: 'e.g. 72', type: 'number' },
              { name: 'temp', label: 'Temp (°F/°C)', placeholder: 'e.g. 98.6°F' },
              { name: 'rr', label: 'RR (breaths/min)', placeholder: 'e.g. 16', type: 'number' }
            ].map((item) => (
              <div key={item.name} className="vital-item">
                <label htmlFor={item.name}>{item.label}</label>
                <input
                  type={item.type || 'text'}
                  id={item.name}
                  name={item.name}
                  value={formData[item.name]}
                  onChange={handleChange}
                  placeholder={item.placeholder}
                />
              </div>
            ))}
          </div>

          <div className="checkbox-group" style={{ marginTop: '20px' }}>
            {[
              { name: 'dehydration', label: 'Dehydration' },
              { name: 'pallor', label: 'Pallor' },
              { name: 'icterus', label: 'Icterus' },
              { name: 'jvp', label: 'JVP' },
              { name: 'cyanosis', label: 'Cyanosis' },
              { name: 'clubbing', label: 'Clubbing' },
              { name: 'edema', label: 'Edema' },
              { name: 'lymphadenopathy', label: 'Lymphadenopathy' }
            ].map((item) => (
              <div key={item.name} className="checkbox-item">
                <input
                  type="checkbox"
                  id={item.name}
                  name={item.name}
                  checked={formData[item.name]}
                  onChange={handleChange}
                />
                <label htmlFor={item.name}>{item.label}</label>
              </div>
            ))}
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label htmlFor="otherExamination">Other Findings</label>
            <input
              type="text"
              id="otherExamination"
              name="otherExamination"
              value={formData.otherExamination}
              onChange={handleChange}
              placeholder="Any other findings"
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">System Evaluation</h3>
          <div className="form-group">
            <textarea
              id="systemEvaluation"
              name="systemEvaluation"
              value={formData.systemEvaluation}
              onChange={handleChange}
              placeholder="Describe system evaluation findings..."
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Provisional Diagnosis</h3>
          <div className="form-group">
            <textarea
              id="diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="Enter provisional diagnosis..."
            />
            {errors.diagnosis && <div className="error-message" style={{ display: 'block' }}>{errors.diagnosis}</div>}
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Investigations</h3>
          <div className="form-group">
            <textarea
              id="investigations"
              name="investigations"
              value={formData.investigations}
              onChange={handleChange}
              placeholder="Enter investigation details"
            />
            {errors.investigations && <div className="error-message" style={{ display: 'block' }}>{errors.investigations}</div>}
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Treatment</h3>
          <div className="form-group">
            <textarea
              id="treatment"
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
              placeholder="Enter treatment details"
            />
            {errors.treatment && <div className="error-message" style={{ display: 'block' }}>{errors.treatment}</div>}
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Figure (if any)</h3>
          <div className="form-group">
            <input
              type="text"
              id="figure"
              name="figure"
              value={formData.figure}
              onChange={handleChange}
              placeholder="e.g., decimal 0 cm x.00"
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Signatures</h3>
          <div className="signature-container">
            <div className="signature-box">
              <label htmlFor="rmoName" className="required">Name of RMO</label>
              <input
                type="text"
                id="rmoName"
                name="rmoName"
                value={formData.rmoName}
                onChange={handleChange}
                placeholder="Enter RMO name"
              />
              {errors.rmoName && <div className="error-message" style={{ display: 'block' }}>{errors.rmoName}</div>}
            </div>
            <div className="signature-box">
              <label htmlFor="rmoSignatureTime" className="required">Signature of RMO & Time</label>
              <input
                type="text"
                id="rmoSignatureTime"
                name="rmoSignatureTime"
                value={formData.rmoSignatureTime}
                onChange={handleChange}
                placeholder="Signature and time"
              />
              {errors.rmoSignatureTime && <div className="error-message" style={{ display: 'block' }}>{errors.rmoSignatureTime}</div>}
            </div>
          </div>

          <div className="signature-container">
            <div className="signature-box">
              <label htmlFor="consultantName" className="required">Name of Consultant</label>
              <input
                type="text"
                id="consultantName"
                name="consultantName"
                value={formData.consultantName}
                onChange={handleChange}
                placeholder="Enter consultant name"
              />
              {errors.consultantName && <div className="error-message" style={{ display: 'block' }}>{errors.consultantName}</div>}
            </div>
            <div className="signature-box">
              <label htmlFor="consultantSignatureTime" className="required">Signature of Consultant & Time</label>
              <input
                type="text"
                id="consultantSignatureTime"
                name="consultantSignatureTime"
                value={formData.consultantSignatureTime}
                onChange={handleChange}
                placeholder="Signature and time"
              />
              {errors.consultantSignatureTime && <div className="error-message" style={{ display: 'block' }}>{errors.consultantSignatureTime}</div>}
            </div>
          </div>

          <div className="form-group">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="ordersLegible"
                name="ordersLegible"
                checked={formData.ordersLegible}
                onChange={handleChange}
              />
              <label htmlFor="ordersLegible" className="required">I confirm that all orders are legible, dated & signed</label>
            </div>
            {errors.ordersLegible && <div className="error-message" style={{ display: 'block' }}>{errors.ordersLegible}</div>}
          </div>

          <p className="note">All orders must be legible, dated & timed.</p>
        </div>

        <div className="submit-section">
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            <i className="fas fa-file-medical"></i> {isSubmitting ? 'Processing...' : 'Submit Assessment'}
          </button>
          <p className="note" style={{ marginTop: '15px' }}>Form will be saved with current date and time automatically.</p>
        </div>
      </form>
    </div>
  );
};

export default Initial;
