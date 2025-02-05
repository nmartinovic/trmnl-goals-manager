import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Send } from 'lucide-react';

const GoalsManager = () => {
  const [weeklyGoals, setWeeklyGoals] = useState(['']);
  const [monthlyGoals, setMonthlyGoals] = useState(['']);
  const [webhookUrl, setWebhookUrl] = useState('https://usetrmnl.com/api/custom_plugins/ac02e520-e3eb-4e1e-9fe0-3fef78687335');
  const [status, setStatus] = useState('');
  const [lastSubmittedGoals, setLastSubmittedGoals] = useState(null);

  useEffect(() => {
    const savedGoals = localStorage.getItem('trmnlGoals');
    if (savedGoals) {
      const { weekly_goals, monthly_goals } = JSON.parse(savedGoals);
      setWeeklyGoals(weekly_goals.length ? weekly_goals : ['']);
      setMonthlyGoals(monthly_goals.length ? monthly_goals : ['']);
      setLastSubmittedGoals({ weekly_goals, monthly_goals });
    }
  }, []);

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
        weekly_goals: filteredWeeklyGoals.length ? filteredWeeklyGoals : (lastSubmittedGoals?.weekly_goals || []),
        monthly_goals: filteredMonthlyGoals.length ? filteredMonthlyGoals : (lastSubmittedGoals?.monthly_goals || [])
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

      console.log('Response:', response);
      const responseData = await response.text();
      console.log('Response data:', responseData);

      if (response.ok) {
        localStorage.setItem('trmnlGoals', JSON.stringify({
          weekly_goals: payload.merge_variables.weekly_goals,
          monthly_goals: payload.merge_variables.monthly_goals
        }));
        setLastSubmittedGoals(payload.merge_variables);
        setStatus('Goals updated successfully!');
      } else {
        setStatus(`Error updating goals. Server responded with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error details:', error);
      setStatus('Error: ' + error.message);
    }
  };

  const renderGoalInputs = (type, goals, setGoals) => (
    <div className="bg-white rounded-lg p-6 shadow-md mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {type === 'weekly' ? 'Weekly' : 'Monthly'} Goals
      </h2>
      <div className="space-y-3">
        {goals.map((goal, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={goal}
              onChange={(e) => handleGoalChange(type, index, e.target.value)}
              placeholder={`Enter ${type} goal`}
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <button
              onClick={() => handleRemoveGoal(type, index)}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Remove goal"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => handleAddGoal(type)}
        className="mt-4 flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        <PlusCircle size={20} className="mr-2" />
        Add {type} goal
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-700">
            <h1 className="text-3xl font-bold text-white text-center">
              TRMNL Goals Manager
            </h1>
          </div>
          
          <div className="p-8">
            <div className="bg-white rounded-lg p-6 shadow-md mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TRMNL Webhook URL
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="Enter your TRMNL webhook URL"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {renderGoalInputs('weekly', weeklyGoals, setWeeklyGoals)}
            {renderGoalInputs('monthly', monthlyGoals, setMonthlyGoals)}

            <div className="text-center mt-8">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all inline-flex items-center justify-center font-medium"
              >
                <Send size={20} className="mr-2" />
                Update Goals
              </button>
              {status && (
                <p className={`mt-4 text-sm font-medium ${
                  status.includes('Error') ? 'text-red-600' : 
                  status.includes('success') ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {status}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsManager;