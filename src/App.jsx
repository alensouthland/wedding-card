import React, { useEffect, useRef, useState } from 'react';

function setTilt(card, x, y, z) {
  card.style.transform = `rotateX(${-y}deg) rotateY(${x}deg) rotateZ(${z}deg)`;
}

export default function TiltCard() {
  const cardRef = useRef(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const resetTimeout = useRef(null);

  const intensity = 0.4;
  const maxAngle = 15;

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
      setPermissionGranted(true);
      window.addEventListener('deviceorientation', handleDeviceOrientation, true);
    }
  };

  const handleDeviceOrientation = (event) => {
    if (!cardRef.current) return;

    // Clear previous reset timer
    if (resetTimeout.current) clearTimeout(resetTimeout.current);

    let xRaw = event.gamma || 0;            // left-right tilt
    let yRaw = (event.beta || 0) - 90;      // front-back tilt offset upright
    let zRaw = event.alpha || 0;             // z-axis rotation compass heading

    // Scale and clamp rotations
    const x = Math.max(Math.min(xRaw * intensity, maxAngle), -maxAngle);
    const y = Math.max(Math.min(yRaw * intensity, maxAngle), -maxAngle);
    const z = Math.max(Math.min(zRaw * intensity, maxAngle), -maxAngle);

    setTilt(cardRef.current, x, y, z);

    // Reset card upright after 2 seconds of last tilt input
    resetTimeout.current = setTimeout(() => {
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform 1.5s ease-in-out';
        setTilt(cardRef.current, 0, 0, 0);
        // Remove transition after done to keep snappy response
        setTimeout(() => {
          if (cardRef.current) cardRef.current.style.transition = '';
        }, 1500);
      }
    }, 2000);
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    // Clear reset timeout on mouse move
    if (resetTimeout.current) clearTimeout(resetTimeout.current);

    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * maxAngle;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * maxAngle;
    const z = 0;

    setTilt(cardRef.current, x, y, z);

    resetTimeout.current = setTimeout(() => {
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform 1.5s ease-in-out';
        setTilt(cardRef.current, 0, 0, 0);
        setTimeout(() => {
          if (cardRef.current) cardRef.current.style.transition = '';
        }, 1500);
      }
    }, 2000);
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    if (resetTimeout.current) clearTimeout(resetTimeout.current);

    cardRef.current.style.transition = 'transform 1.5s ease-in-out';
    setTilt(cardRef.current, 0, 0, 0);
    setTimeout(() => {
      if (cardRef.current) cardRef.current.style.transition = '';
    }, 1500);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      if (resetTimeout.current) clearTimeout(resetTimeout.current);
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
            height: '70%',
            maxWidth: '350px',
            maxHeight: '500px',
            backgroundColor: 'white',
            borderRadius: 30,
            boxShadow: '0 12px 30px rgba(100,10,50,0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            userSelect: 'none',
            cursor: 'pointer',
            willChange: 'transform',
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
