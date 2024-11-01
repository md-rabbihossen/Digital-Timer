import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import alarmSound from '../assets/Digital Timer.mp3';

function Timer({ fontColor, backgroundColor, showSeconds, soundEnabled, onSettingsClick, onSessionComplete }) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("30");
  const timerRef = useRef(null);
  const audioRef = useRef(new Audio(alarmSound));
  const initialTimeRef = useRef(0);

  const formatTime = () => {
    if (showSeconds) {
      const displayHours = Math.floor(timeLeft / 60);
      const displayMinutes = timeLeft % 60;
      return `${String(displayHours).padStart(2, '0')}:${String(displayMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
      const displayHours = Math.floor(timeLeft / 60);
      const displayMinutes = timeLeft % 60;
      return `${String(displayHours).padStart(2, '0')}:${String(displayMinutes).padStart(2, '0')}`;
    }
  };

  const handleTimeInput = (e, type) => {
    const value = e.target.value;
    if (value === "" || (parseInt(value) >= 0 && parseInt(value) <= (type === 'hours' ? 24 : 59))) {
      if (type === 'hours') {
        setHours(value);
      } else {
        setMinutes(value);
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      startTimer();
    }
  };

  const startTimer = () => {
    if (!timerRef.current && !isPaused) {
      const totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
      if (totalMinutes <= 0) {
        toast('Please enter a valid time', toastStyle);
        return;
      }
      initialTimeRef.current = totalMinutes;
      toast('Timer Started! ▶️', toastStyle);
      setTimeLeft(totalMinutes);
      setSeconds(0);
    } else if (isPaused) {
      toast('Timer Resumed! ▶️', toastStyle);
    }

    if (!timerRef.current) {
      if (showSeconds) {
        timerRef.current = setInterval(() => {
          setSeconds(prev => {
            if (prev === 0) {
              setTimeLeft(prevTime => {
                if (prevTime <= 0) {
                  handleTimerComplete();
                  return 0;
                }
                return prevTime - 1;
              });
              return 59;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 0) {
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          });
        }, 60000);
      }
    }
    setIsPaused(false);
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setIsPaused(true);
      toast('Timer Paused! ⏸️', toastStyle);
    }
  };

  const resetTimer = () => {
    if (timerRef.current || isPaused) {
      const elapsedMinutes = initialTimeRef.current - timeLeft - (seconds / 60);
      if (elapsedMinutes > 0) {
        saveSession(elapsedMinutes);
      }
    }

    clearInterval(timerRef.current);
    timerRef.current = null;
    setTimeLeft(30);
    setSeconds(0);
    setIsPaused(false);
    setHours("0");
    setMinutes("30");
    stopAlarm();
    toast('Timer Reset! 🔄', toastStyle);
  };

  const handleTimerComplete = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    
    const duration = initialTimeRef.current;
    saveSession(duration);
    
    if (soundEnabled) {
      playAlarm();
    }
    
    toast('Time\'s Up! ⏰', {
      ...toastStyle,
      duration: 5000,
      icon: '✨',
    });
  };

  const playAlarm = () => {
    try {
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => {
          setTimeout(stopAlarm, 31000);
        })
        .catch(console.error);
    } catch (error) {
      console.error("Error playing alarm:", error);
    }
  };

  const stopAlarm = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  const saveSession = (duration) => {
    const newSession = {
      date: new Date().toISOString(),
      duration: duration
    };
    
    const savedSessions = JSON.parse(localStorage.getItem('timerSessions') || '[]');
    const updatedSessions = [...savedSessions, newSession];
    localStorage.setItem('timerSessions', JSON.stringify(updatedSessions));
    
    if (onSessionComplete) {
      onSessionComplete(duration);
    }
  };

  const toastStyle = {
    style: {
      background: backgroundColor,
      color: fontColor,
      border: `1px solid ${fontColor}`,
    },
    duration: 2000,
  };

  useEffect(() => {
    audioRef.current.volume = 0.5;
    return () => {
      stopAlarm();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') {
        if (e.key === 'Enter') {
          e.preventDefault();
          startTimer();
        }
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (timerRef.current) {
          pauseTimer();
        } else if (isPaused) {
          startTimer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPaused]);

  return (
    <div id="clock" style={{ color: fontColor, fontSize: 'clamp(50px, 10vw, 150px)' }}>
      <div id="timer" style={{ color: fontColor }}>
        {formatTime()}
      </div>
      <div className="time-input-container">
        <div className="time-input-group">
          <input
            type="number"
            value={hours}
            onChange={(e) => handleTimeInput(e, 'hours')}
            onKeyDown={(e) => handleTimeInput(e, 'hours')}
            min="0"
            max="24"
            placeholder="Hours"
            style={{
              color: fontColor,
              borderColor: fontColor,
              backgroundColor,
              caretColor: fontColor,
              width: '50px',
              fontSize: 'clamp(12px, 2vw, 16px)'
            }}
          />
          <label style={{ color: fontColor }}>h</label>
        </div>
        <div className="time-input-group">
          <input
            type="number"
            value={minutes}
            onChange={(e) => handleTimeInput(e, 'minutes')}
            onKeyDown={(e) => handleTimeInput(e, 'minutes')}
            min="0"
            max="59"
            placeholder="Minutes"
            style={{
              color: fontColor,
              borderColor: fontColor,
              backgroundColor,
              caretColor: fontColor,
              width: '50px',
              fontSize: 'clamp(12px, 2vw, 16px)'
            }}
          />
          <label style={{ color: fontColor }}>m</label>
        </div>
      </div>
      <div className="buttons">
        <button id="start-btn" onClick={startTimer} style={{ color: fontColor, fontSize: 'clamp(12px, 2vw, 16px)' }}>
          {isPaused ? <><i className="fas fa-play"></i> Resume</> : <><i className="fas fa-play"></i> Start</>}
        </button>
        <button id="pause-btn" onClick={pauseTimer} style={{ color: fontColor, fontSize: 'clamp(12px, 2vw, 16px)' }}>
          <i className="fas fa-pause"></i> Pause
        </button>
        <button id="reset-btn" onClick={resetTimer} style={{ color: "#37352F", fontSize: 'clamp(12px, 2vw, 16px)' }}>
          <i className="fas fa-redo"></i> Reset
        </button>
        <button id="settings-btn" onClick={onSettingsClick} style={{ color: fontColor, fontSize: 'clamp(12px, 2vw, 16px)' }}>
          <i className="fas fa-cog"></i>
        </button>
      </div>
    </div>
  );
}

export default Timer;
