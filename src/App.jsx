import React, { useEffect, useRef, useState } from 'react';

function setTilt(card, x, y) {
  card.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
}

export default function TiltCard() {
  const cardRef = useRef(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Request permission for device orientation on iOS (must be triggered by user gesture)
  const requestPermissionAndEnable = () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            setPermissionGranted(true);
            window.addEventListener('deviceorientation', handleDeviceOrientation, true);
          } else {
            alert('Permission denied for device orientation.');
          }
        })
        .catch(console.error);
    } else {
      // For other devices/browsers where permission not needed
      setPermissionGranted(true);
      window.addEventListener('deviceorientation', handleDeviceOrientation, true);
    }
  };

  const handleDeviceOrientation = (event) => {
  if (!cardRef.current) return;

  // Reduce intensity by scaling factor (e.g. 0.5)
  const intensity = 0.5;

  // Offset beta by 90 (upright orientation) and clamp angles for smoothness
  const xRaw = event.gamma || 0; // left-right tilt
  const yRaw = (event.beta || 0) - 90; // front-back tilt offset

  const maxAngle = 15; // reduce max tilt max range to 15 degrees

  const x = Math.max(Math.min(xRaw * intensity, maxAngle), -maxAngle);
  const y = Math.max(Math.min(yRaw * intensity, maxAngle), -maxAngle);

  setTilt(cardRef.current, x, y);
};

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 30;
    setTilt(cardRef.current, x, y);
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    setTilt(cardRef.current, 0, 0);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, []);

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', background: '#f7d9e3'
    }}>
      {!permissionGranted && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function' ? (
        <button
          onClick={requestPermissionAndEnable}
          style={{
            padding: '1em 2em', fontSize: '1.2em', borderRadius: '12px',
            cursor: 'pointer', backgroundColor: '#c72a70', color: 'white',
            border: 'none'
          }}
        >
          Enable Phone Tilt
        </button>
      ) : (
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            width: '80%',
            height: 500,
            backgroundColor: 'white',
            borderRadius: 30,
            boxShadow: '0 12px 30px rgba(100,10,50,0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'transform 0.5s cubic-bezier(0.20, 0.80, 0.30, 1)',
            willChange: 'transform',
            textAlign: 'center',
            userSelect: 'none',
            cursor: 'pointer',
          }}
        >
          <h1 style={{ color: '#c72a70', fontFamily: "'Pacifico', cursive", margin: '20px 0' }}>John & Jane</h1>
          <p style={{ fontFamily: "'Open Sans', sans-serif", color: '#444', margin: '20px 0' }}>
            Together with their families,<br />
            invite you to celebrate their wedding.
          </p>
          <p style={{ fontSize: 20, color: '#7c3e66', marginTop: 40 }}>November 14, 2025</p>
          <p style={{ fontFamily: "'Open Sans', sans-serif", color: '#444', margin: '20px 0' }}>Venue: Rosewood Hall</p>
          <p style={{ fontFamily: "'Open Sans', sans-serif", color: '#444', margin: '20px 0' }}>RSVP by November 7</p>
        </div>
      )}
    </div>
  );
}
