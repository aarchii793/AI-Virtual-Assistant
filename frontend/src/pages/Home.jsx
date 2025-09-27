
import React, { useContext, useEffect, useRef } from 'react';
import { userDataContext } from '../context/userContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();

  const recognitionRef = useRef(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (!userData) {
      console.log("🚫 No userData available");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("SpeechRecognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    let shouldRestart = true;

    const speak = (text) => {
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = resolve;
        window.speechSynthesis.speak(utterance);
      });
    };

    const handleGeminiAction = async (data) => {
      console.log("⚙ Handling Gemini Action with data:", data);
      const { type, userInput, response } = data;

      switch (type) {
        case "youtube_play":
        case "youtube_search":
          setTimeout(() => {
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, '_blank');
          }, 100);
          await speak(response);
          break;

        case "google_search":
          setTimeout(() => {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, '_blank');
          }, 100);
          await speak(response);
          break;

        case "instagram_open":
          setTimeout(() => {
            window.open("https://www.instagram.com", "_blank");
          }, 100);
          await speak(response);
          break;

        case "facebook_open":
          setTimeout(() => {
            window.open("https://www.facebook.com", "_blank");
          }, 100);
          await speak(response);
          break;

        case "calculator_open":
          await speak(response);
          break;

        case "weather-show":
          setTimeout(() => {
            window.open(`https://www.google.com/search?q=weather+${encodeURIComponent(userInput || 'today')}`, "_blank");
          }, 100);
          await speak(response);
          break;

        case "general":
          await speak(response);
          break;

        default:
          console.log("🚫 No matching action found.");
          await speak(response || "Sorry, I couldn't understand.");
          break;
      }

      isProcessingRef.current = false;
    };

    recognition.onresult = async (event) => {
      if (isProcessingRef.current) {
        console.log("⏳ Still processing previous command...");
        return;
      }

      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      const normalizedTranscript = transcript.toLowerCase().trim();

      console.log("🎙 Heard:", transcript);
      if (!normalizedTranscript) return;

      isProcessingRef.current = true;

      try {
        const data = await getGeminiResponse(normalizedTranscript);
        console.log("🤖 Gemini response received:", data);

        if (data?.response) {
          await handleGeminiAction(data);
        } else {
          console.warn("❌ No valid response from Gemini");
          await speak("Sorry, I couldn't understand.");
          isProcessingRef.current = false;
        }
      } catch (error) {
        console.error("❗ Gemini API Error:", error);
        isProcessingRef.current = false;
      }
    };

    recognition.onerror = (err) => {
      console.error("🎤 SpeechRecognition error:", err);
    };

    recognition.onend = () => {
      if (shouldRestart) {
        console.warn("🔁 Recognition ended, restarting...");
        recognition.start();
      }
    };

    recognition.start();
    console.log("✅ Speech recognition started");

    return () => {
      shouldRestart = false;
      recognition.stop();
      console.log("🛑 Speech recognition stopped");
    };
  }, [userData, getGeminiResponse]);

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.error("Logout error:", error);
    }
  };

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-black to-[#02023d] flex justify-center items-center flex-col gap-[15px]'>
      <button
        className='min-w-[150px] h-[50px] mt-[30px] text-white font-semibold bg-gradient-to-r from-purple-700 to-blue-900 hover:bg-gradient-to-bl absolute top-[20px] right-[20px] rounded-full cursor-pointer text-[18px]'
        onClick={handleLogOut}
      >
        Log Out
      </button>

      <button
        className='min-w-[250px] h-[50px] mt-[30px] text-white font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl absolute top-[100px] right-[20px] rounded-full cursor-pointer text-[18px] px-[20px] py-[10px]'
        onClick={() => navigate("/customize")}
      >
        Customize your Assistant
      </button>

      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
        <img src={userData?.assistantImage} alt="Assistant" className='h-full object-cover' />
      </div>

      <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>
    </div>
  );
}

export default Home;