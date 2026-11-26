import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import buzzImg from '../../img/buzz.jpeg';
import bgImg from '../../img/bg.png';
import '../../assets/styles/pages/games.css';

function BuzzAI() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Anant se bhi aage! Hi there space ranger! I am Buzz Lightyear. What would you like to learn about today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send chat history to backend
      const response = await api.post('/chat', {
        messages: [...messages, userMessage]
      });
      
      setMessages((prev) => [...prev, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      let errorMsg = error.response?.data?.error || 'Star Command is currently offline. Please try again later!';
      
      if (errorMsg === 'inappropriate_content') {
        errorMsg = 'Whoa there, Space Ranger! That kind of language is strictly prohibited by Star Command!';
      }
      
      setMessages((prev) => [...prev, { role: 'assistant', content: `[SYSTEM ALERT] ${errorMsg}` }]);
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="buzz-page">
      <div className="buzz-header">
        <div
          className="buzz-avatar"
          style={{ backgroundImage: `url("${buzzImg}")` }}
        />
        <div>
          <h1 className="buzz-title">Buzz AI</h1>
          <p className="buzz-subtitle">Star Command Educational Assistant</p>
        </div>
      </div>

      <div
        className="buzz-chat-box"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.40), rgba(255, 255, 255, 0.40)), url("${bgImg}")`,
        }}
      >
        {/* Messages Area */}
        <div className="buzz-messages">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                width: '100%',
                gap: '10px'
              }}
            >
              {msg.role === 'assistant' && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  backgroundImage: `url("${buzzImg}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'top center',
                  border: '2px solid #6200ea',
                  flexShrink: 0
                }} />
              )}
              <div
                className="buzz-bubble"
                style={{
                  borderRadius: msg.role === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                  backgroundColor: msg.role === 'user' ? '#6200ea' : '#ffffff',
                  color: msg.role === 'user' ? '#ffffff' : '#333333',
                  border: msg.role === 'assistant' ? '2px solid #aeea00' : 'none',
                  position: 'relative'
                }}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px' }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                backgroundImage: `url("${buzzImg}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'top center',
                border: '2px solid #6200ea',
                flexShrink: 0
              }} />
              <div style={{ padding: '12px 20px', borderRadius: '20px 20px 20px 0', backgroundColor: '#ffffff', border: '2px solid #aeea00', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} style={{ width: '6px', height: '6px', backgroundColor: '#6200ea', borderRadius: '50%' }} />
                <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{ width: '6px', height: '6px', backgroundColor: '#6200ea', borderRadius: '50%' }} />
                <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} style={{ width: '6px', height: '6px', backgroundColor: '#6200ea', borderRadius: '50%' }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="buzz-input-bar">
          <form onSubmit={handleSubmit} className="buzz-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Star Command..."
              className="buzz-input"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="buzz-send-btn"
              style={{
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !input.trim() ? 0.7 : 1,
              }}
            >
              Send 🚀
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BuzzAI;
