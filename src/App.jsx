import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Layout from './components/Layout';
import IPD from './pages/IPD';
import Doctors from './pages/Doctors';
import Bed from './pages/Bed';
import New from './pages/New';
import Chart from './pages/Chart';
import Hindi from './pages/Hindi';
import Initial from './pages/Initial';
import NursingInitial from './pages/NursingInitial';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Layout>
          <Routes>
            <Route path="/" element={<IPD />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/bed" element={<Bed />} />
            <Route path="/new" element={<New />} />
            <Route path="/chart" element={<Chart />} />
            <Route path="/hindi" element={<Hindi />} />
            <Route path="/initial" element={<Initial />} />
            <Route path="/nursing-initial" element={<NursingInitial />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;