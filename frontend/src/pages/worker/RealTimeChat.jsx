import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Paper, Grid, TextField, IconButton,
  Avatar, Badge, Chip, List, ListItem, ListItemAvatar, ListItemText,
  Divider, InputAdornment, Button, Tooltip, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ReplyIcon from '@mui/icons-material/Reply';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CircleIcon from '@mui/icons-material/Circle';
import apiClient from '../../api/client';

import { useSocket } from '../../context/SocketContext';

export const RealTimeChat = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyMessage, setReplyMessage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { socket } = useSocket();

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      const targetId = selectedContact.user_id || selectedContact.id;
      fetchConversation(targetId);
    }
  }, [selectedContact]);


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleSocketMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message') {
          if (
            (data.sender_id === selectedContact?.user_id && data.receiver_id === currentUser.id) ||
            (data.sender_id === currentUser.id && data.receiver_id === selectedContact?.user_id)
          ) {
            setMessages((prev) => [...prev, data]);
          }
        }
        if (data.type === 'delete_message') {
          setMessages((prev) => prev.filter(m => m.id !== data.id));
        }
      } catch (e) {
        console.error("Socket error in Chat:", e);
      }
    };

    socket.addEventListener('message', handleSocketMessage);
    return () => socket.removeEventListener('message', handleSocketMessage);
  }, [socket, selectedContact]);

  const fetchContacts = async () => {
    try {
      const res = await apiClient.get('/messages/contacts');
      setContacts(res.data);
      if (res.data.length > 0 && !selectedContact) {
        setSelectedContact(res.data[0]);
      }
    } catch (e) {
      console.log("Error fetching contacts:", e);
    }
  };

  const fetchConversation = async (contactId) => {
    try {
      const res = await apiClient.get(`/messages/conversation/${contactId}`);
      setMessages(res.data);
    } catch (e) {
      console.log("Error fetching conversation:", e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (mediaUrl = null, mediaType = 'text') => {
    if (!selectedContact) {
      alert("Please select a contact from the list on the left first.");
      return;
    }
    if (!inputText.trim() && !mediaUrl) return;

    const targetUserId = selectedContact.user_id || selectedContact.id;

    const payload = {
      receiver_id: targetUserId,
      message_type: 'direct',
      content: inputText || (mediaType === 'image' ? '[Photo]' : mediaType === 'voice' ? '[Voice Note]' : '[File]'),
      media_url: mediaUrl,
      media_type: mediaType,
      reply_to_id: replyMessage?.id || null
    };

    try {
      const res = await apiClient.post('/messages/send', payload);
      setMessages((prev) => [...prev, res.data]);
      setInputText('');
      setReplyMessage(null);
    } catch (e) {
      console.error("Failed to send message:", e);
      alert(e.response?.data?.detail || "Failed to send message. Please verify receiver contact.");
    }
  };


  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('media_type', file.type.startsWith('image/') ? 'image' : 'document');

    try {
      const res = await apiClient.post('/messages/upload-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      handleSendMessage(res.data.media_url, res.data.media_type);
    } catch (err) {
      console.error("Media upload failed:", err);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], 'voice_note.webm', { type: 'audio/webm' });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('media_type', 'voice');

        try {
          const res = await apiClient.post('/messages/upload-media', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          handleSendMessage(res.data.media_url, 'voice');
        } catch (e) {
          console.error("Voice note upload failed:", e);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (e) {
      alert("Microphone access is required for voice notes.");
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await apiClient.delete(`/messages/${msgId}`);
      setMessages((prev) => prev.filter(m => m.id !== msgId));
    } catch (e) {
      console.error("Failed to delete message:", e);
    }
  };


  const filteredMessages = searchQuery
    ? messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <Container maxWidth="xl" sx={{ py: 3, height: 'calc(100vh - 90px)' }}>
      <Paper sx={{ height: '100%', borderRadius: 3, overflow: 'hidden', boxShadow: 4 }}>
        <Grid container sx={{ height: '100%' }}>
          {/* Left Panel: Contacts List */}
          <Grid item xs={12} md={4} sx={{ borderRight: '1px solid #e0e0e0', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                💬 Safety Chat Channels
              </Typography>
              <TextField
                size="small"
                fullWidth
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Divider />

            <List sx={{ overflowY: 'auto', flexGrow: 1 }}>
              {contacts.map((contact) => (
                <React.Fragment key={contact.user_id}>
                  <ListItem
                    button
                    selected={selectedContact?.user_id === contact.user_id}
                    onClick={() => setSelectedContact(contact)}
                    sx={{
                      '&.Mui-selected': { bgcolor: '#e3f2fd' },
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={<CircleIcon sx={{ color: '#4caf50', fontSize: 14 }} />}
                      >
                        <Avatar sx={{ bgcolor: contact.role === 'admin' ? '#d32f2f' : '#1976d2' }}>
                          {contact.full_name[0]}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="bold">
                          {contact.full_name}
                        </Typography>
                      }
                      secondary={
                        <Chip
                          label={contact.role.toUpperCase()}
                          size="small"
                          color={contact.role === 'admin' ? 'error' : contact.role === 'supervisor' ? 'warning' : 'primary'}
                          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }}
                        />
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Grid>

          {/* Right Panel: Active Chat Room */}
          <Grid item xs={12} md={8} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <Box sx={{ p: 2, bgcolor: '#fafafa', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: selectedContact.role === 'admin' ? '#d32f2f' : '#1976d2' }}>
                    {selectedContact.full_name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedContact.full_name}
                    </Typography>
                    <Typography variant="caption" color="success.main" fontWeight="bold">
                      ● Online | {selectedContact.department}
                    </Typography>
                  </Box>
                </Box>

                {/* Messages Body */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, bgcolor: '#f8f9fa' }}>
                  {filteredMessages.map((msg) => {
                    const isSelf = msg.sender_id === currentUser.id;
                    return (
                      <Box
                        key={msg.id}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isSelf ? 'flex-end' : 'flex-start',
                          mb: 2
                        }}
                      >
                        <Paper
                          elevation={1}
                          sx={{
                            p: 2,
                            maxWidth: '70%',
                            borderRadius: 3,
                            bgcolor: isSelf ? '#1976d2' : '#ffffff',
                            color: isSelf ? '#ffffff' : 'text.primary',
                            position: 'relative'
                          }}
                        >
                          {/* Sender Name & Specified Role */}
                          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, opacity: 0.9, color: isSelf ? '#e3f2fd' : 'primary.main' }}>
                            {msg.sender_name || (isSelf ? `${currentUser.profile?.full_name || currentUser.username || 'You'} (${(currentUser.role || 'worker').charAt(0).toUpperCase() + (currentUser.role || 'worker').slice(1)})` : selectedContact?.full_name)}
                          </Typography>

                          {/* Image Attachment */}
                          {msg.media_type === 'image' && msg.media_url && (
                            <Box sx={{ mb: 1 }}>
                              <img
                                src={msg.media_url}
                                alt="Shared media"
                                style={{ width: '100%', borderRadius: 8, maxHeight: 200, objectFit: 'cover' }}
                              />
                            </Box>
                          )}

                          {/* Voice Note Attachment */}
                          {msg.media_type === 'voice' && msg.media_url && (
                            <Box sx={{ mb: 1 }}>
                              <audio controls src={msg.media_url} style={{ width: '100%' }} />
                            </Box>
                          )}

                          <Typography variant="body1">{msg.content}</Typography>

                          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 1, gap: 1 }}>
                            <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                              {msg.created_at || "Just now"}
                            </Typography>

                            {isSelf && (
                              <DoneAllIcon sx={{ fontSize: 16, color: msg.delivered_status === 'seen' ? '#4caf50' : 'inherit' }} />
                            )}
                          </Box>
                        </Paper>

                        <Box display="flex" gap={1} sx={{ mt: 0.5 }}>
                          <IconButton size="small" onClick={() => setReplyMessage(msg)}>
                            <ReplyIcon fontSize="small" />
                          </IconButton>
                          {isSelf && (
                            <IconButton size="small" color="error" onClick={() => handleDeleteMessage(msg.id)}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Reply Banner */}
                {replyMessage && (
                  <Box sx={{ p: 1, px: 2, bgcolor: '#fffde7', borderTop: '1px solid #ffe082', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" fontWeight="bold">
                      Replying to: {replyMessage.content}
                    </Typography>
                    <Button size="small" color="secondary" onClick={() => setReplyMessage(null)}>Cancel</Button>
                  </Box>
                )}

                {/* Message Input Box */}
                <Box sx={{ p: 2, bgcolor: '#ffffff', borderTop: '1px solid #e0e0e0' }}>
                  <TextField
                    fullWidth
                    placeholder="Type a safety message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconButton component="label">
                            <AttachFileIcon />
                            <input ref={fileInputRef} type="file" hidden onChange={handleFileUpload} />
                          </IconButton>
                          <IconButton onClick={() => setInputText((prev) => prev + " 👍")}>
                            <EmojiEmotionsIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {isRecording ? (
                            <IconButton color="error" onClick={stopVoiceRecording}>
                              <StopIcon />
                            </IconButton>
                          ) : (
                            <IconButton color="primary" onClick={startVoiceRecording}>
                              <MicIcon />
                            </IconButton>
                          )}
                          <IconButton color="primary" onClick={() => handleSendMessage()}>
                            <SendIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>
              </>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '100%' }}>
                <Typography variant="h6" color="text.secondary">Select a contact to start messaging</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};
