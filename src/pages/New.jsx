import React, { useState } from 'react';

const New = () => {
  const [formData, setFormData] = useState({
    patientId: '',
    consultationDate: '',
    investigations: '',
    treatment: '',
    figure: '',
    rmoName: '',
    rmoSignatureTime: '',
    consultantName: '',
    consultantSignatureTime: '',
    ordersLegible: false
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.patientId.trim()) {
      newErrors.patientId = 'Please enter a valid patient ID';
    }

    if (!formData.consultationDate) {
      newErrors.consultationDate = 'Please select a consultation date';
    }

    if (!formData.investigations.trim()) {
      newErrors.investigations = 'Please enter investigation details';
    }

    if (!formData.treatment.trim()) {
      newErrors.treatment = 'Please enter treatment details';
    }

    if (!formData.rmoName.trim()) {
      newErrors.rmoName = 'Please enter RMO name';
    }

    if (!formData.rmoSignatureTime.trim()) {
      newErrors.rmoSignatureTime = 'Please enter RMO signature and time';
    }

    if (!formData.consultantName.trim()) {
      newErrors.consultantName = 'Please enter consultant name';
    }

    if (!formData.consultantSignatureTime.trim()) {
      newErrors.consultantSignatureTime = 'Please enter consultant signature and time';
    }

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

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const response = await fetch('submit_form.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ordersLegible: formData.ordersLegible ? 'Yes' : 'No'
        }),
      });

      if (response.ok) {
        setSuccessMessage('Form submitted successfully!');
        setFormData({
          patientId: '',
          consultationDate: '',
          investigations: '',
          treatment: '',
          figure: '',
          rmoName: '',
          rmoSignatureTime: '',
          consultantName: '',
          consultantSignatureTime: '',
          ordersLegible: false
        });
        setErrors({});

        // Hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1><i className="fas fa-file-medical-alt"></i> Prima Care & Consultant Notes</h1>
        <p>Medical Consultation Form</p>
      </div>

      {successMessage && (
        <div className="success-message" style={{ display: 'block' }}>
          <i className="fas fa-check-circle"></i> {successMessage}
        </div>
      )}

      <form id="consultationForm" className="form-container" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="patientId">Patient ID <span className="required">*</span></label>
            <input
              type="text"
              id="patientId"
              name="patientId"
              placeholder="Enter patient ID"
              value={formData.patientId}
              onChange={handleInputChange}
              required
            />
            {errors.patientId && <div className="error-message" style={{ display: 'block' }}>{errors.patientId}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="consultationDate">Date of Consultation <span className="required">*</span></label>
            <input
              type="date"
              id="consultationDate"
              name="consultationDate"
              value={formData.consultationDate}
              onChange={handleInputChange}
              required
            />
            {errors.consultationDate && <div className="error-message" style={{ display: 'block' }}>{errors.consultationDate}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="investigations">Investigations <span className="required">*</span></label>
            <textarea
              id="investigations"
              name="investigations"
              placeholder="Enter investigation details"
              value={formData.investigations}
              onChange={handleInputChange}
              required
            />
            {errors.investigations && <div className="error-message" style={{ display: 'block' }}>{errors.investigations}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="treatment">Treatment <span className="required">*</span></label>
            <textarea
              id="treatment"
              name="treatment"
              placeholder="Enter treatment details"
              value={formData.treatment}
              onChange={handleInputChange}
              required
            />
            {errors.treatment && <div className="error-message" style={{ display: 'block' }}>{errors.treatment}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="figure">Figure (if any)</label>
            <input
              type="text"
              id="figure"
              name="figure"
              placeholder="e.g., decimal 0 cm x.00"
              value={formData.figure}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <h3 style={{ color: '#2c5fa5', margin: '30px 0 15px', paddingBottom: '10px', borderBottom: '2px solid #f0f0f0' }}>Signatures</h3>

        <div className="signature-container">
          <div className="signature-box">
            <label htmlFor="rmoName">Name of RMO <span className="required">*</span></label>
            <input
              type="text"
              id="rmoName"
              name="rmoName"
              placeholder="Enter RMO name"
              value={formData.rmoName}
              onChange={handleInputChange}
              required
            />
            {errors.rmoName && <div className="error-message" style={{ display: 'block' }}>{errors.rmoName}</div>}
          </div>

          <div className="signature-box">
            <label htmlFor="rmoSignatureTime">Signature of RMO & Time <span className="required">*</span></label>
            <input
              type="text"
              id="rmoSignatureTime"
              name="rmoSignatureTime"
              placeholder="Signature and time"
              value={formData.rmoSignatureTime}
              onChange={handleInputChange}
              required
            />
            {errors.rmoSignatureTime && <div className="error-message" style={{ display: 'block' }}>{errors.rmoSignatureTime}</div>}
          </div>
        </div>

        <div className="signature-container">
          <div className="signature-box">
            <label htmlFor="consultantName">Name of Consultant <span className="required">*</span></label>
            <input
              type="text"
              id="consultantName"
              name="consultantName"
              placeholder="Enter consultant name"
              value={formData.consultantName}
              onChange={handleInputChange}
              required
            />
            {errors.consultantName && <div className="error-message" style={{ display: 'block' }}>{errors.consultantName}</div>}
          </div>

          <div className="signature-box">
            <label htmlFor="consultantSignatureTime">Signature of Consultant & Time <span className="required">*</span></label>
            <input
              type="text"
              id="consultantSignatureTime"
              name="consultantSignatureTime"
              placeholder="Signature and time"
              value={formData.consultantSignatureTime}
              onChange={handleInputChange}
              required
            />
            {errors.consultantSignatureTime && <div className="error-message" style={{ display: 'block' }}>{errors.consultantSignatureTime}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="ordersLegible"
              name="ordersLegible"
              checked={formData.ordersLegible}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="ordersLegible">I confirm that all orders are legible, dated & signed <span className="required">*</span></label>
          </div>
          {errors.ordersLegible && <div className="error-message" style={{ display: 'block' }}>{errors.ordersLegible}</div>}
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          <i className="fas fa-paper-plane"></i> {isSubmitting ? 'Submitting...' : 'Submit Form'}
        </button>
      </form>

      <div className="footer-note">
        <p><i className="fas fa-info-circle"></i> All fields marked with <span className="required">*</span> are required. Please ensure all information is accurate before submission.</p>
      </div>
    </div>
  );
};

export default New;