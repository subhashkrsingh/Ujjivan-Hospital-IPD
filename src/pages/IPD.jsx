import React, { useState } from 'react';

const IPD = () => {
  const [formData, setFormData] = useState({
    name: '',
    relative_of: '',
    age: '',
    sex: '',
    full_address: '',
    patient_name1: '',
    relative_name: '',
    relative_signature: '',
    date: '',
    place: '',
    time: '',
    relation: '',
    address: '',
    mobile: '',
    witness_name: '',
    witness_address: '',
    witness_mobile: '',
    witness_signature: '',
    witness_date: '',
    witness_place: '',
    witness_time: ''
  });

  const [responseMessage, setResponseMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('submit_consent.php', {
        method: 'POST',
        body: new FormData(e.target)
      });

      const result = await response.text();
      setResponseMessage(result);
    } catch (error) {
      setResponseMessage('Error submitting form');
    }
  };

  return (
    <div className="container mt-4 mb-4">
      <div className="consent-form-container">
        {/* Logo Section */}
        <div className="logo-container">
          <img src="NTPC_Logo.svg.png" alt="NTPC Logo" className="logo" />
        </div>

        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="fw-bold">CONSENT FORM FOR SERIOUS PATIENTS</h2>
        </div>
        <div className="hospital-info">
          <h2 className="text-muted">Palliative Care Centre</h2>
        </div>

        {/* Response Message */}
        <div id="responseMessage" className="response-message" style={{ display: responseMessage ? 'block' : 'none' }}>
          {responseMessage}
        </div>

        <form id="consentForm" onSubmit={handleSubmit}>
          {/* First Line with Input Placeholders */}
          <div className="d-flex align-items-center mb-3 flex-wrap">
            <span className="me-3">I</span>
            <input
              type="text"
              className="form-input-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <span className="mx-3">Son/ Daughter/ Wife/ Husband of</span>
            <input
              type="text"
              className="form-input-inline"
              name="relative_of"
              value={formData.relative_of}
              onChange={handleChange}
            />
            <span className="mx-2">Age</span>
            <input
              type="text"
              className="form-input-small"
              name="age"
              value={formData.age}
              onChange={handleChange}
            />
            <span className="mx-2">years Sex</span>
            <input
              type="text"
              className="form-input-small"
              name="sex"
              value={formData.sex}
              onChange={handleChange}
            />
          </div>

          {/* Address */}
          <div className="mb-3">
            <div className="section-title">Address</div>
            <input
              type="text"
              className="form-input-full"
              name="full_address"
              value={formData.full_address}
              onChange={handleChange}
            />
          </div>

          {/* Consent Text */}
          <div className="consent-text mb-4">
            <p className="mb-3">
              have been explained in detail about the seriousness of my patient name
              <input
                type="text"
                className="form-input-medium"
                name="patient_name1"
                value={formData.patient_name1}
                onChange={handleChange}
              />
            </p>

            <p className="mb-3">
              hereby consent to and authorize any medical treatment, examination, laboratory procedure, or other medical services that may be considered advisable or necessary for patient in the judgment of the consulting physicians and nurse practitioners.
            </p>

            <p className="mb-3">
              I have been informed about the facilities/limitations of the Palliative Care Centre and potential dangers associated with patient's medical condition. I have been informed that the patient is being admitted primarily for palliative care, and even though pre-existing medical condition will be addressed, sudden worsening of those pre-existing conditions may cause threat to his/her life, and he/she may have to be referred for the same to nearby tertiary care hospitals.
            </p>

            <p className="mb-0">
              In the light of all this information, and in my complete senses, I accept and give my consent to all the conditions of this palliative care centre with full responsibility and request them to admit my patient and initiate the treatment.
            </p>
          </div>

          {/* Form Sections */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="section-with-line">
                <div className="section-title">Name</div>
                <input
                  type="text"
                  className="form-input"
                  name="relative_name"
                  value={formData.relative_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="section-with-line">
                <div className="section-title">Signature/Thumb Impression</div>
                <input
                  type="text"
                  className="form-input"
                  name="relative_signature"
                  value={formData.relative_signature}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Date, Place, Time Section */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="section-with-line">
                <div className="section-title">Date</div>
                <input
                  type="text"
                  className="form-input"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="section-with-line">
                <div className="section-title">Place</div>
                <input
                  type="text"
                  className="form-input"
                  name="place"
                  value={formData.place}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="section-with-line">
                <div className="section-title">Time</div>
                <input
                  type="text"
                  className="form-input"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Relation, Address, Mobile Section */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="section-with-line">
                <div className="section-title">Relation</div>
                <input
                  type="text"
                  className="form-input"
                  name="relation"
                  value={formData.relation}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="section-with-line">
                <div className="section-title">Address</div>
                <input
                  type="text"
                  className="form-input"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="section-with-line">
                <div className="section-title">Mobile</div>
                <input
                  type="text"
                  className="form-input"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Witness Section */}
          <div className="witness-section">
            <div className="section-title">Witness Name</div>
            <input
              type="text"
              className="form-input mb-3"
              name="witness_name"
              value={formData.witness_name}
              onChange={handleChange}
              required
            />

            <div className="section-title">Address</div>
            <input
              type="text"
              className="form-input mb-3"
              name="witness_address"
              value={formData.witness_address}
              onChange={handleChange}
              required
            />

            <div className="section-title">Mobile</div>
            <input
              type="text"
              className="form-input mb-3"
              name="witness_mobile"
              value={formData.witness_mobile}
              onChange={handleChange}
              required
            />

            <div className="section-title">Signature/Thumb Impression</div>
            <input
              type="text"
              className="form-input mb-3"
              name="witness_signature"
              value={formData.witness_signature}
              onChange={handleChange}
              required
            />

            <div className="row">
              <div className="col-md-4">
                <div className="section-with-line">
                  <div className="section-title">Date</div>
                  <input
                    type="text"
                    className="form-input"
                    name="witness_date"
                    value={formData.witness_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="section-with-line">
                  <div className="section-title">Place</div>
                  <input
                    type="text"
                    className="form-input"
                    name="witness_place"
                    value={formData.witness_place}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="section-with-line">
                  <div className="section-title">Time</div>
                  <input
                    type="text"
                    className="form-input"
                    name="witness_time"
                    value={formData.witness_time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center mt-4">
            <button type="submit" className="btn btn-primary">Submit Consent Form</button>
            <button type="button" className="btn btn-secondary" onClick={() => window.print()}>Print Form</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IPD;