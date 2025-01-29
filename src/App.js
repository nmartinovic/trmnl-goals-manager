import React from 'react';
import GoalsManager from './components/GoalsManager';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <GoalsManager />
    </div>
  );
}

export default App;