import React, { useState, useRef, useEffect } from 'react';

const numRings = 15;
const segmentsPerRing = 50;

const AudioVisualizer = () => {
  const [rings, setRings] = useState([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const rotationRef = useRef(0);

  useEffect(() => {
    const initialRings = Array.from({ length: numRings }, (_, i) => {
      const baseRadius = i * 30 + 50;
      const segments = Array.from({ length: segmentsPerRing }, (_, j) => ({
        id: j,
        angle: (j / segmentsPerRing) * 2 * Math.PI,
        radius: baseRadius,
      }));
      return {
        id: i,
        color: `hsl(${i * (360 / numRings)}, 80%, 50%)`,
        baseRadius: baseRadius,
        segments: segments,
        amplitudeFactor: 0,
      };
    });
    setRings(initialRings);

    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new (window.AudioContext || ('webkitAudioContext' in window && window.webkitAudioContext))();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          animationFrameIdRef.current = requestAnimationFrame(draw);
          analyserRef.current?.getByteFrequencyData(dataArray);

          const sum = dataArray.reduce((acc, val) => acc + val, 0);
          const avgAmplitude = sum / bufferLength;
          rotationRef.current += avgAmplitude ** 1.6 / 1000;

          setRings(prevRings =>
            prevRings.map(ring => {
              const firstNBinsToRender = 40;
              const binIndex = Math.floor(ring.id * (firstNBinsToRender / numRings));
              const frequencyAmplitude = dataArray[binIndex] || 0;
              const amplitudeFactor = frequencyAmplitude / 50;

              const newSegments = ring.segments.map(segment =>
                ({ ...segment, radius: ring.baseRadius + amplitudeFactor * 25 }));

              return {
                ...ring,
                segments: newSegments,
                amplitudeFactor
              };
            })
          );
        };
        draw();
      } catch (err) {
        console.error('Error accessing the microphone:', err);
      }
    };

    if (navigator.mediaDevices?.getUserMedia !== undefined) {
      setupAudio();
    } else {
      console.error('getUserMedia not supported on your browser!');
    }

    return () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#000',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const visualizerWrapperStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    transition: 'transform 0.1s',
    transform: `rotate(${rotationRef.current}deg)`,
  };

  return (
    <div style={containerStyle}>
      <div style={visualizerWrapperStyle}>
        {rings.map(ring => {
          const ringDotSize = Math.round(3 + ring.amplitudeFactor);
          return (
            <div key={ring.id}>
              {ring.segments.map(segment => (
                <div
                  key={segment.id}
                  style={{
                    position: 'absolute',
                    width: ringDotSize,
                    height: ringDotSize,
                    borderRadius: '50%',
                    backgroundColor: ring.color,
                    boxShadow: `0 0 ${ringDotSize + 3}px ${ring.color}`,
                    opacity: 0.5 + ring.amplitudeFactor,
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translate(${segment.radius * Math.cos(segment.angle)}px, ${segment.radius * Math.sin(segment.angle)}px)`,
                    transition: 'transform 0.1s',
                  }} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AudioVisualizer;
