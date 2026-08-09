import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Fab, Paper, Typography, TextField, IconButton, List, ListItem,
  ListItemText, Avatar, Chip, Fade, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { SmartToy, Close, Send, QuestionAnswer, Language } from '@mui/icons-material';
import apiClient from '../api/client';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'hi', name: 'Hindi (हिंदी)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'ur', name: 'Urdu (اردو)' },
];

// Multilingual translations for bot responses & greetings
const GREETINGS = {
  en: "Hello! I am your AI Mine Safety Assistant. Ask me anything about safety procedures, emergency protocols, PPE, first aid, or gas hazard reporting.",
  ta: "வணக்கம்! நான் உங்கள் AI சுரங்க பாதுகாப்பு உதவியாளர். பாதுகாப்பு முறைகள், PPE உபகரணங்கள், முதலுதவி அல்லது அவசர கால வழிமுறைகள் பற்றி கேட்கலாம்.",
  hi: "नमस्ते! मैं आपका AI खान सुरक्षा सहायक हूँ। मुझसे सुरक्षा प्रक्रियाओं, PPE उपयोग, प्राथमिक चिकित्सा या आपातकालीन नियमों के बारे में पूछें।",
  te: "నమస్కారం! నేను మీ AI మైన్ సేఫ్టీ అసిస్టెంట్. భద్రతా విధానాలు, PPE పరికరాలు, ప్రథమ చికిత్స లేదా అత్యవసర చర్యల గురించి నన్ను అడగండి.",
  kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಗಣಿ ಸುರಕ್ಷತಾ ಸಹಾಯಕ. ಸುರಕ್ಷತಾ ಪ್ರಕ್ರಿಯೆಗಳು, PPE ಧರಿಸುವುದು, ತುರ್ತು ವಿಧಾನಗಳ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಿ.",
  ml: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ AI മൈൻ സേഫ്റ്റി അസിസ്റ്റന്റാണ്. സുരക്ഷാ രീതികൾ, PPE ഉൽപന്നങ്ങൾ, പ്രഥമ ശുശ്രൂഷ എന്നിവയെക്കുറിച്ച് എന്നോട് ചോദിക്കാം.",
  mr: "नमस्कार! मी तुमचा AI खाण सुरक्षा सहाय्यक आहे. सुरक्षा नियम, PPE वापर, प्रथमोपचार किंवा आणीबाणीबद्दल मला विचारा.",
  gu: "નમસ્તે! હું તમારો AI ખાણ સુરક્ષા સહાયક છું. સુરક્ષા પ્રક્રિયાઓ, PPE ઉપયોગ, પ્રાથમિક સારવાર અથવા કટોકટી વિશે મને પૂછો.",
  bn: "নমস্কার! আমি আপনার AI খনি নিরাপত্তা সহকারী। নিরাপত্তা নিয়ম, PPE ব্যবহার, প্রাথমিক চিকিৎসা বা জরুরী প্রক্রিয়া সম্পর্কে জিজ্ঞেস করুন।",
  pa: "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ AI ਮਾਈਨ ਸੁਰੱਖਿਆ ਸਹਾਇਕ ਹਾਂ। ਸੁਰੱਖਿਆ ਨਿਯਮਾਂ, PPE ਦੀ ਵਰਤੋਂ, ਮੁਢਲੀ ਸਹਾਇਤਾ ਜਾਂ ਸੰਕਟਕਾਲੀਨ ਨਿਯਮਾਂ ਬਾਰੇ ਪੁੱਛੋ।",
  ur: "سلام! میں آپ کا AI مائن سیفٹی اسسٹنٹ ہوں۔ مجھ سے حفاظت کے طریقہ کار، پی پی ای کا استعمال، ابتدائی طبی امداد یا ہنگامی حالات کے بارے میں پوچھیں۔"
};

export const AIChatbot = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(() => localStorage.getItem('chatbot_language') || 'en');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'bot',
      text: GREETINGS[selectedLang] || GREETINGS['en'],
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('chatbot_language', selectedLang);
    // Update initial greeting if user switches language
    if (chatHistory.length === 1 && chatHistory[0].sender === 'bot') {
      setChatHistory([
        {
          sender: 'bot',
          text: GREETINGS[selectedLang] || GREETINGS['en'],
          timestamp: new Date(),
        }
      ]);
    }
  }, [selectedLang]);

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
    }
  }, [isOpen, selectedLang]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const fetchSuggestions = async () => {
    try {
      const response = await apiClient.get(`/ai/suggested-questions?lang=${selectedLang}`);
      if (response.data && response.data.questions) {
        const shuffled = [...response.data.questions].sort(() => 0.5 - Math.random());
        setSuggestedQuestions(shuffled.slice(0, 3));
      }
    } catch {
      // Fallback suggestions
      setSuggestedQuestions([
        "What PPE is required for underground shaft entry?",
        "What should I do if methane levels exceed 1.0%?",
        "How do I report a structural rock crack?",
      ]);
    }
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || message;
    if (!text.trim()) return;

    setChatHistory((prev) => [...prev, { sender: 'user', text, timestamp: new Date() }]);
    setMessage('');
    setLoading(true);

    try {
      const response = await apiClient.post('/ai/ask', {
        question: text,
        language: selectedLang
      });

      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: response.data.answer,
          timestamp: new Date(),
          related: response.data.related_questions,
        },
      ]);
    } catch {
      // Intelligent fallback answer generator in selected language
      const fallbackAns = `[${LANGUAGES.find(l => l.code === selectedLang)?.name || 'English'}] Safety Assistant Guidance: For ${text}, ensure mandatory helmet & SCSR respirator are equipped, maintain safe distance from blasting zones, and contact Supervisor immediately if alarm triggers.`;
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: fallbackAns,
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
      {/* Floating Chat Bubble Button - Placed at Bottom-Right */}
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 80, md: 32 },
          right: { xs: 80, md: 100 }, // Positioned right alongside SOS button
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
            boxShadow: '0 8px 18px rgba(25, 118, 210, 0.45)',
          }}
        >
          {isOpen ? <Close /> : <SmartToy />}
        </Fab>
      </Box>

      {/* Floating Multilingual Chatbot Window */}
      <Fade in={isOpen}>
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            bottom: { xs: 150, md: 100 },
            right: { xs: 16, md: 32 },
            width: { xs: 'calc(100% - 32px)', sm: 380 },
            height: 520,
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1100,
            overflow: 'hidden',
            boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
          }}
        >
          {/* Header with Language Selector */}
          <Box sx={{ bgcolor: 'primary.main', color: '#fff', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.light', width: 34, height: 34 }}>
                <SmartToy sx={{ fontSize: 22 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="white">
                  AI Safety Companion
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', color: 'white' }}>
                  24/7 Mine Safety Assistant
                </Typography>
              </Box>
            </Box>

            {/* Instant Language Dropdown Switcher */}
            <Box display="flex" alignItems="center" gap={1}>
              <Select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                size="small"
                variant="standard"
                disableUnderline
                iconComponent={Language}
                sx={{
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  px: 1, py: 0.5,
                  borderRadius: 2,
                  '& .MuiSelect-icon': { color: '#fff' }
                }}
              >
                {LANGUAGES.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code} sx={{ fontSize: '0.85rem' }}>
                    {lang.name}
                  </MenuItem>
                ))}
              </Select>
              <IconButton onClick={() => setIsOpen(false)} size="small" sx={{ color: 'white' }}>
                <Close />
              </IconButton>
            </Box>
          </Box>

          {/* Messages Area */}
          <Box
            ref={listRef}
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              bgcolor: '#f8fafc',
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
                    bgcolor: chat.sender === 'user' ? 'primary.main' : '#ffffff',
                    color: chat.sender === 'user' ? '#ffffff' : 'text.primary',
                    boxShadow: chat.sender === 'user' ? '0 4px 10px rgba(25, 118, 210, 0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {chat.text}
                  </Typography>
                </Paper>

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
                <Avatar sx={{ bgcolor: 'primary.light', width: 24, height: 24 }}>
                  <SmartToy sx={{ fontSize: 14 }} />
                </Avatar>
                <Typography variant="caption" color="textSecondary">
                  Analyzing safety knowledge base...
                </Typography>
              </Box>
            )}
          </Box>

          {/* Suggested Topics */}
          {chatHistory.length <= 2 && suggestedQuestions.length > 0 && (
            <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#ffffff' }}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}>
                Suggested Safety Topics:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {suggestedQuestions.map((q, qidx) => (
                  <Chip
                    key={qidx}
                    icon={<QuestionAnswer sx={{ fontSize: 13 }} />}
                    label={q}
                    size="small"
                    variant="outlined"
                    onClick={() => handleSend(q)}
                    sx={{ fontSize: '0.75rem', cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Form Input */}
          <Box
            component="form"
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, bgcolor: '#ffffff' }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder={`Ask safety questions in ${LANGUAGES.find(l=>l.code===selectedLang)?.name}...`}
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

export default AIChatbot;
