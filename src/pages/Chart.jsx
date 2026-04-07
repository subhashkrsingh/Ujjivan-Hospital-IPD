import React, { useState, useEffect } from 'react';
import chartData from '../data/chartData';

const Chart = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;
  const totalPages = Math.ceil(chartData.length / rowsPerPage);

  // Calculate the data for the current page
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, chartData.length);
  const currentData = chartData.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  return (
    <div className="container">
      <header>
        <h1>Chart Data Table</h1>
        <p className="subtitle">Displaying chart values from the provided data set</p>
        <div className="legend">
          <div className="legend-item">
            <div className="color-box x-axis-color"></div>
            <span>X-axis Index</span>
          </div>
          <div className="legend-item">
            <div className="color-box y-axis-color"></div>
            <span>Y-axis Value</span>
          </div>
        </div>
      </header>

      <div className="table-container">
        <table id="dataTable">
          <thead>
            <tr>
              <th width="15%">Index</th>
              <th width="85%">Value</th>
            </tr>
          </thead>
          <tbody id="tableBody">
            {currentData.map((value, index) => (
              <tr key={startIndex + index}>
                <td className="index-cell">{startIndex + index}</td>
                <td className="data-cell">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          className="page-btn"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="page-info">Page {currentPage} of {totalPages}</span>
        <button
          className="page-btn"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      <div className="footer">
        <p>Data extracted from chart image | Displaying all values in table format</p>
      </div>
    </div>
  );
};

export default Chart;