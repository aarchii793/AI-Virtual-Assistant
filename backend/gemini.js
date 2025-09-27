import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiUrl = process.env.GEMINI_API_URL;

    const prompt = `You are a virtual voice-enabled assistant named ${assistantName}, created by ${userName}.
Your task is to understand the user's natural language command and respond with a valid JSON object in the following format:

{
  "type": "general" | "google_search" | "youtube_search" | "youtube_play" | "get_time" | "get_date" | "get_day" | "get_month" | "calculator_open" | "instagram_open" | "facebook_open" | "weather-show",
  "userInput": "<cleaned user query>",
  "response": "<voice-friendly short reply>"
}

⚠ Only return the JSON object. No explanations.

Now process this user input:
"${command}"`;

    const result = await axios.post(apiUrl, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    return result.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini fetch error:", error);
    return null;
  }
};

export default geminiResponse;