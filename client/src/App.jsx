import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Moderation from './pages/Moderation.jsx';
// ...import other pages

function App() {
  // TODO: Add auth context/provider
  return (
    <Router>
      <Routes>
        <Route path="/moderation" element={<Moderation />} />
        {/* Add other routes here */}
        <Route path="*" element={<Navigate to="/moderation" />} />
      </Routes>
    </Router>
  );
}

export default App;
