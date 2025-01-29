import React, { useState } from 'react';
import { PlusCircle, Trash2, Send } from 'lucide-react';

const GoalsManager = () => {
  const [weeklyGoals, setWeeklyGoals] = useState(['']);
  const [monthlyGoals, setMonthlyGoals] = useState(['']);
  const [webhookUrl, setWebhookUrl] = useState('https://usetrmnl.com/api/custom_plugins/ac02e520-e3eb-4e1e-9fe0-3fef78687335');
  const [status, setStatus] = useState('');

  const handleAddGoal = (type) => {
    if (type === 'weekly') {
      setWeeklyGoals([...weeklyGoals, '']);
    } else {
      setMonthlyGoals([...monthlyGoals, '']);
    }
  };

  const handleRemoveGoal = (type, index) => {
    if (type === 'weekly') {
      const newGoals = weeklyGoals.filter((_, i) => i !== index);
      setWeeklyGoals(newGoals.length ? newGoals : ['']);
    } else {
      const newGoals = monthlyGoals.filter((_, i) => i !== index);
      setMonthlyGoals(newGoals.length ? newGoals : ['']);
    }
  };

  const handleGoalChange = (type, index, value) => {
    if (type === 'weekly') {
      const newGoals = [...weeklyGoals];
      newGoals[index] = value;
      setWeeklyGoals(newGoals);
    } else {
      const newGoals = [...monthlyGoals];
      newGoals[index] = value;
      setMonthlyGoals(newGoals);
    }
  };

  const handleSubmit = async () => {
    if (!webhookUrl) {
      setStatus('Please enter your TRMNL webhook URL');
      return;
    }

    const filteredWeeklyGoals = weeklyGoals.filter(goal => goal.trim() !== '');
    const filteredMonthlyGoals = monthlyGoals.filter(goal => goal.trim() !== '');

    const payload = {
      merge_variables: {
        weekly_goals: filteredWeeklyGoals,
        monthly_goals: filteredMonthlyGoals
      }
    };

    try {
      setStatus('Sending...');
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(payload),
      });

      console.log('Response:', response); // Debug log
      const responseData = await response.text();
      console.log('Response data:', responseData); // Debug log

      if (response.ok) {
        setStatus('Goals updated successfully!');
      } else {
        setStatus(`Error updating goals. Server responded with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error details:', error); // Debug log
      setStatus('Error: ' + error.message);
    }
  };

  const renderGoalInputs = (type, goals, setGoals) => (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">{type === 'weekly' ? 'Weekly' : 'Monthly'} Goals</h2>
      {goals.map((goal, index) => (
        <div key={index} className="flex mb-2">
          <input
            type="text"
            value={goal}
            onChange={(e) => handleGoalChange(type, index, e.target.value)}
            placeholder={`Enter ${type} goal`}
            className="flex-grow p-2 border rounded mr-2"
          />
          <button
            onClick={() => handleRemoveGoal(type, index)}
            className="p-2 text-red-500 hover:text-red-700"
            aria-label="Remove goal"
          >
            <Trash2 size={20} />
          </button>
        </div>
      ))}
      <button
        onClick={() => handleAddGoal(type)}
        className="flex items-center mt-2 text-blue-500 hover:text-blue-700"
      >
        <PlusCircle size={20} className="mr-1" />
        Add {type} goal
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">TRMNL Goals Manager</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          TRMNL Webhook URL
        </label>
        <input
          type="text"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="Enter your TRMNL webhook URL"
          className="w-full p-2 border rounded"
        />
      </div>

      {renderGoalInputs('weekly', weeklyGoals, setWeeklyGoals)}
      {renderGoalInputs('monthly', monthlyGoals, setMonthlyGoals)}

      <div className="text-center">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 flex items-center mx-auto"
        >
          <Send size={20} className="mr-2" />
          Update Goals
        </button>
        {status && (
          <p className={`mt-4 ${
            status.includes('Error') ? 'text-red-500' : 
            status.includes('success') ? 'text-green-500' : 'text-blue-500'
          }`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

export default GoalsManager;