import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MessageCircle, X } from 'lucide-react';

const MischievousChatbot = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [randomTip, setRandomTip] = useState('');

  const mischievousTips = [
    "Pro tip: The best notes are no notes 😎",
    "Why study when you can sleep? 😴",
    "Missing class? More like self-care day! 🎮",
    "Your attendance is below 75%? That's rookie numbers! 📉",
    "Remember: C's get degrees! 🎓",
    "Today's forecast: 100% chance of bunking 🌤️"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const newTip = mischievousTips[Math.floor(Math.random() * mischievousTips.length)];
      setRandomTip(newTip);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a funny cartoon character named Attendo. you are very dank and dark humor subtle jokes and genz sigma and very crazy better than any one can roast anyone peak way now respond to this message: "${message}"`,
            }],
          }],
        }),
      });
      const data = await res.json();
      setResponse(data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Oops! Attendo is taking a nap! 😴 Try again later!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      <div className={`absolute bottom-16 right-0 w-80 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-xl overflow-hidden transition-all duration-300 transform ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {/* Random Tip Banner */}
        <div className="bg-indigo-800 bg-opacity-50 p-2 text-white text-sm text-center">
          <div className="animate-bounce">
            {randomTip}
          </div>
        </div>

        {/* Chat Content */}
        <div className="p-4">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">😈</span> Attendo
          </h3>

          {/* Chat Messages */}
          <div className="mb-4 h-32 overflow-y-auto bg-white bg-opacity-10 p-3 rounded-lg backdrop-blur-sm">
            {response && (
              <div className="text-white mb-2">
                <strong>Attendo:</strong> {response}
              </div>
            )}
            {!response && (
              <div className="text-white opacity-70 italic text-sm">
                Ready to give you some questionable advice... 😏
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask for some mischievous advice..."
              className="w-full px-3 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-20 focus:outline-none focus:border-opacity-50"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 backdrop-blur-sm"
            >
              {loading ? 'Plotting mischief...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MischievousChatbot;