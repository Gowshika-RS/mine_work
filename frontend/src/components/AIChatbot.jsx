import { useState, useRef, useEffect } from 'react';
import { Box, Fab, Paper, Typography, TextField, IconButton, List, ListItem, ListItemText, Avatar, Chip, Fade } from '@mui/material';
import { SmartToy, Close, Send, QuestionAnswer } from '@mui/icons-material';
import apiClient from '../api/client';

export const AIChatbot = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your AI Mine Safety Assistant. Ask me anything about safety procedures, emergency protocols, PPE, or gas levels.",
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const fetchSuggestions = async () => {
    try {
      const response = await apiClient.get('/ai/suggested-questions');
      if (response.data && response.data.questions) {
        // Pick 3 random questions
        const shuffled = [...response.data.questions].sort(() => 0.5 - Math.random());
        setSuggestedQuestions(shuffled.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    }
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || message;
    if (!text.trim()) return;

    setChatHistory((prev) => [...prev, { sender: 'user', text, timestamp: new Date() }]);
    setMessage('');
    setLoading(true);

    try {
      const response = await apiClient.post('/ai/ask', { question: text });
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: response.data.answer,
          timestamp: new Date(),
          related: response.data.related_questions,
        },
      ]);
    } catch (err) {
      console.error('Failed to ask AI:', err);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Sorry, I am having trouble connecting to the safety knowledge base right now.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (userRole !== 'worker') return null;

  return (
    <>
      {/* Floating Chat Bubble Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 80, md: 32 },
          left: { xs: 16, md: 32 },
          zIndex: 1100,
        }}
      >
        <Fab
          color="primary"
          aria-label="chat"
          onClick={() => setIsOpen((prev) => !isOpen)}
          sx={{
            width: 56,
            height: 56,
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.4)',
          }}
        >
          {isOpen ? <Close /> : <SmartToy />}
        </Fab>
      </Box>

      {/* Chat Window Panel */}
      <Fade in={isOpen}>
        <Paper
          elevation={4}
          sx={{
            position: 'fixed',
            bottom: { xs: 150, md: 100 },
            left: { xs: 16, md: 32 },
            width: { xs: 'calc(100% - 32px)', sm: 360 },
            height: 480,
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1100,
            overflow: 'hidden',
            boxShadow: '0 12px 36px rgba(0,0,0,0.15)',
          }}
        >
          {/* Header */}
          <Box sx={{ bgcolor: 'primary.main', color: '#white', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                <SmartToy sx={{ fontSize: 20 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="white">
                  AI Safety Assistant
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', color: 'white' }}>
                  Online &bull; Knowledge Base
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setIsOpen(false)} size="small" sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>

          {/* Messages area */}
          <Box 
            ref={listRef}
            sx={{ 
              flex: 1, 
              overflowY: 'auto', 
              p: 2, 
              bgcolor: 'background.default',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5
            }}
          >
            {chatHistory.map((chat, idx) => (
              <Box 
                key={idx}
                sx={{ 
                  alignSelf: chat.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                <Paper 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 3, 
                    bgcolor: chat.sender === 'user' ? 'primary.main' : 'background.paper',
                    color: chat.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {chat.text}
                  </Typography>
                </Paper>
                
                {/* Related suggested questions from bot response */}
                {chat.sender === 'bot' && chat.related && chat.related.length > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {chat.related.map((q, qidx) => (
                      <Chip 
                        key={qidx} 
                        label={q} 
                        size="small" 
                        onClick={() => handleSend(q)} 
                        sx={{ fontSize: '0.75rem', cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            ))}
            {loading && (
              <Box sx={{ alignSelf: 'flex-start', display: 'flex', gap: 1, alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'action.disabledBackground', width: 24, height: 24 }}>
                  <SmartToy sx={{ fontSize: 16 }} />
                </Avatar>
                <Typography variant="caption" color="textSecondary">
                  Assistant is typing...
                </Typography>
              </Box>
            )}
          </Box>

          {/* Quick Suggestions (if no user question yet) */}
          {chatHistory.length === 1 && suggestedQuestions.length > 0 && (
            <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                Suggested Safety Topics:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {suggestedQuestions.map((q, qidx) => (
                  <Chip
                    key={qidx}
                    icon={<QuestionAnswer sx={{ fontSize: 14 }} />}
                    label={q}
                    variant="outlined"
                    onClick={() => handleSend(q)}
                    sx={{ alignSelf: 'flex-start', maxWidth: '100%', cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Input form */}
          <Box 
            component="form" 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, bgcolor: 'background.paper' }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Ask safety protocols..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <IconButton type="submit" color="primary" disabled={loading || !message.trim()}>
              <Send />
            </IconButton>
          </Box>
        </Paper>
      </Fade>
    </>
  );
};
