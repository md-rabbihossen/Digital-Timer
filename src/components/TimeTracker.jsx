import { useState, useEffect } from 'react';

function TimeTracker({ fontColor, updateTrigger }) {
  const [totalTime, setTotalTime] = useState(() => {
    const sessions = JSON.parse(localStorage.getItem('timerSessions') || '[]');
    const totalMinutes = sessions.reduce((acc, session) => acc + session.duration, 0);
    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: Math.floor(totalMinutes % 60),
      seconds: 0
    };
  });

  const [dailyHistory, setDailyHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [goalHours, setGoalHours] = useState(() => {
    const stored = localStorage.getItem('goalHours');
    if (!stored) {
      localStorage.setItem('goalHours', "5");
      return "5";
    }
    return stored;
  });
  const [goalMinutes, setGoalMinutes] = useState(() => {
    const stored = localStorage.getItem('goalMinutes');
    if (!stored) {
      localStorage.setItem('goalMinutes', "0");
      return "0";
    }
    return stored;
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      updateTotalTime();
    }, 1000);

    updateTotalTime();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    updateTotalTime();
  }, [updateTrigger]);

  const saveToHistory = (date, minutes) => {
    const dailyHistory = JSON.parse(localStorage.getItem('dailyHistory') || '[]');
    dailyHistory.push({
      date: date,
      totalMinutes: minutes
    });
    localStorage.setItem('dailyHistory', JSON.stringify(dailyHistory));
    setDailyHistory(dailyHistory);
  };

  const checkAndResetDaily = () => {
    const lastResetDate = localStorage.getItem('lastResetDate');
    const today = new Date().toDateString();

    if (lastResetDate !== today) {
      const sessions = JSON.parse(localStorage.getItem('timerSessions') || '[]');
      if (sessions.length > 0) {
        const totalMinutes = sessions.reduce((acc, session) => acc + session.duration, 0);
        saveToHistory(lastResetDate || new Date().toDateString(), totalMinutes);
      }

      localStorage.setItem('timerSessions', '[]');
      localStorage.setItem('lastResetDate', today);
    }
  };

  const updateTotalTime = () => {
    const sessions = JSON.parse(localStorage.getItem('timerSessions') || '[]');
    const totalMinutes = sessions.reduce((acc, session) => acc + session.duration, 0);
    
    setTotalTime({
      hours: Math.floor(totalMinutes / 60),
      minutes: Math.floor(totalMinutes % 60),
      seconds: Math.floor((totalMinutes % 1) * 60)
    });
    
    setDailyHistory(JSON.parse(localStorage.getItem('dailyHistory') || '[]'));
  };

  const formatTime = ({ hours, minutes, seconds }) => {
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const formatHistoryTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset today\'s study time?')) {
      // Save current session to history before resetting
      const sessions = JSON.parse(localStorage.getItem('timerSessions') || '[]');
      if (sessions.length > 0) {
        const totalMinutes = sessions.reduce((acc, session) => acc + session.duration, 0);
        const currentTime = new Date();
        const timeString = currentTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        saveToHistory(
          `${new Date().toDateString()} (${timeString})`, 
          totalMinutes
        );
      }

      // Reset current session
      localStorage.setItem('timerSessions', '[]');
      setTotalTime({ hours: 0, minutes: 0, seconds: 0 });
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const calculateProgress = () => {
    // Convert goal time to seconds for more precise calculation
    const goalTimeInSeconds = (parseInt(goalHours) * 3600) + (parseInt(goalMinutes) * 60);
    
    // Get current sessions from localStorage and convert to seconds
    const sessions = JSON.parse(localStorage.getItem('timerSessions') || '[]');
    const currentTimeInSeconds = sessions.reduce((acc, session) => acc + (session.duration * 60), 0);
    
    // Calculate percentage
    const progress = goalTimeInSeconds > 0 ? 
      Math.min((currentTimeInSeconds / goalTimeInSeconds) * 100, 100) : 0;
    
    // Return rounded progress
    return Math.round(progress);
  };

  const handleGoalChange = (value, type) => {
    const numValue = parseInt(value) || 0;
    const validValue = type === 'hours' ? 
      Math.min(Math.max(numValue, 0), 24).toString() : 
      Math.min(Math.max(numValue, 0), 59).toString();

    if (type === 'hours') {
      setGoalHours(validValue);
      localStorage.setItem('goalHours', validValue);
    } else {
      setGoalMinutes(validValue);
      localStorage.setItem('goalMinutes', validValue);
    }
  };

  const toggleGoalEdit = () => {
    if (isEditingGoal) {
      handleGoalChange(goalHours, 'hours');
      handleGoalChange(goalMinutes, 'minutes');
    }
    setIsEditingGoal(!isEditingGoal);
  };

  return (
    <div className="time-tracker" style={{ color: fontColor }}>
      <div className="stat-box" style={{ 
        borderColor: fontColor, 
        borderWidth: '0.5px',
        padding: '8px',
        position: 'relative'
      }}>
        <h3 style={{ margin: '0 0 5px 0' }}>Today's Study Time</h3>
        <p className="stat-value" style={{ margin: '5px 0' }}>{formatTime(totalTime)}</p>
        
        <div style={{ position: 'absolute', right: '8px', top: '8px' }}>
          <button 
            onClick={toggleHistory}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: fontColor,
              opacity: '0.6',
              fontSize: '12px',
              marginRight: '8px'
            }}
            title="View History"
          >
            <i className="fas fa-history"></i>
          </button>
          <button 
            onClick={handleReset}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: fontColor,
              opacity: '0.6',
              fontSize: '12px'
            }}
            title="Reset Today's Time"
          >
            <i className="fas fa-redo-alt"></i>
          </button>
        </div>
      </div>

      <div className="goal-box" style={{ 
        borderColor: fontColor, 
        borderWidth: '0.5px',
        padding: '8px',
        marginTop: '10px',
        position: 'relative'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <h4 style={{ margin: '0' }}>Daily Goal</h4>
          {isEditingGoal ? (
            <div className="time-input-container" style={{ display: 'flex', gap: '10px' }}>
              <div className="time-input-group">
                <input
                  type="number"
                  value={goalHours}
                  onChange={(e) => handleGoalChange(e.target.value, 'hours')}
                  min="0"
                  max="24"
                  style={{
                    width: '50px',
                    padding: '2px 4px',
                    background: 'transparent',
                    border: `1px solid ${fontColor}`,
                    color: fontColor,
                    borderRadius: '4px'
                  }}
                />
                <span style={{ marginLeft: '4px' }}>h</span>
              </div>
              <div className="time-input-group">
                <input
                  type="number"
                  value={goalMinutes}
                  onChange={(e) => handleGoalChange(e.target.value, 'minutes')}
                  min="0"
                  max="59"
                  style={{
                    width: '50px',
                    padding: '2px 4px',
                    background: 'transparent',
                    border: `1px solid ${fontColor}`,
                    color: fontColor,
                    borderRadius: '4px'
                  }}
                />
                <span style={{ marginLeft: '4px' }}>m</span>
              </div>
              <button
                onClick={toggleGoalEdit}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: fontColor,
                  opacity: '0.6',
                  fontSize: '12px',
                  marginLeft: '8px'
                }}
                title="Save Goal"
              >
                <i className="fas fa-check"></i>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '8px' }}>
                {`${goalHours}h ${goalMinutes}m`}
              </span>
              <button
                onClick={toggleGoalEdit}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: fontColor,
                  opacity: '0.6',
                  fontSize: '12px'
                }}
                title="Edit Goal"
              >
                <i className="fas fa-edit"></i>
              </button>
            </div>
          )}
        </div>

        <div style={{ 
          position: 'relative', 
          height: '20px', 
          marginTop: '5px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            flex: 1,
            height: '100%',
            backgroundColor: `${fontColor}20`,
            borderRadius: '10px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: `${calculateProgress()}%`,
              height: '100%',
              backgroundColor: fontColor,
              transition: 'width 0.3s ease'
            }} />
          </div>
          <span style={{
            minWidth: '45px',
            fontSize: '0.8em',
            fontWeight: 'bold',
            color: fontColor
          }}>
            {`${calculateProgress()}%`}
          </span>
        </div>
      </div>

      {showHistory && (
        <div className="history-box" style={{ 
          borderColor: fontColor, 
          borderWidth: '0.5px',
          padding: '8px',
          marginTop: '10px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <h4 style={{ margin: '0' }}>Study History</h4>
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to clear all study history?')) {
                  localStorage.setItem('dailyHistory', '[]');
                  setDailyHistory([]);
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: fontColor,
                opacity: '0.6',
                fontSize: '12px'
              }}
              title="Clear All History"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
          {dailyHistory.length > 0 ? (
            dailyHistory.slice().reverse().map((day, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '4px 0',
                borderBottom: index !== dailyHistory.length - 1 ? `1px solid ${fontColor}20` : 'none'
              }}>
                <span>{day.date.includes('(') ? day.date : new Date(day.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}</span>
                <span>{formatHistoryTime(day.totalMinutes)}</span>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', opacity: 0.7 }}>No history yet</p>
          )}
        </div>
      )}
    </div>
  );
}

export default TimeTracker; 