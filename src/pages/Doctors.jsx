import React, { useState, useEffect } from 'react';

const Doctors = () => {
  const [formData, setFormData] = useState({
    patientId: '',
    caseNumber: '',
    wardNumber: '',
    patientName: '',
    ageSex: '',
    dateTime: '',
    timeMonth: '',
    progressReport: '',
    medicationOrders: '',
    doctorName: '',
    doctorDesignation: '',
    doctorSignature: '',
    doctorDepartment: '',
    ordersLegible: false
  });

  const [responseMessage, setResponseMessage] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Set current date and time
    const now = new Date();
    const currentDateTime = now.toISOString().slice(0, 16);
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const monthName = monthNames[now.getMonth()];

    setFormData(prev => ({
      ...prev,
      dateTime: currentDateTime,
      timeMonth: `${timeString} / ${monthName}`
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-capitalize medication orders
    if (name === 'medicationOrders') {
      setFormData(prev => ({
        ...prev,
        medicationOrders: value.toUpperCase()
      }));
    }
  };

  const validateField = (name, value) => {
    if (!value.trim()) {
      return `${name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
    }

    if (name === 'medicationOrders' && value !== value.toUpperCase()) {
      return 'Medication orders must be in CAPITAL LETTERS';
    }

    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'patientName', 'ageSex', 'dateTime', 'progressReport',
      'medicationOrders', 'doctorName', 'doctorSignature'
    ];

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (!formData.ordersLegible) {
      newErrors.ordersLegible = 'Please confirm that orders are legible, dated & signed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      formDataToSend.append('formType', 'progressSheet');
      formDataToSend.append('hospitalName', 'NCRS HOSPITAL');

      const response = await fetch('save_progress.php', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.text();
      setResponseMessage(result);
    } catch (error) {
      setResponseMessage('Error submitting form');
    }
  };

  return (
    <div className="container">
      {/* Hospital Header */}
      <div className="hospital-header">
        <h1>UJJIVAN HOSPITAL</h1>
        <p>PO. Vidyut Nagar, Distt. Gautam Budh Nagar</p>
        <h2>Doctor's Progress Sheet</h2>

        <div className="patient-id-section">
          <div className="patient-id-group">
            <label htmlFor="patientId">BED NO:</label>
            <input
              type="text"
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              placeholder="Enter BED Number"
            />
          </div>
          <div className="patient-id-group">
            <label htmlFor="caseNumber">UHID No.</label>
            <input
              type="text"
              id="caseNumber"
              name="caseNumber"
              value={formData.caseNumber}
              onChange={handleChange}
              placeholder="Enter UHID Number"
            />
          </div>
          <div className="patient-id-group">
            <label htmlFor="wardNumber">IPD No.</label>
            <input
              type="text"
              id="wardNumber"
              name="wardNumber"
              value={formData.wardNumber}
              onChange={handleChange}
              placeholder="Enter IPD Number"
            />
          </div>
        </div>
      </div>

      {/* Response Message */}
      <div id="responseMessage" className="response-message" style={{ display: responseMessage ? 'block' : 'none' }}>
        {responseMessage}
      </div>

      <form id="progressForm" onSubmit={handleSubmit}>
        {/* Patient Information */}
        <div className="form-section">
          <h3 className="section-title">Patient Information</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="patientName" className="required">Patient Name</label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                placeholder="Enter patient's full name"
                required
              />
              {errors.patientName && <div className="error-message">{errors.patientName}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="ageSex" className="required">Age/Sex</label>
              <input
                type="text"
                id="ageSex"
                name="ageSex"
                value={formData.ageSex}
                onChange={handleChange}
                placeholder="e.g., 35/M or 28/F"
                required
              />
              {errors.ageSex && <div className="error-message">{errors.ageSex}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateTime" className="required">Date/Time</label>
              <input
                type="datetime-local"
                id="dateTime"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleChange}
                required
              />
              {errors.dateTime && <div className="error-message">{errors.dateTime}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="timeMonth">Time/Month</label>
              <input
                type="text"
                id="timeMonth"
                name="timeMonth"
                value={formData.timeMonth}
                onChange={handleChange}
                placeholder="e.g., 10:30 AM / January"
              />
            </div>
          </div>
        </div>

        {/* Progress Report */}
        <div className="form-section">
          <h3 className="section-title">Progress Report</h3>
          <div className="progress-report-box">
            <textarea
              id="progressReport"
              name="progressReport"
              value={formData.progressReport}
              onChange={handleChange}
              placeholder="Enter detailed progress report..."
              required
            />
            {errors.progressReport && <div className="error-message">{errors.progressReport}</div>}
          </div>
        </div>

        {/* Medication Orders */}
        <div className="form-section">
          <h3 className="section-title">Medication Orders</h3>

          <div className="medication-note">
            <strong>IMPORTANT:</strong> Medication orders must be in CAPITAL LETTERS
          </div>

          <div className="medication-orders-box">
            <textarea
              id="medicationOrders"
              name="medicationOrders"
              value={formData.medicationOrders}
              onChange={handleChange}
              className="capital-letters"
              placeholder="ENTER MEDICATION ORDERS IN CAPITAL LETTERS"
              required
            />
            {errors.medicationOrders && <div className="error-message">{errors.medicationOrders}</div>}
          </div>
        </div>

        {/* Doctor Information & Signature */}
        <div className="form-section">
          <h3 className="section-title">Doctor Information & Signature</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="doctorName" className="required">Doctor's Full Name</label>
              <input
                type="text"
                id="doctorName"
                name="doctorName"
                value={formData.doctorName}
                onChange={handleChange}
                placeholder="Enter doctor's full name"
                required
              />
              {errors.doctorName && <div className="error-message">{errors.doctorName}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="doctorDesignation">Designation</label>
              <select
                id="doctorDesignation"
                name="doctorDesignation"
                value={formData.doctorDesignation}
                onChange={handleChange}
              >
                <option value="">Select Designation</option>
                <option value="Consultant">Consultant</option>
                <option value="Senior Resident">Senior Resident</option>
                <option value="Junior Resident">Junior Resident</option>
                <option value="Medical Officer">Medical Officer</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
          </div>

          <div className="signature-container">
            <div className="signature-box">
              <label htmlFor="doctorSignature" className="required">Doctor's Signature</label>
              <input
                type="text"
                id="doctorSignature"
                name="doctorSignature"
                value={formData.doctorSignature}
                onChange={handleChange}
                placeholder="Signature"
                required
              />
              {errors.doctorSignature && <div className="error-message">{errors.doctorSignature}</div>}
            </div>

            <div className="signature-box">
              <label htmlFor="doctorDepartment">Department</label>
              <input
                type="text"
                id="doctorDepartment"
                name="doctorDepartment"
                value={formData.doctorDepartment}
                onChange={handleChange}
                placeholder="e.g., Cardiology, Neurology"
              />
            </div>
          </div>

          <div className="form-row" style={{ marginTop: '20px' }}>
            <div className="form-group">
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="ordersLegible"
                  name="ordersLegible"
                  checked={formData.ordersLegible}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="ordersLegible" className="required">I confirm that all orders are legible, dated & signed</label>
              </div>
              {errors.ordersLegible && <div className="error-message">{errors.ordersLegible}</div>}
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="submit-section">
          <button type="submit" className="btn-submit">
            <i className="fas fa-file-medical"></i> SAVE PROGRESS SHEET
          </button>
        </div>

        {/* Hidden Fields */}
        <input type="hidden" name="formType" value="progressSheet" />
        <input type="hidden" name="hospitalName" value="NCRS HOSPITAL" />
      </form>
    </div>
  );
};

export default Doctors;