import React, { useState } from 'react';

const Hindi = () => {
  const [formData, setFormData] = useState({
    name: '',
    relative: '',
    age: '',
    gender: '',
    address: '',
    patientName: '',
    relationship: '',
    signatureDate: '',
    fatherName: '',
    location: '',
    time: '',
    mobile: '',
    witnessName: '',
    witnessRelation: '',
    witnessDate: '',
    witnessFatherName: '',
    witnessLocation: '',
    witnessTime: '',
    witnessMobile: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const requiredFields = [
      'name',
      'relative',
      'age',
      'gender',
      'address',
      'patientName',
      'relationship',
      'signatureDate',
      'fatherName',
      'location',
      'time',
      'mobile',
      'witnessName',
      'witnessRelation',
      'witnessDate',
      'witnessFatherName',
      'witnessLocation',
      'witnessTime',
      'witnessMobile'
    ];

    const newErrors = {};
    requiredFields.forEach((field) => {
      if (!formData[field]?.toString().trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSuccessMessage('आपका सहमति पत्र सफलतापूर्वक जमा किया गया है। धन्यवाद!');
    setFormData({
      name: '',
      relative: '',
      age: '',
      gender: '',
      address: '',
      patientName: '',
      relationship: '',
      signatureDate: '',
      fatherName: '',
      location: '',
      time: '',
      mobile: '',
      witnessName: '',
      witnessRelation: '',
      witnessDate: '',
      witnessFatherName: '',
      witnessLocation: '',
      witnessTime: '',
      witnessMobile: ''
    });

    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  return (
    <div className="container">
      <div className="form-container">
        <div className="text-center mb-4">
          <h2>UJJIVAN HOSPITAL, DADRI</h2>
          <h2>गंभीर रोगियों के लिए सहमति पत्र</h2>
        </div>

        {successMessage && (
          <div className="response-message success" style={{ display: 'block' }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="inline-labels mb-3">
            <label className="required">मैं</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="inline-input"
              placeholder="नाम लिखें"
            />
            {errors.name && <div className="error-message" style={{ display: 'block' }}>{errors.name}</div>}

            <label className="required">पुत्र/पुत्री/पत्नी/पति</label>
            <input
              type="text"
              name="relative"
              value={formData.relative}
              onChange={handleChange}
              className="inline-input"
              placeholder="नाम लिखें"
            />
            {errors.relative && <div className="error-message" style={{ display: 'block' }}>{errors.relative}</div>}

            <label className="required">आयु</label>
            <input
              type="text"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="inline-input"
              style={{ width: '60px' }}
              placeholder="आयु"
            />
            {errors.age && <div className="error-message" style={{ display: 'block' }}>{errors.age}</div>}

            <label className="required">लिंग</label>
            <div className="gender-options">
              <div>
                <input
                  type="radio"
                  id="male"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                />
                <label htmlFor="male">पुरुष</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="female"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                />
                <label htmlFor="female">महिला</label>
              </div>
            </div>
            {errors.gender && <div className="error-message" style={{ display: 'block' }}>{errors.gender}</div>}
          </div>

          <div className="inline-labels mb-4">
            <label className="required">पता</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="inline-input"
              style={{ width: '100%' }}
              placeholder="पूरा पता लिखें"
            />
            {errors.address && <div className="error-message" style={{ display: 'block' }}>{errors.address}</div>}
          </div>

          <div className="consent-text">
            <p>
              घोषणा करता हूँ कि मुझे मेरे मरीज
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                className="inline-input"
                style={{ width: '200px' }}
                placeholder="नाम लिखें"
              />
              की बीमारी की गंभीरता के बारे में बताया गया है।
            </p>
          </div>

          <div className="signature-section">
            <div className="signature-block">
              <div className="signature-label">
                नाम
                <input
                  type="text"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                  className="inline-input"
                  style={{ width: '300px' }}
                  placeholder="नाम लिखें"
                />
                हस्ताक्षर/अंगूठे का निशान
              </div>
              <div className="signature-row">
                <label className="required">रिश्ता</label>
                <input
                  type="text"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                  className="inline-input"
                  style={{ width: '80px' }}
                  placeholder="रिश्ता"
                />
                <label className="required">तिथि</label>
                <input
                  type="date"
                  name="signatureDate"
                  value={formData.signatureDate}
                  onChange={handleChange}
                  className="inline-input"
                  style={{ width: '130px' }}
                />
              </div>

              <div className="signature-row">
                <label className="required">पिता</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  className="inline-input"
                  style={{ width: '120px' }}
                  placeholder="पिता का नाम"
                />
                <label className="required">स्थान</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="inline-input"
                  style={{ width: '110px' }}
                  placeholder="स्थान"
                />
                <label className="required">समय</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="inline-input"
                  style={{ width: '90px' }}
                />
              </div>

              <div className="signature-row">
                <label className="required">मोबाइल</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="inline-input"
                  style={{ width: '200px' }}
                  placeholder="मोबाइल नंबर"
                />
              </div>
            </div>

            <hr style={{ margin: '30px 0' }} />

            <div className="signature-block">
              <div className="signature-label">
                गवाह का नाम
                <input
                  type="text"
                  name="witnessName"
                  value={formData.witnessName}
                  onChange={handleChange}
                  className="inline-input"
                  style={{ width: '300px' }}
                  placeholder="नाम लिखें"
                />
                हस्ताक्षर/अंगूठे का निशान
              </div>
              <div className="signature-row">
                <label className="required">रिश्ता</label>
                <input
                  type="text"
                  name="witnessRelation"
                  value={formData.witnessRelation}
                  onChange={handleChange}
                  className="inline-input"
                  style={{ width: '80px' }}
                  placeholder="रिश्ता"
                />
                <label className="required">तिथि</label>
                <input
                  type="date"
                  name="witnessDate"
                  value={formData.witnessDate}
                  onChange={handleChange}
                  className="inline-input"
                  style={{ width: '130px' }}
                />
              </div>

              <div className="signature-row">
                <label className="required">पिता</label>
                <input
                  type="text"
                  name="witnessFatherName"
                  value={formData.witnessFatherName}
                  onChange={handleChange}
                  className="inline-input"
                  style={{ width: '120px' }}
                  placeholder="पिता का नाम"
                />
                <label className="required">स्थान</label>
                <input
                  type="text"
                  name="witnessLocation"
                  value={formData.witnessLocation}
                  onChange={handleChange}
                  className="inline-input"
                  style={{ width: '110px' }}
                  placeholder="स्थान"
                />
                <label className="required">समय</label>
                <input
                  type="time"
                  name="witnessTime"
                  value={formData.witnessTime}
                  onChange={handleChange}
                  className="inline-input"
                  style={{ width: '90px' }}
                />
              </div>

              <div className="signature-row">
                <label className="required">मोबाइल</label>
                <input
                  type="tel"
                  name="witnessMobile"
                  value={formData.witnessMobile}
                  onChange={handleChange}
                  className="inline-input"
                  style={{ width: '200px' }}
                  placeholder="मोबाइल नंबर"
                />
              </div>
            </div>
          </div>

          <div className="submit-section">
            <button type="submit" className="submit-btn">
              सहमति पत्र सबमिट करें
            </button>
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              सभी आवश्यक फ़ील्ड भरने के बाद सबमिट करें
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Hindi;
