import React, { useState, useRef } from 'react';

const AudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState('');
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = event => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            const url = URL.createObjectURL(audioBlob);
            setAudioURL(url);
            audioChunksRef.current = []; // Reset for the next recording
            
            // Send audio data to backend
            sendAudioData(audioBlob);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    };

    const sendAudioData = async (audioBlob) => {
      console.log(audioBlob);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      let audioData;
      // Log contents of formData
      for (let pair of formData.entries()) {
        audioData = pair[1]; 
      }
  
      try {
          const response = await fetch('http://localhost:8000/process-audio', {
              method: 'POST',
              body: audioData,
          });
  
          if (!response.ok) {
              throw new Error('Failed to upload audio');
          }
  
          console.log('Audio upload successful');
      } catch (error) {
          console.error('Error uploading audio:', error);
      }
  };
  

    return (
        <div>
            <h1>Audio Recorder</h1>
            <button onClick={isRecording ? stopRecording : startRecording}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            {audioURL && (
                <audio controls src={audioURL} />
            )}
        </div>
    );
};

export default AudioRecorder;

// src/AudioRecorder.js
// import React, { useState, useRef } from 'react';

// const AudioRecorder = () => {
//     const [isRecording, setIsRecording] = useState(false);
//     const [audioURL, setAudioURL] = useState('');
//     const mediaRecorderRef = useRef(null);
//     const audioChunksRef = useRef([]);

//     const startRecording = async () => {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         mediaRecorderRef.current = new MediaRecorder(stream);

//         mediaRecorderRef.current.ondataavailable = event => {
//             audioChunksRef.current.push(event.data);
//         };

//         mediaRecorderRef.current.onstop = () => {
//             const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
//             const url = URL.createObjectURL(audioBlob);
//             setAudioURL(url);
//             audioChunksRef.current = []; // Reset for the next recording
//         };

//         mediaRecorderRef.current.start();
//         setIsRecording(true);
//     };

//     const stopRecording = () => {
//         mediaRecorderRef.current.stop();
//         setIsRecording(false);
//     };

//     return (
//         <div>
//             <h1>Audio Recorder</h1>
//             <button onClick={isRecording ? stopRecording : startRecording}>
//                 {isRecording ? 'Stop Recording' : 'Start Recording'}
//             </button>
//             {audioURL && (
//                 <audio controls src={audioURL} />
//             )}
//         </div>
//     );
// };

// export default AudioRecorder;