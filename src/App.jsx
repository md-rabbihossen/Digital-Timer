import { useState, useEffect } from 'react';
import Timer from './components/Timer';
import CurrentTime from './components/CurrentTime';
import SettingsModal from './components/SettingsModal';
import TodoList from './components/TodoList';
import TimeTracker from './components/TimeTracker';
import './index.css';
import { Toaster } from 'react-hot-toast';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(localStorage.getItem("backgroundColor") || "#FFFFFF");
  const [fontColor, setFontColor] = useState(localStorage.getItem("fontColor") || "#37352F");
  const [showSeconds, setShowSeconds] = useState(() => {
    const storedValue = localStorage.getItem("showSeconds");
    return storedValue === null ? true : storedValue === "true";
  });
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem("soundEnabled") !== "false");
  const [timeTrackerUpdate, setTimeTrackerUpdate] = useState(0);

  useEffect(() => {
    document.body.style.backgroundColor = backgroundColor;
    document.body.style.color = fontColor;
  }, [backgroundColor, fontColor]);

  const saveSettings = (newBgColor, newFontColor, newShowSeconds, newSoundEnabled) => {
    setBackgroundColor(newBgColor);
    setFontColor(newFontColor);
    setShowSeconds(newShowSeconds);
    setSoundEnabled(newSoundEnabled);
    
    localStorage.setItem("backgroundColor", newBgColor);
    localStorage.setItem("fontColor", newFontColor);
    localStorage.setItem("showSeconds", newShowSeconds);
    localStorage.setItem("soundEnabled", newSoundEnabled);
  };

  const handleSessionComplete = (duration) => {
    setTimeTrackerUpdate(prev => prev + 1);
  };

  return (
    <div className="app-container">
      <Toaster position="top-center" />
      <TodoList 
        fontColor={fontColor} 
        backgroundColor={backgroundColor}
      />
      <div className="timer-container">
        <CurrentTime fontColor={fontColor} />
        <Timer 
          fontColor={fontColor} 
          backgroundColor={backgroundColor}
          showSeconds={showSeconds}
          soundEnabled={soundEnabled}
          onSettingsClick={() => setShowSettings(true)}
          onSessionComplete={handleSessionComplete}
        />
      </div>
      <TimeTracker 
        fontColor={fontColor}
        backgroundColor={backgroundColor}
        updateTrigger={timeTrackerUpdate}
      />
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          backgroundColor={backgroundColor}
          fontColor={fontColor}
          showSeconds={showSeconds}
          soundEnabled={soundEnabled}
          onSave={saveSettings}
        />
      )}
    </div>
  );
}

export default App;
