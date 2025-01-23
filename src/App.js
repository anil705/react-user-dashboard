import React, { useEffect, useState } from 'react';
import './App.css';

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [newGoal, setNewGoal] = useState({ title: '', deadline: '' });
  const [completionTimer, setCompletionTimer] = useState(null);

  
  const addUser = () => {
    if (newUser.name.trim() !== '' && newUser.email.trim() !== '') {
      setUsers([...users, { ...newUser, id: Date.now(), goals: [] }]);
      setNewUser({ name: '', email: '' });
    }
  };

  
  const addGoalToUser = (userId) => {
    if (newGoal.title.trim() !== '') {
      const goalId = Date.now();
      
      setUsers(
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                goals: [
                  ...user.goals,
                  {
                    ...newGoal,
                    id: goalId,
                    status: 'Pending',
                    completed: false,
                    progress: 0
                  }
                ]
              }
            : user
        )
      );

      
      const timer = setInterval(() => {
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.map(user =>
            user.id === userId
              ? {
                  ...user,
                  goals: user.goals.map(goal =>
                    goal.id === goalId
                      ? {
                          ...goal,
                          progress: Math.min(goal.progress + 20, 100),
                          status: goal.progress + 20 >= 100 ? 'Completed' : 'In Progress',
                          completed: goal.progress + 20 >= 100
                        }
                      : goal
                  )
                }
              : user
          );

          const goal = updatedUsers
            .find(u => u.id === userId)
            ?.goals.find(g => g.id === goalId);
          
          if (goal?.progress >= 100) {
            clearInterval(timer);
          }

          return updatedUsers;
        });
      }, 1000);

      setCompletionTimer(timer);
      setNewGoal({ title: '', deadline: '' });
    }
  };

  
  useEffect(() => {
    return () => {
      if (completionTimer) {
        clearInterval(completionTimer);
      }
    };
  }, [completionTimer]);

  
  const calculateGoalStats = () => {
    const totalGoals = users.reduce((sum, user) => sum + user.goals.length, 0);
    const completedGoals = users.reduce(
      (sum, user) => sum + user.goals.filter(goal => goal.status === 'Completed').length,
      0
    );
    const completionPercentage = totalGoals === 0 
      ? 0 
      : Math.round((completedGoals / totalGoals) * 100);

    return { totalGoals, completedGoals, completionPercentage };
  };

  
  const filteredUsers = users
    .filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );

  const { totalGoals, completedGoals, completionPercentage } = calculateGoalStats();

  
  const GoalItem = ({ goal, userId }) => (
    <li 
      style={{ 
        cursor: 'pointer',
        backgroundColor: goal.status === 'Completed' ? '#e8f5e9' : '#f8f9fa',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="goal-content">
        <span>{goal.title}</span>
        {goal.deadline && <span> - Due: {goal.deadline}</span>}
        <span className={`status-tag ${
          goal.status === 'Completed' 
            ? 'status-completed' 
            : goal.status === 'In Progress' 
              ? 'status-progress' 
              : 'status-pending'
        }`}>
          {goal.status === 'In Progress' ? `${goal.progress}%` : goal.status}
        </span>
      </div>
      {goal.status === 'In Progress' && (
        <div 
          className="progress-bar"
          style={{
            width: `${goal.progress}%`,
            height: '4px',
            backgroundColor: '#4CAF50',
            position: 'absolute',
            bottom: 0,
            left: 0,
            transition: 'width 0.3s ease'
          }}
        />
      )}
    </li>
  );

  return (
    <div className="dashboard">
      <h1>User Dashboard</h1>

      
      <div className="add-user">
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <button onClick={addUser}>Add User</button>
      </div>

      
      <div className="search-sort">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => setSortAsc(!sortAsc)}>
          Sort by Name {sortAsc ? '↑' : '↓'}
        </button>
      </div>

     
      <ul className="user-list">
        {filteredUsers.map((user) => (
          <li key={user.id} onClick={() => setSelectedUser(user)}>
            <span>{user.name}</span> - <span>{user.email}</span> -{' '}
            <span>
              {user.goals.filter((goal) => goal.status === 'Completed').length}/
              {user.goals.length} goals completed
            </span>
          </li>
        ))}
      </ul>

      
      <div className="goal-summary">
        <h2>Goal Summary</h2>
        <p>Total Goals: {totalGoals}</p>
        <p>Completed Goals: {completedGoals}</p>
        <p>Completion Percentage: {completionPercentage}%</p>
      </div>

      
      {selectedUser && (
        <div className="user-details-modal-overlay">
          <div className="user-details-modal">
            <h2>{selectedUser.name}'s Goals</h2>
            
            <div className="add-goal-form">
              <input
                type="text"
                placeholder="Goal title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              />
              <input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              />
              <button onClick={() => addGoalToUser(selectedUser.id)}>Add Goal</button>
            </div>

            <ul>
              {selectedUser.goals.map((goal) => (
                <GoalItem 
                  key={goal.id} 
                  goal={goal} 
                  userId={selectedUser.id} 
                />
              ))}
            </ul>
            <button onClick={() => setSelectedUser(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <div className="App">
      <UserDashboard />
    </div>
  );
};

export default App;