import React, { useState } from 'react';

const Bed = () => {
  const [formData, setFormData] = useState({
    registrationNo: '',
    patientName: '',
    ageSex: '',
    bedNo: '',
    address: '',
    mobile: '',
    employeeNo: '',
    relationship: '',
    diagnosis: '',
    admissionDate: '',
    doctorName: '',
    dutySisterSig: '',
    dischargeDate: '',
    doctorSig: '',
    attendantSig: ''
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
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      const response = await fetch('save_bed_ticket.php', {
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
    <div className="container mt-4 mb-4 p-4 border rounded form-container">
      <div className="text-center mb-3">
        <h4 className="fw-bold mt-2">UJJIVAN HOSPITAL, DADRI</h4>
        <h6 className="text-uppercase">Patient Bed Head Ticket</h6>
      </div>

      {/* Response Message */}
      <div id="responseMessage" className="response-message" style={{ display: responseMessage ? 'block' : 'none' }}>
        {responseMessage}
      </div>

      <form id="patientForm" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Registration No:</label>
          <input
            type="text"
            className="form-control"
            name="registrationNo"
            value={formData.registrationNo}
            onChange={handleChange}
          />
        </div>

        <div className="row">
          <div className="col-md-8 mb-3">
            <label className="form-label">Patient Name:</label>
            <input
              type="text"
              className="form-control"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2 mb-3">
            <label className="form-label">Age/Sex:</label>
            <input
              type="text"
              className="form-control"
              name="ageSex"
              value={formData.ageSex}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2 mb-3">
            <label className="form-label">Bed No:</label>
            <input
              type="text"
              className="form-control"
              name="bedNo"
              value={formData.bedNo}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Address:</label>
          <input
            type="text"
            className="form-control"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Mobile No:</label>
          <input
            type="text"
            className="form-control"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
          />
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Employee No/PRMS No/N.E./LO:</label>
            <input
              type="text"
              className="form-control"
              name="employeeNo"
              value={formData.employeeNo}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Relationship:</label>
            <input
              type="text"
              className="form-control"
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Diagnosis:</label>
          <input
            type="text"
            className="form-control"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Date & Time of Admission:</label>
          <input
            type="datetime-local"
            className="form-control"
            name="admissionDate"
            value={formData.admissionDate}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Name of Attending Doctor:</label>
          <input
            type="text"
            className="form-control"
            name="doctorName"
            value={formData.doctorName}
            onChange={handleChange}
          />
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Signature of Duty Sister:</label>
            <input
              type="text"
              className="form-control"
              name="dutySisterSig"
              value={formData.dutySisterSig}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Date & Time of Discharge/Referral:</label>
            <input
              type="datetime-local"
              className="form-control"
              name="dischargeDate"
              value={formData.dischargeDate}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Signature of treating Doctor:</label>
            <input
              type="text"
              className="form-control"
              name="doctorSig"
              value={formData.doctorSig}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Signature of Patient's Attendant:</label>
            <input
              type="text"
              className="form-control"
              name="attendantSig"
              value={formData.attendantSig}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row text-center mt-4">
          <div className="col">
            <label>Signature of Patient's Attendant</label>
            <input
              type="text"
              className="form-control"
              name="attendantSig"
              value={formData.attendantSig}
              onChange={handleChange}
            />
          </div>
          <div className="col">
            <label>Signature of Senior Nurse Incharge</label>
            <input
              type="text"
              className="form-control"
              name="dutySisterSig"
              value={formData.dutySisterSig}
              onChange={handleChange}
            />
          </div>
          <div className="col">
            <label>Counter Sign of the Medical Officer Incharge</label>
            <input
              type="text"
              className="form-control"
              name="doctorSig"
              value={formData.doctorSig}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="text-center mt-4">
          <button type="submit" className="btn btn-primary px-5">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default Bed;