import { useState, useEffect } from 'react';

function CurrentTime({ fontColor }) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const updateTimeAndDate = () => {
      const now = new Date();
      
      // Format time
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      hours = hours.toString().padStart(2, '0');
      setTime(`${hours}:${minutes} ${ampm}`);
      
      // Format date
      const formattedDate = now.toLocaleDateString('en-US', {
        weekday: 'short',  // Mon
        month: 'short',    // Jan
        day: 'numeric'     // 1
      });
      setDate(formattedDate);
    };

    updateTimeAndDate();
    const interval = setInterval(updateTimeAndDate, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="current-time" style={{ color: fontColor }}>
      <div className="time">{time}</div>
      <div className="date" style={{ 
        fontSize: '0.9em',
        marginTop: '5px',
        opacity: 0.8
      }}>
        {date}
      </div>
    </div>
  );
}

export default CurrentTime;
