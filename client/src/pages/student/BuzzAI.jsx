import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import buzzImg from '../../img/buzz.jpeg';
import bgImg from '../../img/bg.png';

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
    <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: '4px solid #6200ea', // Purple
          backgroundColor: '#ffffff',
          backgroundImage: `url("${buzzImg}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
        }}>
        </div>
        <div>
          <h1 style={{ margin: 0, color: '#6200ea', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900' }}>Buzz AI</h1>
          <p style={{ margin: 0, color: '#666', fontWeight: 'bold' }}>Star Command Educational Assistant</p>
        </div>
      </div>

      <div style={{
        flex: 1,
        backgroundColor: '#f5f5f5',
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.40), rgba(255, 255, 255, 0.40)), url("${bgImg}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '16px',
        border: '4px solid #8c9eff', // Light blue border
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
      }}>
        
        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  backgroundImage: `url("${buzzImg}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'top center',
                  border: '2px solid #6200ea',
                  flexShrink: 0
                }} />
              )}
              <div style={{
                maxWidth: '75%',
                padding: '12px 20px',
                borderRadius: msg.role === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                backgroundColor: msg.role === 'user' ? '#6200ea' : '#ffffff',
                color: msg.role === 'user' ? '#ffffff' : '#333333',
                border: msg.role === 'assistant' ? '2px solid #aeea00' : 'none',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                fontSize: '1rem',
                lineHeight: '1.5',
                position: 'relative'
              }}>
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
                  width: '40px',
                  height: '40px',
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
        <div style={{ padding: '15px', backgroundColor: '#ffffff', borderTop: '2px solid #eee' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Star Command..."
              style={{
                flex: 1,
                padding: '15px',
                borderRadius: '30px',
                border: '2px solid #ccc',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6200ea'}
              onBlur={(e) => e.target.style.borderColor = '#ccc'}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: '0 25px',
                borderRadius: '30px',
                backgroundColor: '#aeea00',
                color: '#6200ea',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                border: '2px solid #6200ea',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !input.trim() ? 0.7 : 1,
                transition: 'transform 0.1s',
                boxShadow: '0 4px 0 #6200ea'
              }}
              onMouseDown={(e) => { if (!loading && input.trim()) e.target.style.transform = 'translateY(4px)'; e.target.style.boxShadow = 'none'; }}
              onMouseUp={(e) => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 4px 0 #6200ea'; }}
              onMouseLeave={(e) => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 4px 0 #6200ea'; }}
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
