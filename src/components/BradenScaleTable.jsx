import React, { useMemo, useState } from 'react';

const BRADEN_ROWS = [
  {
    parameter: 'Sensory Perception',
    labels: [
      '1 - Completely limited',
      '2 - Very limited',
      '3 - Slightly limited',
      '4 - No impairment'
    ]
  },
  {
    parameter: 'Moisture',
    labels: [
      '1 - Constantly moist',
      '2 - Very moist',
      '3 - Occasionally moist',
      '4 - Rarely moist'
    ]
  },
  {
    parameter: 'Activity',
    labels: [
      '1 - Bedfast',
      '2 - Chairfast',
      '3 - Walks occasionally',
      '4 - Walks frequently'
    ]
  },
  {
    parameter: 'Mobility',
    labels: [
      '1 - Completely immobile',
      '2 - Very limited',
      '3 - Slightly limited',
      '4 - No limitation'
    ]
  },
  {
    parameter: 'Nutrition',
    labels: [
      '1 - Very poor',
      '2 - Probably inadequate',
      '3 - Adequate',
      '4 - Excellent'
    ]
  },
  {
    parameter: 'Friction & Shear',
    labels: [
      '1 - Problem',
      '2 - Potential problem',
      '3 - No apparent problem',
      '4 - Adequately supported'
    ]
  }
];

const DEFAULT_SCORES = Array(BRADEN_ROWS.length).fill(0);

const getRiskClassification = (totalScore) => {
  if (totalScore <= 11) return 'Severe Risk';
  if (totalScore <= 14) return 'Moderate Risk';
  if (totalScore <= 16) return 'Mild Risk';
  return 'Low Risk';
};

const BradenScaleTable = ({ initialScores = DEFAULT_SCORES, onScoresChange }) => {
  const [scores, setScores] = useState(() => (
    Array.isArray(initialScores) && initialScores.length === BRADEN_ROWS.length
      ? initialScores.map((score) => Number(score) || 0)
      : DEFAULT_SCORES
  ));

  const handleScoreChange = (index, value) => {
    const parsedValue = value === '' ? 0 : Number(value);

    if (Number.isNaN(parsedValue)) {
      return;
    }

    const sanitizedValue = Math.min(4, Math.max(0, parsedValue));

    setScores((prev) => {
      const nextScores = [...prev];
      nextScores[index] = sanitizedValue;

      if (onScoresChange) {
        onScoresChange(nextScores);
      }

      return nextScores;
    });
  };

  const totalScore = useMemo(
    () => scores.reduce((sum, value) => sum + Number(value || 0), 0),
    [scores]
  );

  const riskClassification = useMemo(
    () => getRiskClassification(totalScore),
    [totalScore]
  );

  return (
    <div className="braden-scale-wrapper">
      <table className="braden-scale-table">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>1</th>
            <th>2</th>
            <th>3</th>
            <th>4</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {BRADEN_ROWS.map((row, index) => (
            <tr key={row.parameter}>
              <td className="parameter-cell">{row.parameter}</td>
              {row.labels.map((label) => (
                <td key={label} className="scale-cell">{label}</td>
              ))}
              <td className="score-cell">
                <input
                  type="number"
                  min={0}
                  max={4}
                  inputMode="numeric"
                  className="score-input braden-score-input"
                  value={scores[index]}
                  onChange={(event) => handleScoreChange(index, event.target.value)}
                />
              </td>
            </tr>
          ))}
          <tr className="braden-total-row">
            <td colSpan={5}>Total Score</td>
            <td className="braden-total-value">{totalScore}</td>
          </tr>
        </tbody>
      </table>

      <div className="braden-risk-note">
        Risk Classification: <strong>{riskClassification}</strong>
      </div>
      <div className="braden-guideline-text">
        15-16 = mild risk, 12-14 = moderate risk, &lt;11 = severe risk
      </div>
    </div>
  );
};

export default BradenScaleTable;
