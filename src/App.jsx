import React, { useRef } from 'react';
import './App.css';

function setTilt(card, x, y) {
  card.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
}

function App() {
  const cardRef = useRef(null);

  // Mouse movement handler
  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 30;
    setTilt(cardRef.current, x, y);
  };

  const handleMouseLeave = () => setTilt(cardRef.current, 0, 0);

  // Device tilt (mobile)
  React.useEffect(() => {
    if ('DeviceOrientationEvent' in window) {
      const onTilt = (e) => {
        const x = Math.max(Math.min(e.gamma, 30), -30);
        const y = Math.max(Math.min(e.beta - 90, 30), -30);
        setTilt(cardRef.current, x, y);
      };
      window.addEventListener('deviceorientation', onTilt, true);
      return () => window.removeEventListener('deviceorientation', onTilt);
    }
  }, []);

  return (
    <div className="container">
      <div
        ref={cardRef}
        className="card"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <h1>John & Jane</h1>
        <p>Together with their families,<br/>invite you to celebrate their wedding.</p>
        <p className="date">November 14, 2025</p>
        <p>Venue: Rosewood Hall</p>
        <p>RSVP by November 7</p>
      </div>
    </div>
  );
}

export default App;
