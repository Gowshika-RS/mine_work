import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, IconButton, Avatar, Chip,
  LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Divider, Tooltip, Select, MenuItem, FormControl, InputLabel,
  Paper, Switch
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Activity, Thermometer, Droplets, Wind, AlertTriangle, Navigation, User, Clock,
  PhoneCall, MessageSquare, AlertCircle, CheckSquare, Compass, MapPin, BatteryCharging,
  Wrench, Sparkles, Mic, MicOff, Award, Volume2, Camera, Upload, Play, Square, RefreshCw,
  Eye, HelpCircle, Bell, Wifi, WifiOff, CornerDownRight, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import i18n from '../../i18n';
import apiClient from '../../api/client';
import { useGeo } from '../../context/GeolocationContext';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

// Comprehensive UI translations dictionary for English + 10 regional Indian languages
const tUI = {
  en: {
    title: "AI Safety Portal",
    subtitle: "Enterprise Mine Security & Telemetry",
    welcome: "Hello",
    staySafe: "Stay safe today.",
    safetyStatus: "Safety Status",
    riskScore: "Risk Score",
    fullAnalysis: "View Full Analysis",
    activeShift: "Active Shift",
    offDuty: "Off Duty",
    hoursWorked: "Hours Worked",
    environment: "Environment",
    surface: "Surface",
    mine: "Underground Mine",
    temperature: "Temperature",
    humidity: "Humidity",
    airQuality: "Air Quality",
    gasStatus: "Gas Status",
    visibility: "Visibility",
    supervisorAnnounce: "Supervisor Notices",
    quickActions: "Quick Actions",
    aiAssistant: "AI Safety Assistant",
    aiHazardScanner: "AI Hazard Scanner",
    offlineMap: "Offline Mine Map",
    emergencySos: "Emergency SOS",
    voiceAssistant: "Voice AI Assistant",
    checklist: "Daily PPE Checklist",
    notifications: "Recent Alerts",
    todayTasks: "Today's Safety Tasks",
    progress: "Progress",
    equipmentStatus: "Safety Equipment Status",
    shiftInfo: "Shift Details",
    emergencyContacts: "Emergency Contacts",
    safetyAnalytics: "Personal Safety Analytics",
    recentHazards: "Recent Hazard Reports",
    achievements: "Achievements & Badges",
    statusPending: "Pending",
    statusApproved: "Approved",
    statusResolved: "Resolved",
    sosTriggered: "SOS Triggered",
    nearestExit: "Nearest Exit",
    assemblyPoint: "Assembly Point",
    safeRoute: "Safe Route",
    askQuestion: "Ask Safety Question...",
    listening: "Listening...",
    speakAnswer: "Speak Response",
    safeDays: "Safe Working Days",
    streak: "Day Streak",
    monthlyPerformance: "Monthly Performance",
    battery: "Battery",
    inspection: "Inspection",
    dueMaintenance: "Next Service",
    supervisorName: "Supervisor",
    shiftTime: "Shift Time",
    workDuration: "Duration",
    attendance: "Attendance",
    breakStatus: "Break Status",
    requestBreak: "Request Break",
    call: "Call",
    message: "Message",
    sos: "SOS",
    nearestSafeExit: "Nearest Exit",
    depth: "Depth",
    tunnel: "Tunnel",
    section: "Section",
    mineName: "Mine Name",
    reportedHazards: "Hazards Reported",
    checklistsCompleted: "Checklists Submitted",
    aiImprovement: "AI Recommendations",
    uploadImage: "Upload Image",
    captureImage: "Capture Image",
    analyzingImage: "AI is analyzing image...",
    hazardReported: "Hazard Reported",
    severity: "Severity",
    riskLevel: "Risk Level",
    precautions: "Precautions",
    requiredPpe: "Required PPE",
    immediateActions: "Immediate Actions",
    submitReport: "Submit Report",
    online: "Online",
    offline: "Offline",
  },
  ta: {
    title: "AI சுரங்க பாதுகாப்பு போர்டல்",
    subtitle: "பாதுகாப்பு & சுற்றுச்சூழல் தரவு போர்டல்",
    welcome: "வணக்கம்",
    staySafe: "இன்று பாதுகாப்பாக இருங்கள்.",
    safetyStatus: "பாதுகாப்பு நிலை",
    riskScore: "ஆபத்து மதிப்பெண்",
    fullAnalysis: "முழு பகுப்பாய்வை காண்க",
    activeShift: "செயலில் உள்ள ஷிப்ட்",
    offDuty: "பணியில் இல்லை",
    hoursWorked: "வேலை நேரம்",
    environment: "சுற்றுச்சூழல்",
    surface: "மேற்பரப்பு",
    mine: "சுரங்கம்",
    temperature: "வெப்பநிலை",
    humidity: "ஈரப்பதம்",
    airQuality: "காற்றின் தரம்",
    gasStatus: "வாயு நிலை",
    visibility: "பார்வை திறன்",
    supervisorAnnounce: "மேற்பார்வையாளர் அறிவிப்புகள்",
    quickActions: "விரைவான செயல்கள்",
    aiAssistant: "AI பாதுகாப்பு உதவியாளர்",
    aiHazardScanner: "AI ஆபத்து ஸ்கேனர்",
    offlineMap: "ஆஃப்லைன் வரைபடம்",
    emergencySos: "அவசர SOS",
    voiceAssistant: "குரல் AI உதவியாளர்",
    checklist: "தினசரி PPE சரிபார்ப்பு",
    notifications: "சமீபத்திய எச்சரிக்கைகள்",
    todayTasks: "இன்றைய பாதுகாப்பு பணிகள்",
    progress: "முன்னேற்றம்",
    equipmentStatus: "பாதுகாப்பு உபகரணங்கள்",
    shiftInfo: "ஷிப்ட் விவரங்கள்",
    emergencyContacts: "அவசர தொடர்புகள்",
    safetyAnalytics: "பாதுகாப்பு பகுப்பாய்வு",
    recentHazards: "சமீபத்திய ஆபத்துகள்",
    achievements: "சாதனைகள் & பேட்ஜ்கள்",
    statusPending: "நிலுவையில்",
    statusApproved: "அங்கீகரிக்கப்பட்டது",
    statusResolved: "தீர்க்கப்பட்டது",
    sosTriggered: "SOS தூண்டப்பட்டது",
    nearestExit: "வெளியேறும் வழி",
    assemblyPoint: "சந்திப்பு புள்ளி",
    safeRoute: "பாதுகாப்பான வழி",
    askQuestion: "பாதுகாப்பு கேள்விகளைக் கேளுங்கள்...",
    listening: "கேட்கிறது...",
    speakAnswer: "குரல் பதில்",
    safeDays: "பாதுகாப்பான நாட்கள்",
    streak: "பாதுகாப்பு நாட்கள்",
    monthlyPerformance: "மாதாந்திர செயல்திறன்",
    battery: "பேட்டரி",
    inspection: "ஆய்வு",
    dueMaintenance: "அடுத்த சேவை",
    supervisorName: "மேற்பார்வையாளர்",
    shiftTime: "ஷிப்ட் நேரம்",
    workDuration: "கால அளவு",
    attendance: "வருகை",
    breakStatus: "இடைவேளை நிலை",
    requestBreak: "இடைவேளை கோரிக்கை",
    call: "அழை",
    message: "செய்தி",
    sos: "SOS",
    nearestSafeExit: "வெளியேறும் வழி",
    depth: "ஆழம்",
    tunnel: "சுரங்கப்பாதை",
    section: "பிரிவு",
    mineName: "சுரங்கத்தின் பெயர்",
    reportedHazards: "அறிவிக்கப்பட்ட ஆபத்துகள்",
    checklistsCompleted: "சமர்ப்பிக்கப்பட்ட சரிபார்ப்புகள்",
    aiImprovement: "AI பரிந்துரைகள்",
    uploadImage: "பதிவேற்று",
    captureImage: "படம் பிடி",
    analyzingImage: "AI பகுப்பாய்வு செய்கிறது...",
    hazardReported: "ஆபத்து பதிவாகியுள்ளது",
    severity: "தீவிரம்",
    riskLevel: "ஆபத்து நிலை",
    precautions: "முன்னெச்சரிக்கைகள்",
    requiredPpe: "தேவையான PPE",
    immediateActions: "உடனடி நடவடிக்கைகள்",
    submitReport: "அறிக்கையைச் சமர்ப்பி",
    online: "ஆன்லைன்",
    offline: "ஆஃப்லைன்",
  },
  hi: {
    title: "AI खदान सुरक्षा पोर्टल",
    subtitle: "उन्नत सुरक्षा और पर्यावरण टेलीमेट्री पोर्टल",
    welcome: "नमस्ते",
    staySafe: "आज सुरक्षित रहें।",
    safetyStatus: "सुरक्षा स्थिति",
    riskScore: "जोखिम स्कोर",
    fullAnalysis: "पूर्ण विश्लेषण देखें",
    activeShift: "सक्रिय शिफ्ट",
    offDuty: "ड्यूटी से बाहर",
    hoursWorked: "कार्य के घंटे",
    environment: "पर्यावरण",
    surface: "सतह",
    mine: "खदान",
    temperature: "तापमान",
    humidity: "आर्द्रता",
    airQuality: "वायु गुणवत्ता",
    gasStatus: "गैस स्थिति",
    visibility: "दृश्यता",
    supervisorAnnounce: "पर्यवेक्षक घोषणाएं",
    quickActions: "त्वरित कार्रवाई",
    aiAssistant: "AI सुरक्षा सहायक",
    aiHazardScanner: "AI खतरा स्कैनर",
    offlineMap: "ऑफ़लाइन खदान मानचित्र",
    emergencySos: "आपातकालीन SOS",
    voiceAssistant: "आवाज AI सहायक",
    checklist: "दैनिक पीपीई चेकलिस्ट",
    notifications: "हालिया अलर्ट",
    todayTasks: "आज के सुरक्षा कार्य",
    progress: "प्रगति",
    equipmentStatus: "सुरक्षा उपकरण स्थिति",
    shiftInfo: "शिफ्ट विवरण",
    emergencyContacts: "आपातकालीन संपर्क",
    safetyAnalytics: "व्यक्तिगत सुरक्षा विश्लेषण",
    recentHazards: "हालिया खतरे की रिपोर्ट",
    achievements: "उपलब्धियां और बैज",
    statusPending: "लंबित",
    statusApproved: "स्वीकृत",
    statusResolved: "सुलझाया गया",
    sosTriggered: "SOS सक्रिय",
    nearestExit: "निकटतम निकास",
    assemblyPoint: "सभा स्थल",
    safeRoute: "सुरक्षित मार्ग",
    askQuestion: "सुरक्षा प्रश्न पूछें...",
    listening: "सुन रहा हूँ...",
    speakAnswer: "उत्तर बोलें",
    safeDays: "सुरक्षित कार्य दिवस",
    streak: "सुरक्षित दिनों का सिलसिला",
    monthlyPerformance: "मासिक प्रदर्शन",
    battery: "बैटरी",
    inspection: "निरीक्षण",
    dueMaintenance: "अगली सेवा",
    supervisorName: "पर्यवेक्षक",
    shiftTime: "शिफ्ट का समय",
    workDuration: "अवधि",
    attendance: "उपस्थिति",
    breakStatus: "ब्रेक की स्थिति",
    requestBreak: "ब्रेक का अनुरोध करें",
    call: "कॉल करें",
    message: "संदेश",
    sos: "SOS",
    nearestSafeExit: "निकटतम निकास",
    depth: "गहराई",
    tunnel: "सुरंग",
    section: "अनुभाग",
    mineName: "खदान का नाम",
    reportedHazards: "खतरे की रिपोर्ट",
    checklistsCompleted: "चेकलिस्ट जमा की गई",
    aiImprovement: "AI सिफारिशें",
    uploadImage: "छवि अपलोड करें",
    captureImage: "फोटो खींचें",
    analyzingImage: "AI छवि का विश्लेषण कर रहा है...",
    hazardReported: "खतरे की सूचना मिली",
    severity: "तीव्रता",
    riskLevel: "जोखिम स्तर",
    precautions: "सावधानियां",
    requiredPpe: "आवश्यक पीपीई",
    immediateActions: "तत्काल कार्रवाई",
    submitReport: "रिपोर्ट जमा करें",
    online: "ऑनलाइन",
    offline: "ऑफ़लाइन",
  },
  te: {
    title: "AI మైన్ సేఫ్టీ పోర్టల్",
    subtitle: "భద్రత & పర్యావరణ టెలిమెట్రీ",
    welcome: "నమస్తే",
    staySafe: "ఈరోజు సురక్షితంగా ఉండండి.",
    safetyStatus: "భద్రతా స్థితి",
    riskScore: "ప్రమాద స్కోర్",
    fullAnalysis: "పూర్తి విశ్లేషణ చూడండి",
    activeShift: "యాక్టివ్ షిఫ్ట్",
    offDuty: "విధుల్లో లేరు",
    hoursWorked: "పని గంటలు",
    environment: "పర్యావరణం",
    surface: "ఉపరితలం",
    mine: "గని",
    temperature: "ఉష్ణోగ్రత",
    humidity: "తేమ",
    airQuality: "గాలి నాణ్యత",
    gasStatus: "గ్యాస్ స్థితి",
    visibility: "దృశ్యమానత",
    supervisorAnnounce: "సూపర్వైజర్ నోటీసులు",
    quickActions: "త్వరిత చర్యలు",
    aiAssistant: "AI సేఫ్టీ అసిస్టెంట్",
    aiHazardScanner: "AI హజార్డ్ స్కానర్",
    offlineMap: "ఆఫ్‌లైన్ గని మ్యాప్",
    emergencySos: "అవసర SOS",
    voiceAssistant: "వాయిస్ AI అసిస్టెంట్",
    checklist: "PPE చెక్‌లిస్ట్",
    notifications: "ఇటీవలి హెచ్చరికలు",
    todayTasks: "ఈరోజు భద్రతా పనులు",
    progress: "పురోగతి",
    equipmentStatus: "పరికరాల స్థితి",
    shiftInfo: "షిఫ్ట్ వివరాలు",
    emergencyContacts: "అత్యవసర సంప్రదింపులు",
    safetyAnalytics: "భద్రతా విశ్లేషణ",
    recentHazards: "ఇటీవలి ప్రమాద నివేదికలు",
    achievements: "విజయాలు & బ్యాడ్జ్‌లు",
    statusPending: "పెండింగ్",
    statusApproved: "ఆమోదించబడింది",
    statusResolved: "పరిష్కరించబడింది",
    sosTriggered: "SOS యాక్టివేట్",
    nearestExit: "దగ్గరి నिकास",
    assemblyPoint: "అసెంబ్లీ పాయింట్",
    safeRoute: "సురక్షిత మార్గం",
    askQuestion: "భద్రతా ప్రశ్న అడగండి...",
    listening: "వింటున్నాము...",
    speakAnswer: "వాయిస్ సమాధానం",
    safeDays: "సురక్షిత దినాలు",
    streak: "సురక్షిత రోజుల క్రమం",
    monthlyPerformance: "నెలవారీ పనితీరు",
    battery: "బ్యాటరీ",
    inspection: "తనిఖీ",
    dueMaintenance: "తదుపరి సర్వీస్",
    supervisorName: "సూపర్వైజర్",
    shiftTime: "షిఫ్ట్ సమయం",
    workDuration: "వ్యవధి",
    attendance: "హాజరు",
    breakStatus: "విరామం స్థితి",
    requestBreak: "విరామం అడగండి",
    call: "కాల్",
    message: "సందేశం",
    sos: "SOS",
    nearestSafeExit: "నిష్క్రమణ దారి",
    depth: "లోతు",
    tunnel: "సురంగం",
    section: "విభాగం",
    mineName: "గని పేరు",
    reportedHazards: "రిపోర్ట్ చేసిన ప్రమాదాలు",
    checklistsCompleted: "సమర్పించిన చెక్‌లిస్ట్‌లు",
    aiImprovement: "AI సిఫార్సులు",
    uploadImage: "అప్‌లోడ్",
    captureImage: "ఫోటో తీయి",
    analyzingImage: "AI విశ్లేషిస్తోంది...",
    hazardReported: "ప్రమాదం నమోదైంది",
    severity: "తీవ్రత",
    riskLevel: "ప్రమాద తీవ్రత",
    precautions: "జాగ్రత్తలు",
    requiredPpe: "అవసరమైన PPE",
    immediateActions: "తక్షణ చర్యలు",
    submitReport: "సమర్పించండి",
    online: "ఆన్‌లైన్",
    offline: "ఆఫ్‌లైన్",
  },
  kn: {
    title: "AI ಗಣಿ ಸುರಕ್ಷತಾ ಪೋರ್ಟಲ್",
    subtitle: "ಭದ್ರತೆ ಮತ್ತು ಪರಿಸರ ಟೆಲಿಮೆಟ್ರಿ",
    welcome: "ನಮಸ್ತೆ",
    staySafe: "ಇಂದು ಸುರಕ್ಷಿತವಾಗಿರಿ.",
    safetyStatus: "ಸುರಕ್ಷತಾ ಸ್ಥಿತಿ",
    riskScore: "ಅಪಾಯದ ಸ್ಕೋರ್",
    fullAnalysis: "ಪೂರ್ಣ ವಿಶ್ಲೇಷಣೆ ವೀಕ್ಷಿಸಿ",
    activeShift: "ಸಕ್ರಿಯ ಶಿಫ್ಟ್",
    offDuty: "ಕರ್ತವ್ಯದಿಂದ ಹೊರಗೆ",
    hoursWorked: "ಕೆಲಸದ ಅವಧಿ",
    environment: "ಪರಿಸರ",
    surface: "ಮೇಲ್ಮೈ",
    mine: "ಗಣಿ",
    temperature: "ತಾಪಮಾನ",
    humidity: "ಆರ್ದ್ರತೆ",
    airQuality: "ಗಾಳಿಯ ಗುಣಮಟ್ಟ",
    gasStatus: "ಅನಿಲ ಸ್ಥಿತಿ",
    visibility: "ದೃಷ್ಟಿಗೋಚರತೆ",
    supervisorAnnounce: "ಮೇಲ್ವಿಚಾರಕರ ಪ್ರಕಟಣೆಗಳು",
    quickActions: "ತ್ವರಿತ ಕ್ರಮಗಳು",
    aiAssistant: "AI ಸುರಕ್ಷತಾ ಸಹಾಯಕ",
    aiHazardScanner: "AI ಅಪಾಯದ ಸ್ಕ್ಯಾನರ್",
    offlineMap: "ಆಫ್‌ಲೈನ್ ಗಣಿ ನಕ್ಷೆ",
    emergencySos: "ತುರ್ತು SOS",
    voiceAssistant: "ಧ್ವನಿ AI ಸಹಾಯಕ",
    checklist: "ದಿನಚರಿ ಪಿಪಿಇ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ",
    notifications: "ಇತ್ತೀಚಿನ ಎಚ್ಚರಿಕೆಗಳು",
    todayTasks: "ಇಂದಿನ ಸುರಕ್ಷತಾ ಕಾರ್ಯಗಳು",
    progress: "ಪ್ರಗತಿ",
    equipmentStatus: "ಉಪಕರಣಗಳ ಸ್ಥಿತಿ",
    shiftInfo: "ಶಿಫ್ಟ್ ವಿವರಗಳು",
    emergencyContacts: "ತುರ್ತು ಸಂಪರ್ಕಗಳು",
    safetyAnalytics: "ಸುರಕ್ಷತಾ ವಿಶ್ಲೇಷಣೆ",
    recentHazards: "ಇತ್ತೀಚಿನ ಅಪಾಯದ ವರದಿಗಳು",
    achievements: "ಸಾಧನೆಗಳು ಮತ್ತು ಬ್ಯಾಡ್ಜ್‌ಗಳು",
    statusPending: "ಬಾಕಿ ಉಳಿದಿದೆ",
    statusApproved: "ಅನುಮೋದಿಸಲಾಗಿದೆ",
    statusResolved: "ಪರಿಹರಿಸಲಾಗಿದೆ",
    sosTriggered: "SOS ಸಕ್ರಿಯಗೊಂಡಿದೆ",
    nearestExit: "ಹತ್ತಿರದ ನಿರ್ಗಮನ",
    assemblyPoint: "ಸಭೆಯ ಸ್ಥಳ",
    safeRoute: "ಸುರಕ್ಷಿತ ಮಾರ್ಗ",
    askQuestion: "ಸುರಕ್ಷತಾ ಪ್ರಶ್ನೆ ಕೇಳಿ...",
    listening: "ಕೇಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ...",
    speakAnswer: "ಧ್ವನಿ ಉತ್ತರ",
    safeDays: "ಸುರಕ್ಷಿತ ಕೆಲಸದ ದಿನಗಳು",
    streak: "ಸುರಕ್ಷಿತ ದಿನಗಳ ಸರಣಿ",
    monthlyPerformance: "ಮಾಸಿಕ ಸಾಧನೆ",
    battery: "ಬ್ಯಾಟರಿ",
    inspection: "ಪರಿಶೀಲನೆ",
    dueMaintenance: "ಮುಂದಿನ ಸೇವೆ",
    supervisorName: "ಮೇಲ್ವಿಚಾರಕ",
    shiftTime: "ಶಿಫ್ಟ್ ಸಮಯ",
    workDuration: "ಅವಧಿ",
    attendance: "ಹಾಜರಾತಿ",
    breakStatus: "ವಿರಾಮದ ಸ್ಥಿತಿ",
    requestBreak: "ವಿರಾಮಕ್ಕೆ ವಿನಂತಿಸಿ",
    call: "ಕರೆ ಮಾಡಿ",
    message: "ಸಂದೇಶ",
    sos: "SOS",
    nearestSafeExit: "ನಿರ್ಗ್ಮನ ದಾರಿ",
    depth: "ಆಳ",
    tunnel: "ಸುರಂಗ",
    section: "ವಿಭಾಗ",
    mineName: "ಗಣಿಯ ಹೆಸರು",
    reportedHazards: "ವರದಿಯಾದ ಅಪಾಯಗಳು",
    checklistsCompleted: "ಸಮರ್ಪಿಸಿದ ಪಟ್ಟಿಗಳು",
    aiImprovement: "AI ಶಿಫಾರಸುಗಳು",
    uploadImage: "ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    captureImage: "ಫೋಟೋ ಕ್ಲಿಕ್ಕಿಸಿ",
    analyzingImage: "AI ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...",
    hazardReported: "ಅಪಾಯ ವರದಿಯಾಗಿದೆ",
    severity: "ತೀವ್ರತೆ",
    riskLevel: "ಅಪಾಯದ ಮಟ್ಟ",
    precautions: "ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು",
    requiredPpe: "ಅಗತ್ಯವಿರುವ PPE",
    immediateActions: "ತಕ್ಷಣದ ಕ್ರಮಗಳು",
    submitReport: "ವರದಿ ಸಲ್ಲಿಸಿ",
    online: "ಆನ್‌ಲೈನ್",
    offline: "ಆಫ್‌ಲೈನ್",
  },
  ml: {
    title: "AI മൈൻ സേഫ്റ്റി പോർട്ടൽ",
    subtitle: "സുരക്ഷാ & പാരിസ്ഥിതിക വിവരങ്ങൾ",
    welcome: "നമസ്കാരം",
    staySafe: "ഇന്ന് സുരക്ഷിതമായിരിക്കുക.",
    safetyStatus: "സുരക്ഷാ നില",
    riskScore: "അപകട സാധ്യത സ്കോർ",
    fullAnalysis: "പൂർണ്ണ വിവരങ്ങൾ കാണുക",
    activeShift: "നിലവിലെ ഷിഫ്റ്റ്",
    offDuty: "ഡ്യൂട്ടിക്ക് പുറത്ത്",
    hoursWorked: "ജോലി ചെയ്ത സമയം",
    environment: "പരിസ്ഥിതി",
    surface: "ഉപരിതലം",
    mine: "ഗനി",
    temperature: "താപനില",
    humidity: "ഈർപ്പം",
    airQuality: "വായു ഗുണനിലവാരം",
    gasStatus: "വാതക നില",
    visibility: "കാഴ്ചശക്തി",
    supervisorAnnounce: "സൂപ്പർവൈസർ അറിയിപ്പുകൾ",
    quickActions: "ദ്രുത നടപടികൾ",
    aiAssistant: "AI സുരക്ഷാ സഹായി",
    aiHazardScanner: "AI അപകട സ്കാനർ",
    offlineMap: "ഓഫ്‌ലൈൻ ഗനി മാപ്പ്",
    emergencySos: "അടിയന്തിര SOS",
    voiceAssistant: "വോയ്സ് AI സഹായി",
    checklist: "പിപിഇ ചെക്ക്‌ലിസ്റ്റ്",
    notifications: "അടിയന്തിര അറിയിപ്പുകൾ",
    todayTasks: "ഇന്നത്തെ സുരക്ഷാ ദൗത്യങ്ങൾ",
    progress: "പുരോഗതി",
    equipmentStatus: "ഉപകരണങ്ങളുടെ സുരക്ഷാ നില",
    shiftInfo: "ഷിഫ്റ്റ് വിവരങ്ങൾ",
    emergencyContacts: "അടിയന്തിര കോൺടാക്റ്റുകൾ",
    safetyAnalytics: "സുരക്ഷാ വിശകലനം",
    recentHazards: "അപകട റിപ്പോർട്ടുകൾ",
    achievements: "നേട്ടങ്ങളും ബാഡ്ജുകളും",
    statusPending: "തീരുമാനമാകാത്തത്",
    statusApproved: "അംഗീകരിച്ചത്",
    statusResolved: "പരിഹരിക്കപ്പെട്ടത്",
    sosTriggered: "SOS സജീവമായി",
    nearestExit: "അടുത്തുള്ള എക്സിറ്റ്",
    assemblyPoint: "അസംബ്ലി പോയിന്റ്",
    safeRoute: "സുരക്ഷിത പാത",
    askQuestion: "സംശയങ്ങൾ ചോദിക്കുക...",
    listening: "കേൾക്കുന്നു...",
    speakAnswer: "ശബ്ദത്തിലൂടെ മറുപടി",
    safeDays: "അപകടരഹിത ദിവസങ്ങൾ",
    streak: "സുരക്ഷിത ദിനങ്ങളുടെ എണ്ണം",
    monthlyPerformance: "പ്രതിമാസ മികവ്",
    battery: "ബാറ്ററി",
    inspection: "പരിശോധന",
    dueMaintenance: "അടുത്ത സർവീസ്",
    supervisorName: "സൂപ്പർവൈസർ",
    shiftTime: "ഷിഫ്റ്റ് സമയം",
    workDuration: "ജോലി സമയം",
    attendance: "ഹാജർ",
    breakStatus: "വിശ്രമ സമയം",
    requestBreak: "ബ്രേക്ക് ആവശ്യപ്പെടുക",
    call: "വിളിക്കുക",
    message: "സന്ദേശം",
    sos: "SOS",
    nearestSafeExit: "എക്സിറ്റ് വഴി",
    depth: "ആഴം",
    tunnel: "തുരങ്കം",
    section: "വിഭാഗം",
    mineName: "ഗനിയുടെ പേര്",
    reportedHazards: "റിപ്പോർട്ട് ചെയ്ത അപകടങ്ങൾ",
    checklistsCompleted: "സമർപ്പിച്ച ലിസ്റ്റുകൾ",
    aiImprovement: "AI നിർദ്ദേശങ്ങൾ",
    uploadImage: "അപ്‌ലോഡ്",
    captureImage: "ഫോട്ടോ എടുക്കുക",
    analyzingImage: "AI വിശകലനം ചെയ്യുന്നു...",
    hazardReported: "അപകടം റിപ്പോർട്ട് ചെയ്തു",
    severity: "തീവ്രത",
    riskLevel: "അപകട സാധ്യത നില",
    precautions: "മുൻകരുതലുകൾ",
    requiredPpe: "ആവശ്യമായ PPE",
    immediateActions: "ഉടൻ ചെയ്യേണ്ടവ",
    submitReport: "സമർപ്പിക്കുക",
    online: "ഓൺലൈൻ",
    offline: "ഓഫ്‌ലൈൻ",
  },
  mr: {
    title: "AI खाण सुरक्षा पोर्टल",
    subtitle: "सुरक्षा आणि पर्यावरण टेलीमेट्री",
    welcome: "नमस्ते",
    staySafe: "आज सुरक्षित राहा.",
    safetyStatus: "सुरक्षा स्थिती",
    riskScore: "धोका स्कोअर",
    fullAnalysis: "पूर्ण विश्लेषण पहा",
    activeShift: "सक्रिय शिफ्ट",
    offDuty: "ड्युटीबाहेर",
    hoursWorked: "कामाचे तास",
    environment: "पर्यावरण",
    surface: "पृष्ठभाग",
    mine: "खाण",
    temperature: "तापमान",
    humidity: "आर्द्रता",
    airQuality: "हवेची गुणवत्ता",
    gasStatus: "गॅस स्थिती",
    visibility: "दृश्यमानता",
    supervisorAnnounce: "पर्यवेक्षक सूचना",
    quickActions: "त्वरित कृती",
    aiAssistant: "AI सुरक्षा सहाय्यक",
    aiHazardScanner: "AI धोका स्कॅनर",
    offlineMap: "ऑफलाईन खाण नकाशा",
    emergencySos: "आणीबाणी SOS",
    voiceAssistant: "व्हॉइस AI सहाय्यक",
    checklist: "दैनिक पीपीई चेकलिस्ट",
    notifications: "नुकतेच आलेले अलर्ट",
    todayTasks: "आजची सुरक्षा कामे",
    progress: "प्रगती",
    equipmentStatus: "सुरक्षा उपकरणांची स्थिती",
    shiftInfo: "शिफ्ट तपशील",
    emergencyContacts: "आणीबाणीचे संपर्क",
    safetyAnalytics: "वैयक्तिक सुरक्षा विश्लेषण",
    recentHazards: "नुकत्याच नोंदवलेल्या धोक्याच्या तक्रारी",
    achievements: "यश आणि सन्मान चिन्ह",
    statusPending: "प्रलंबित",
    statusApproved: "मंजूर",
    statusResolved: "निकाली काढले",
    sosTriggered: "SOS सक्रिय झाले",
    nearestExit: "जवळचा निकास मार्ग",
    assemblyPoint: "एकत्र येण्याचे ठिकाण",
    safeRoute: "सुरक्षित मार्ग",
    askQuestion: "सुरक्षेविषयी प्रश्न विचारा...",
    listening: "ऐकत आहे...",
    speakAnswer: "उत्तर ऐका",
    safeDays: "सुरक्षित कामाचे दिवस",
    streak: "सुरक्षित दिवसांची मालिका",
    monthlyPerformance: "मासिक कामगिरी",
    battery: "बॅटरी",
    inspection: "तपासणी",
    dueMaintenance: "पुढील सर्व्हिस",
    supervisorName: "पर्यवेक्षक",
    shiftTime: "शिफ्टची वेळ",
    workDuration: "कालावधी",
    attendance: "हजेरी",
    breakStatus: "ब्रेक स्थिती",
    requestBreak: "ब्रेकची मागणी करा",
    call: "कॉल करा",
    message: "मेसेज पाठवा",
    sos: "SOS",
    nearestSafeExit: "निकास मार्ग",
    depth: "खोली",
    tunnel: "बोगदा",
    section: "विभाग",
    mineName: "खाणीचे नाव",
    reportedHazards: "नोंदवलेले धोके",
    checklistsCompleted: "सादर केलेल्या चेकलिस्ट",
    aiImprovement: "AI शिफारसी",
    uploadImage: "अपलोड करा",
    captureImage: "फोटो काढा",
    analyzingImage: "AI विश्लेषण करत आहे...",
    hazardReported: "धोका नोंदवला गेला",
    severity: "तीव्रता",
    riskLevel: "धोका पातळी",
    precautions: "काळजी घ्या",
    requiredPpe: "आवश्यक पीपीई",
    immediateActions: "त्वरित कृती",
    submitReport: "अहवाल सादर करा",
    online: "ऑनलाइन",
    offline: "ऑफलाइन",
  },
  bn: {
    title: "AI খনি সুরক্ষা পোর্টাল",
    subtitle: "উন্নত সুরক্ষা ও টেলিমেট্রি সিস্টেম",
    welcome: "হ্যালো",
    staySafe: "আজ সুরক্ষিত থাকুন।",
    safetyStatus: "সুরক্ষা স্থিতি",
    riskScore: "ঝুঁকি স্কোর",
    fullAnalysis: "সম্পূর্ণ বিশ্লেষণ দেখুন",
    activeShift: "সক্রিয় শিফট",
    offDuty: "ডিউটি অফ",
    hoursWorked: "কাজের সময়",
    environment: "পরিবেশ",
    surface: "উপরিভাগ",
    mine: "খনি",
    temperature: "তাপমাত্রা",
    humidity: "আর্দ্রতা",
    airQuality: "বাতাসের মান",
    gasStatus: "গ্যাস স্থিতি",
    visibility: "দৃষ্টিসীমা",
    supervisorAnnounce: "সুপারভাইজার নোটিশ",
    quickActions: "দ্রুত কর্মসমূহ",
    aiAssistant: "AI সুরক্ষা সহকারী",
    aiHazardScanner: "AI বিপদ স্ক্যানার",
    offlineMap: "অফলাইন খনি মানচিত্র",
    emergencySos: "জরুরী SOS",
    voiceAssistant: "ভয়েস AI সহকারী",
    checklist: "দৈনিক পিপিই চেকলিস্ট",
    notifications: "সাম্প্রতিক অ্যালার্ট",
    todayTasks: "আজকের নিরাপত্তা কাজ",
    progress: "অগ্রগতি",
    equipmentStatus: "নিরাপত্তা সরঞ্জামের অবস্থা",
    shiftInfo: "শিফটের বিবরণ",
    emergencyContacts: "জরুরী যোগাযোগ",
    safetyAnalytics: "ব্যক্তিগত সুরক্ষা বিশ্লেষণ",
    recentHazards: "সাম্প্রতিক বিপদ রিপোর্ট",
    achievements: "কৃতিত্ব ও ব্যাজ",
    statusPending: "অপেক্ষমান",
    statusApproved: "অনুমোদিত",
    statusResolved: "সমাধান হয়েছে",
    sosTriggered: "SOS সক্রিয়",
    nearestExit: "নিকটতম বাহির পথ",
    assemblyPoint: "সমাবেশস্থল",
    safeRoute: "নিরাপদ পথ",
    askQuestion: "সুরক্ষা প্রশ্ন জিজ্ঞাসা করুন...",
    listening: "শুনছি...",
    speakAnswer: "উত্তর শুনুন",
    safeDays: "নিরাপদ কাজের দিন",
    streak: "নিরাপদ দিনের সংখ্যা",
    monthlyPerformance: "মাসিক পারফরম্যান্স",
    battery: "ব্যাটারি",
    inspection: "পরিদর্শন",
    dueMaintenance: "পরবর্তী সার্ভিস",
    supervisorName: "সুপারভাইজার",
    shiftTime: "শিফটের সময়",
    workDuration: "সময়কাল",
    attendance: "উপস্থিতি",
    breakStatus: "বিরতির অবস্থা",
    requestBreak: "বিরতি অনুরোধ করুন",
    call: "কল করুন",
    message: "বার্তা পাঠান",
    sos: "SOS",
    nearestSafeExit: "বাহির পথ",
    depth: "গভীরতা",
    tunnel: "সুড়ঙ্গ",
    section: "বিভাগ",
    mineName: "খনির নাম",
    reportedHazards: "বিপদ রিপোর্ট সংখ্যা",
    checklistsCompleted: "জমা দেওয়া চেকলিস্ট",
    aiImprovement: "AI পরামর্শসমূহ",
    uploadImage: "আপলোড করুন",
    captureImage: "ছবি তুলুন",
    analyzingImage: "AI বিশ্লেষণ করছে...",
    hazardReported: "বিপদ নথিভুক্ত হয়েছে",
    severity: "তীব্রতা",
    riskLevel: "ঝুঁকির মাত্রা",
    precautions: "সতর্কতা",
    requiredPpe: "প্রয়োজনীয় পিপিই",
    immediateActions: "তাত্ক্ষণিক পদক্ষেপ",
    submitReport: "রিপোর্ট জমা দিন",
    online: "অনলাইন",
    offline: "অফলাইন",
  },
  gu: {
    title: "AI ખાણ સુરક્ષા પોર્ટલ",
    subtitle: "સલામતી અને પર્યાવરણીય ડેટા",
    welcome: "નમસ્તે",
    staySafe: "આજે સુરક્ષિત રહો.",
    safetyStatus: "સુરક્ષા સ્થિતિ",
    riskScore: "જોખમ સ્કોર",
    fullAnalysis: "વિશ્લેષણ જુઓ",
    activeShift: "સક્રિય શિફ્ટ",
    offDuty: "ડ્યુટીની બહાર",
    hoursWorked: "કામના કલાકો",
    environment: "પર્યાવરણ",
    surface: "સપાટી",
    mine: "ખાણ",
    temperature: "તાપમાન",
    humidity: "ભેજ",
    airQuality: "હવાની ગુણવત્તા",
    gasStatus: "ગેસ સ્થિતિ",
    visibility: "દ્રશ્યતા",
    supervisorAnnounce: "સુપરવાઇઝર નોટિસ",
    quickActions: "ઝડપી ક્રિયાઓ",
    aiAssistant: "AI સુરક્ષા સહાયક",
    aiHazardScanner: "AI જોખમ સ્કેનર",
    offlineMap: "ઑફલાઇન નકશો",
    emergencySos: "ઇમરજન્સી SOS",
    voiceAssistant: "વોઇસ AI સહાયક",
    checklist: "પીપીઈ ચેકલિસ્ટ",
    notifications: "તાજેતરના એલર્ટ",
    todayTasks: "આજના સુરક્ષા કાર્યો",
    progress: "પ્રગતિ",
    equipmentStatus: "સુરક્ષા સાધનોની સ્થિતિ",
    shiftInfo: "શિફ્ટ વિગતો",
    emergencyContacts: "ઇમરજન્સી સંપર્કો",
    safetyAnalytics: "સુરક્ષા વિશ્લેષણ",
    recentHazards: "તાજેતરના જોખમી અહેવાલો",
    achievements: "સિદ્ધિઓ અને બેજ",
    statusPending: "બાકી",
    statusApproved: "મંજૂર",
    statusResolved: "ઉકેલાયેલ",
    sosTriggered: "SOS સક્રિય",
    nearestExit: "નજીકનું નિકાસ",
    assemblyPoint: "એસેમ્બલી પોઇન્ટ",
    safeRoute: "સુરક્ષિત માર્ગ",
    askQuestion: "પ્રશ્ન પૂછો...",
    listening: "સાંભળી રહ્યા છીએ...",
    speakAnswer: "જવાબ સાંભળો",
    safeDays: "સુરક્ષિત દિવસો",
    streak: "સુરક્ષિત દિવસોનો સિલસિલો",
    monthlyPerformance: "માસિક પ્રદર્શન",
    battery: "બેટરી",
    inspection: "તપાસ",
    dueMaintenance: "આગામી સર્વિસ",
    supervisorName: "સુપરવાઇઝર",
    shiftTime: "શિફ્ટ સમય",
    workDuration: "સમયગાળો",
    attendance: "હાજરી",
    breakStatus: "વિરામ સ્થિતિ",
    requestBreak: "વિરામ વિનંતી",
    call: "કોલ",
    message: "મેસેજ",
    sos: "SOS",
    nearestSafeExit: "નિકાસ માર્ગ",
    depth: "ઊંડાઈ",
    tunnel: "ટનલ",
    section: "સેક્શન",
    mineName: "ખાણનું નામ",
    reportedHazards: "રિપોર્ટ કરેલા જોખમો",
    checklistsCompleted: "સબમિટ કરેલી ચેકલિસ્ટ",
    aiImprovement: "AI ભલામણો",
    uploadImage: "અપલોડ",
    captureImage: "ફોટો લો",
    analyzingImage: "AI વિશ્લેષણ કરે છે...",
    hazardReported: "જોખમ નોંધાયું છે",
    severity: "તીવ્રતા",
    riskLevel: "જોખમ સ્તર",
    precautions: "સાવચેતીઓ",
    requiredPpe: "જરૂરી PPE",
    immediateActions: "તાત્કાલિક પગલાં",
    submitReport: "અહેવાલ સબમિટ કરો",
    online: "ઓનલાઇન",
    offline: "ઓફલાઇન",
  },
  pa: {
    title: "AI ਖਾਣ ਸੁਰੱਖਿਆ ਪੋਰਟਲ",
    subtitle: "ਸੁਰੱਖਿਆ ਅਤੇ ਵਾਤਾਵਰਣ ਟੈਲੀਮੈਟਰੀ",
    welcome: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ",
    staySafe: "ਅੱਜ ਸੁਰੱਖਿਅਤ ਰਹੋ।",
    safetyStatus: "ਸੁਰੱਖਿਆ ਸਥਿਤੀ",
    riskScore: "ਖਤਰਾ ਸਕੋਰ",
    fullAnalysis: "ਪੂਰਾ ਵਿਸ਼ਲੇਸ਼ਣ ਦੇਖੋ",
    activeShift: "ਸਰਗਰਮ ਸ਼ਿਫਟ",
    offDuty: "ਡਿਊਟੀ ਬੰਦ",
    hoursWorked: "ਕੰਮ ਦੇ ਘੰਟੇ",
    environment: "ਵਾਤਾਵਰਣ",
    surface: "ਸਤਹ",
    mine: "ਖਾਣ",
    temperature: "ਤਾਪਮਾਨ",
    humidity: "ਨਮੀ",
    airQuality: "ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ",
    gasStatus: "ਗੈਸ ਸਥਿਤੀ",
    visibility: "ਦ੍ਰਿਸ਼ਟੀ",
    supervisorAnnounce: "ਸੁਪਰਵਾਈਜ਼ਰ ਨੋਟਿਸ",
    quickActions: "ਤੁਰੰਤ ਕਾਰਵਾਈਆਂ",
    aiAssistant: "AI ਸੁਰੱਖਿਆ ਸਹਾਇਕ",
    aiHazardScanner: "AI ਖਤਰਾ ਸਕੈਨਰ",
    offlineMap: "ਔਫਲਾਈਨ ਖਾਣ ਨਕਸ਼ਾ",
    emergencySos: "ਐਮਰਜੈਂਸੀ SOS",
    voiceAssistant: "ਵੌਇਸ AI ਸਹਾਇਕ",
    checklist: "ਰੋਜ਼ਾਨਾ ਪੀਪੀਈ ਚੈੱਕਲਿਸਟ",
    notifications: "ਤਾਜ਼ਾ ਅਲਰਟ",
    todayTasks: "ਅੱਜ ਦੇ ਸੁਰੱਖਿਆ ਕੰਮ",
    progress: "ਤਰੱਕੀ",
    equipmentStatus: "ਸੁਰੱਖਿਆ ਉਪਕਰਣਾਂ ਦੀ ਸਥਿਤੀ",
    shiftInfo: "ਸ਼ਿਫਟ ਵੇਰਵੇ",
    emergencyContacts: "ਐਮਰਜੈਂਸੀ ਸੰਪਰਕ",
    safetyAnalytics: "ਸੁਰੱਖਿਆ ਵਿਸ਼ਲੇਸ਼ਣ",
    recentHazards: "ਤਾਜ਼ਾ ਖਤਰੇ ਦੀਆਂ ਰਿਪੋਰਟਾਂ",
    achievements: "ਪ੍ਰਾਪਤੀਆਂ ਅਤੇ ਬੈਜ",
    statusPending: "ਲੰਬਿਤ",
    statusApproved: "ਮਨਜ਼ੂਰ",
    statusResolved: "ਹੱਲ ਕੀਤਾ ਗਿਆ",
    sosTriggered: "SOS ਸਰਗਰਮ",
    nearestExit: "ਨਜ਼ਦੀਕੀ ਨਿਕਾਸ",
    assemblyPoint: "ਇਕੱਠੇ ਹੋਣ ਦਾ ਸਥਾਨ",
    safeRoute: "ਸੁਰੱਖਿਅਤ ਰਸਤਾ",
    askQuestion: "ਸੁਰੱਖਿਆ ਸਵਾਲ ਪੁੱਛੋ...",
    listening: "ਸੁਣ ਰਿਹਾ ਹੈ...",
    speakAnswer: "ਉੱਤਰ ਸੁਣੋ",
    safeDays: "ਸੁਰੱਖਿਅਤ ਕਾਰਜ ਦਿਨ",
    streak: "ਸੁਰੱਖਿਅਤ ਦਿਨਾਂ ਦਾ ਸਿਲਸਿਲਾ",
    monthlyPerformance: "ਮਾਸਿਕ ਕਾਰਗੁਜ਼ਾਰੀ",
    battery: "ਬੈਟਰੀ",
    inspection: "ਨਿਰੀਖਣ",
    dueMaintenance: "ਅਗਲੀ ਸਰਵਿਸ",
    supervisorName: "ਸੁਪਰਵਾਈਜ਼ਰ",
    shiftTime: "ਸ਼ਿਫਟ ਦਾ ਸਮਾਂ",
    workDuration: "ਮਿਆਦ",
    attendance: "ਹਾਜ਼ਰੀ",
    breakStatus: "ਬਰੇਕ ਸਥਿਤੀ",
    requestBreak: "ਬਰੇਕ ਦੀ ਬੇਨਤੀ ਕਰੋ",
    call: "ਕਾਲ ਕਰੋ",
    message: "ਸੁਨੇਹਾ ਭੇਜੋ",
    sos: "SOS",
    nearestSafeExit: "ਨਿਕਾਸ ਰਸਤਾ",
    depth: "ਗਹਿਰਾਈ",
    tunnel: "ਸੁਰੰਗ",
    section: "ਸੈਕਸ਼ਨ",
    mineName: "ਖਾਣ ਦਾ ਨਾਮ",
    reportedHazards: "ਰਿਪੋਰਟ ਕੀਤੇ ਖਤਰੇ",
    checklistsCompleted: "ਜਮ੍ਹਾਂ ਕੀਤੀਆਂ ਚੈੱਕਲਿਸਟਾਂ",
    aiImprovement: "AI ਸਿਫ਼ਾਰਸ਼ਾਂ",
    uploadImage: "ਅਪਲੋਡ ਕਰੋ",
    captureImage: "ਫੋਟੋ ਖਿੱਚੋ",
    analyzingImage: "AI ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਿਹਾ ਹੈ...",
    hazardReported: "ਖਤਰੇ ਦੀ ਰਿਪੋਰਟ ਦਰਜ ਹੋਈ",
    severity: "ਤੀਬਰਤਾ",
    riskLevel: "ਖਤਰੇ ਦਾ ਪੱਧਰ",
    precautions: "ਸਾਵਧਾਨੀਆਂ",
    requiredPpe: "ਲੋੜੀਂਦਾ ਪੀਪੀਈ",
    immediateActions: "ਤੁਰੰਤ ਕਾਰਵਾਈ",
    submitReport: "ਰਿਪੋਰਟ ਜਮ੍ਹਾਂ ਕਰੋ",
    online: "ਔਨਲਾਈਨ",
    offline: "ਔਫਲਾਈਨ",
  },
  or: {
    title: "AI ଖଣି ସୁରକ୍ଷା ପୋର୍ଟାଲ",
    subtitle: "ଉନ୍ନତ ସୁରକ୍ଷା ଏବଂ ପରିବେଶ ଟେଲିମେଟ୍ରି",
    welcome: "ନମସ୍କାର",
    staySafe: "ଆଜି ସୁରକ୍ଷିତ ରୁହନ୍ତୁ ।",
    safetyStatus: "ସୁରକ୍ଷା ସ୍ଥିତି",
    riskScore: "ବିପଦ ସ୍କୋର",
    fullAnalysis: "ସମ୍ପୂର୍ଣ୍ଣ ବିଶ୍ଳେଷଣ ଦେଖନ୍ତୁ",
    activeShift: "ସକ୍ରିୟ ଶିଫ୍ଟ",
    offDuty: "ଡ୍ୟୁଟି ବନ୍ଦ",
    hoursWorked: "କାର୍ଯ୍ୟ ସମୟ",
    environment: "ପରିବେଶ",
    surface: "ଉପରିଭାଗ",
    mine: "ଖଣି",
    temperature: "ତାପମାତ୍ରା",
    humidity: "ଆର୍ଦ୍ରତା",
    airQuality: "ବାୟୁ ଗୁଣବତ୍ତା",
    gasStatus: "ଗ୍ୟାସ ସ୍ଥିତି",
    visibility: "ଦୃଶ୍ୟମାନତା",
    supervisorAnnounce: "ସୁପରଭାଇଜର ବିଜ୍ଞପ୍ତି",
    quickActions: "ଦ୍ରୁତ କାର୍ଯ୍ୟକଳାପ",
    aiAssistant: "AI ସୁରକ୍ଷା ସହାୟକ",
    aiHazardScanner: "AI ବିପଦ ସ୍କାନର୍",
    offlineMap: "ଅଫଲାଇନ ମାନଚିତ୍ର",
    emergencySos: "ଜରୁରୀକାଳୀନ SOS",
    voiceAssistant: "ଭଏସ AI ସହାୟକ",
    checklist: "ଦୈନିକ ପିପିଇ ଚେକଲିଷ୍ଟ",
    notifications: "ସାମ୍ପ୍ରତିକ ସୂଚନା",
    todayTasks: "ଆଜିର ସୁରକ୍ଷା କାର୍ଯ୍ୟ",
    progress: "ପ୍ରଗତି",
    equipmentStatus: "ଉପକରଣର ସୁରକ୍ଷା ସ୍ଥିତି",
    shiftInfo: "ଶିଫ୍ଟ ବିବରଣୀ",
    emergencyContacts: "ଜରୁରୀକାଳୀନ ସମ୍ପର୍କ",
    safetyAnalytics: "ସୁରକ୍ଷା ବିଶ୍ଳେଷଣ",
    recentHazards: "ସାମ୍ପ୍ରତିକ ବିପଦ ରିପୋର୍ଟ",
    achievements: "ସଫଳତା ଏବं ବ୍ୟାଜ୍",
    statusPending: "ବାକି ଅଛି",
    statusApproved: "ଅନୁମୋଦିତ",
    statusResolved: "ସମାଧାନ ହୋଇଛି",
    sosTriggered: "SOS ସକ୍ରିୟ",
    nearestExit: "ନିକଟତମ ପ୍ରସ୍ଥାନ",
    assemblyPoint: "ସଭା ସ୍ଥଳ",
    safeRoute: "ସୁରକ୍ଷିત ପଥ",
    askQuestion: "ସୁରକ୍ଷା ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ...",
    listening: "ଶୁଣୁଛି...",
    speakAnswer: "ଉତ୍ତର ଶୁଣନ୍ତୁ",
    safeDays: "ସୁରକ୍ଷିତ କାର୍ଯ୍ୟ ଦିବସ",
    streak: "ସୁରକ୍ଷିତ ଦିନର କ୍ରମ",
    monthlyPerformance: "ମାସିକ ପ୍ରଦର୍ଶନ",
    battery: "ବ୍ୟାଟେରୀ",
    inspection: "ନିରୀକ୍ଷଣ",
    dueMaintenance: "ପରବର୍ତ୍ତୀ ସେବା",
    supervisorName: "ସୁପରଭାଇଜର",
    shiftTime: "ଶିଫ୍ଟ ସମୟ",
    workDuration: "ଅବଧି",
    attendance: "ଉପସ୍ଥାନ",
    breakStatus: "ବିଶ୍ରାମ ସ୍ଥିତି",
    requestBreak: "ବିଶ୍ରାମ ପାଇଁ ଅନୁରୋಧ",
    call: "କଲ କରନ୍ତୁ",
    message: "ବାର୍ତ୍ତା ପଠାନ୍ତୁ",
    sos: "SOS",
    nearestSafeExit: "ପ୍ରସ୍ଥାନ ପଥ",
    depth: "ଗଭୀରତା",
    tunnel: "ସୁଡ଼ଙ୍ଗ",
    section: "ସେକ୍ସନ",
    mineName: "ଖଣିର ନାମ",
    reportedHazards: "ରିପୋର୍ଟ ହୋଇଥିବା ବିପଦ",
    checklistsCompleted: "ଦାଖଲ ହୋଇଥିବା ଚେକଲିଷ୍ଟ",
    aiImprovement: "AI ସୁପାରିଶ",
    uploadImage: "ଅପଲୋડ",
    captureImage: "ଫଟୋ ଉଠାନ୍ତୁ",
    analyzingImage: "AI ବିଶ୍ଳେଷଣ କରୁଛି...",
    hazardReported: "ବିପଦ ରିପୋର୍ଟ ହୋଇଛି",
    severity: "ତୀବ୍ରତା",
    riskLevel: "ବିପଦ ସ୍ତର",
    precautions: "ସତର୍କତା",
    requiredPpe: "ଆବଶ୍ୟକ ପିପିଇ",
    immediateActions: "ତୁରନ୍ତ କାର୍ଯ୍ୟାନୁଷ୍ଠାନ",
    submitReport: "ରିପୋର୍ଟ ଦାଖଲ କରନ୍ତୁ",
    online: "ଅନଲାଇନ",
    offline: "ଅଫଲାଇନ",
  }
};

export const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { location, isSimulated } = useGeo();

  // Selected Language State
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('dashboard_lang') || i18n.language || 'en';
  });

  // Data States
  const [userProfile, setUserProfile] = useState(null);
  const [riskData, setRiskData] = useState({ risk_score: 0, risk_level: 'low', factors: [] });
  const [safetyHistory, setSafetyHistory] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [activeShift, setActiveShift] = useState(null);
  const [checklist, setChecklist] = useState({
    helmet_worn: false,
    safety_boots_worn: false,
    gas_detector_checked: false,
    emergency_light_working: false,
    communication_device_working: false,
  });
  const [alerts, setAlerts] = useState([]);
  const [assignedEquipment, setAssignedEquipment] = useState([
    { id: 1, name: "Smart Helmet & Headlamp", battery: 92, status: "Good", service: "12 Aug 2026" },
    { id: 2, name: "Portable Multigas Detector", battery: 85, status: "Calibrated", service: "29 Jul 2026" },
    { id: 3, name: "Self-Contained Self-Rescuer (SCSR)", battery: null, status: "Inspected", service: "10 Oct 2026" },
  ]);
  const [recentReports, setRecentReports] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Connection State
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Modals / Overlays Open States
  const [scannerOpen, setScannerOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  
  // Interactive Feature States
  const [scanFile, setScanFile] = useState(null);
  const [scanPreview, setScanPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [chatQuery, setChatQuery] = useState("");
  const [chatLogs, setChatLogs] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [isSpeakingAnswer, setIsSpeakingAnswer] = useState(false);
  const [breakActive, setBreakActive] = useState(false);

  // References for file upload & speech synthesis
  const fileInputRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);

  // Handle network online/offline state change
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync i18n instance when local lang state changes
  const changeLanguage = (newLang) => {
    setLang(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('dashboard_lang', newLang);
  };

  // Helper function to get UI string in selected language
  const t = (key) => {
    return tUI[lang]?.[key] || tUI['en']?.[key] || key;
  };

  // ------------------ DATA FETCHING ------------------
  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Profile
      const profileRes = await apiClient.get('/users/me');
      setUserProfile(profileRes.data);
      if (profileRes.data?.profile?.safety_score !== undefined) {
        setRiskData(prev => ({
          ...prev,
          risk_score: 100 - parseFloat(profileRes.data.profile.safety_score)
        }));
      }

      // 2. Fetch Active Shift
      const shiftRes = await apiClient.get('/shifts/active');
      setActiveShift(shiftRes.data);

      // 3. Fetch Active Checklist
      if (shiftRes.data) {
        const checklistRes = await apiClient.get('/safety/checklist/active');
        if (checklistRes.data) {
          setChecklist({
            helmet_worn: checklistRes.data.helmet_worn || false,
            safety_boots_worn: checklistRes.data.safety_boots_worn || false,
            gas_detector_checked: checklistRes.data.gas_detector_checked || false,
            emergency_light_working: checklistRes.data.emergency_light_working || false,
            communication_device_working: checklistRes.data.communication_device_working || false,
          });
        }
      }

      // 4. Fetch Risk Meter Data & Factors
      const riskRes = await apiClient.get('/safety/risk-level');
      if (riskRes.data) {
        setRiskData(riskRes.data);
      }

      // 5. Fetch Safety Score History (from analytics)
      const analyticsHistoryRes = await apiClient.get('/analytics/safety-score/history?days=7');
      if (analyticsHistoryRes.data) {
        const formatted = analyticsHistoryRes.data.map(item => ({
          name: item.name.split('-').slice(1).join('/'), // simplify date
          Score: item.value
        }));
        setSafetyHistory(formatted);
      } else {
        // Fallback safety score trend data
        setSafetyHistory([
          { name: 'Mon', Score: 95 },
          { name: 'Tue', Score: 98 },
          { name: 'Wed', Score: 94 },
          { name: 'Thu', Score: 96 },
          { name: 'Fri', Score: 92 },
          { name: 'Sat', Score: 95 },
          { name: 'Sun', Score: 98 }
        ]);
      }

      // 6. Fetch Telemetry Data (Mine Environment)
      const telemetryRes = await apiClient.get('/ml/realtime-telemetry');
      if (telemetryRes.data) {
        setTelemetry(telemetryRes.data);
      }

      // 7. Fetch Safety Recommendations in Selected Language
      const recRes = await apiClient.get(`/safety/recommendations?lang=${lang}`);
      if (recRes.data) {
        setRecommendations(recRes.data);
      }

      // 8. Fetch Notifications
      const notifRes = await apiClient.get('/notifications/');
      if (notifRes.data) {
        setAlerts(notifRes.data.slice(0, 5));
      }

      // 9. Fetch Recent Hazard Reports
      const hazardRes = await apiClient.get('/hazards/');
      if (hazardRes.data) {
        setRecentReports(hazardRes.data.slice(0, 4));
      }

    } catch (err) {
      console.error("Dashboard fetching failure:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(fetchDashboardData, 12000);
    return () => clearInterval(timer);
  }, [lang]);

  // Handle checklist item check/uncheck dynamically
  const handleChecklistToggle = async (key) => {
    const nextChecklist = { ...checklist, [key]: !checklist[key] };
    setChecklist(nextChecklist);
    try {
      await apiClient.post('/safety/checklist', nextChecklist);
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to sync precaution checklist state:", err);
    }
  };

  // Emergency SOS trigger
  const handleEmergencySOS = async () => {
    setSosActive(true);
    try {
      const lat = location?.latitude || 23.8103;
      const lon = location?.longitude || 86.4126;
      await apiClient.post('/sos/trigger', {
        latitude: lat,
        longitude: lon,
        alert_type: "SOS_TRIGGERED"
      });
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to trigger SOS alert:", err);
    }
  };

  const handleCancelSOS = async () => {
    setSosActive(false);
    try {
      await apiClient.post('/sos/resolve-latest');
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to resolve SOS:", err);
    }
  };

  // Simulated location mapping details
  const getSimulatedLocationDetails = () => {
    if (!location) {
      return {
        mine: "Dhanbad Deep Mine A",
        tunnel: "Shaft 3-B",
        section: "Coal Face Alpha",
        depth: "380 meters",
        exit: "Refuge Chamber 2 (65m)"
      };
    }
    const latOffset = Math.abs(location.latitude - 23.8103) * 10000;
    const lonOffset = Math.abs(location.longitude - 86.4126) * 10000;
    
    const tunnelNum = Math.floor(latOffset % 12) + 1;
    const sectionIndex = Math.floor(lonOffset % 4);
    const sections = ["North Blasting Face", "South Drift Gate", "East Pillar Support", "West Conveyor Loader"];
    const calculatedDepth = Math.floor(350 + (latOffset * 15) % 250);
    const exitDist = Math.floor(40 + (lonOffset * 8) % 110);
    
    return {
      mine: "Dhanbad Deep Mine A",
      tunnel: `Tunnel ${tunnelNum}-D`,
      section: sections[sectionIndex],
      depth: `${calculatedDepth} meters`,
      exit: `Shaft Exit ${tunnelNum} (${exitDist}m)`
    };
  };

  const mineInfo = getSimulatedLocationDetails();

  // ------------------ IMAGE HAZARD SCANNING ------------------
  const handleScanFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScanFile(file);
      setScanPreview(URL.createObjectURL(file));
      setScanResult(null);
    }
  };

  const triggerScanner = () => {
    if (!scanFile) return;
    setIsScanning(true);
    
    // Animate scanning lines and call backend Vision endpoint
    setTimeout(async () => {
      try {
        const formData = new FormData();
        formData.append("file", scanFile);
        formData.append("location", `${location?.latitude || 23.8103}, ${location?.longitude || 86.4126}`);
        formData.append("language", lang);

        const response = await apiClient.post('/ai/hazard-detect', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (response.data) {
          setScanResult(response.data.ai_analysis);
          fetchDashboardData();
        }
      } catch (err) {
        console.error("AI Hazard scanning processing failed:", err);
      } finally {
        setIsScanning(false);
      }
    }, 2800);
  };

  // ------------------ TEXT CHATBOT ASSISTANT ------------------
  const submitChatQuestion = async () => {
    if (!chatQuery.trim()) return;
    const newMsg = { sender: 'worker', text: chatQuery };
    setChatLogs(prev => [...prev, newMsg]);
    setChatQuery("");
    setChatLoading(true);

    try {
      const response = await apiClient.post('/ai/ask', {
        question: chatQuery,
        language: lang
      });
      if (response.data) {
        setChatLogs(prev => [...prev, { sender: 'ai', text: response.data.answer }]);
        // Speak back if in voice assistant mode
        if (voiceOpen) {
          speakAnswerBack(response.data.answer);
        }
      }
    } catch (err) {
      console.error("Failed to query safety bot:", err);
      setChatLogs(prev => [...prev, { sender: 'ai', text: "Service connection error. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ------------------ SPEECH AND VOICE ASSISTANT ------------------
  useEffect(() => {
    // Initialize Web Speech API components if supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      // Select appropriate speech recognizer language code
      const speechLangMap = {
        en: 'en-US', ta: 'ta-IN', hi: 'hi-IN', te: 'te-IN', kn: 'kn-IN',
        ml: 'ml-IN', mr: 'mr-IN', bn: 'bn-IN', gu: 'gu-IN', pa: 'pa-IN', or: 'or-IN'
      };
      rec.lang = speechLangMap[lang] || 'en-US';

      rec.onstart = () => {
        setIsVoiceListening(true);
        setVoiceTranscript("");
      };

      rec.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setVoiceTranscript(text);
        // Dispatch to AI
        triggerVoiceChatQuery(text);
      };

      rec.onerror = (e) => {
        console.error("Speech recognition error:", e);
        setIsVoiceListening(false);
      };

      rec.onend = () => {
        setIsVoiceListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [lang]);

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition not supported in this browser. Please use Chrome.");
      return;
    }
    if (isVoiceListening) {
      recognitionRef.current.stop();
    } else {
      synthRef.current.cancel();
      setIsSpeakingAnswer(false);
      recognitionRef.current.start();
    }
  };

  const triggerVoiceChatQuery = async (queryText) => {
    setChatLogs(prev => [...prev, { sender: 'worker', text: queryText }]);
    setChatLoading(true);
    try {
      const response = await apiClient.post('/ai/ask', {
        question: queryText,
        language: lang
      });
      if (response.data) {
        setChatLogs(prev => [...prev, { sender: 'ai', text: response.data.answer }]);
        speakAnswerBack(response.data.answer);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const speakAnswerBack = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    
    // Strip markdown formatting characters for clean speech
    const cleanText = text.replace(/[*#_`~-]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Speech synthesiser language mapping
    const voiceLangMap = {
      en: 'en-US', ta: 'ta-IN', hi: 'hi-IN', te: 'te-IN', kn: 'kn-IN',
      ml: 'ml-IN', mr: 'mr-IN', bn: 'bn-IN', gu: 'gu-IN', pa: 'pa-IN', or: 'or-IN'
    };
    utterance.lang = voiceLangMap[lang] || 'en-US';

    utterance.onstart = () => setIsSpeakingAnswer(true);
    utterance.onend = () => setIsSpeakingAnswer(false);
    utterance.onerror = () => setIsSpeakingAnswer(false);
    
    synthRef.current.speak(utterance);
  };

  // Helper color map for risk level
  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return '#00ff88';
      case 'medium': return '#ffaa00';
      case 'high': return '#ff3355';
      case 'critical': return '#b71c1c';
      default: return '#00ff88';
    }
  };

  const currentScore = riskData?.risk_score || 0;
  const currentRiskLevel = riskData?.risk_level || 'low';
  const riskColor = getRiskColor(currentRiskLevel);

  // SVG parameters for the circular progress chart
  const arcRadius = 70;
  const arcCircumference = 2 * Math.PI * arcRadius;
  const scoreOffset = arcCircumference - (currentScore / 100) * arcCircumference;

  return (
    <Box sx={{ py: 2 }}>
      {/* HEADER SECTION WITH USER GREETING & CONTROLS */}
      <Paper
        className="glass-card"
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: riskColor,
              color: '#fff',
              fontSize: '1.25rem',
              fontWeight: 700,
              boxShadow: `0 0 16px ${riskColor}44`
            }}
          >
            {userProfile?.profile?.full_name ? userProfile.profile.full_name.split(' ').map(n=>n[0]).join('').toUpperCase() : "JD"}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5, color: 'text.primary' }}>
              {t('welcome')}, {userProfile?.profile?.full_name || 'Worker'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('staySafe')}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* Network Connection Chip */}
          <Chip
            icon={isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            label={isOnline ? t('online') : t('offline')}
            color={isOnline ? "success" : "warning"}
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />

          {/* Multilingual Selector */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="lang-label" sx={{ color: 'text.secondary' }}>🌐 {t('language')}</InputLabel>
            <Select
              labelId="lang-label"
              value={lang}
              label={`🌐 ${t('language')}`}
              onChange={(e) => changeLanguage(e.target.value)}
              sx={{
                borderRadius: 2,
                '& .MuiSelect-select': { py: '8.5px' },
                fieldset: { borderColor: 'rgba(255,255,255,0.08)' }
              }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="hi">हिन्दी (Hindi)</MenuItem>
              <MenuItem value="ta">தமிழ் (Tamil)</MenuItem>
              <MenuItem value="te">తెలుగు (Telugu)</MenuItem>
              <MenuItem value="kn">ಕನ್ನಡ (Kannada)</MenuItem>
              <MenuItem value="ml">മലയാളം (Malayalam)</MenuItem>
              <MenuItem value="mr">मराठी (Marathi)</MenuItem>
              <MenuItem value="bn">বাংলা (Bengali)</MenuItem>
              <MenuItem value="gu">ગુજરાતી (Gujarati)</MenuItem>
              <MenuItem value="pa">ਪੰਜਾਬੀ (Punjabi)</MenuItem>
              <MenuItem value="or">ଓଡ଼ିଆ (Odia)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* EMERGENCY ACTIVATION PANEL */}
      {sosActive && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 4,
              border: '2px solid #ff3355',
              bgcolor: 'rgba(255, 51, 85, 0.1)',
              boxShadow: '0 0 20px rgba(255, 51, 85, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              animation: 'glow-border 2s infinite'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AlertCircle size={40} color="#ff3355" className="status-dot-danger" />
              <Box>
                <Typography variant="h6" color="#ff3355" sx={{ fontWeight: 800 }}>
                  🚨 {t('sosTriggered').toUpperCase()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Emergency alert dispatched to Control Room. Location: {mineInfo.tunnel}, {mineInfo.section} ({mineInfo.depth})
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              color="error"
              onClick={handleCancelSOS}
              sx={{ fontWeight: 'bold', px: 3, borderRadius: 2 }}
            >
              Cancel Alert
            </Button>
          </Paper>
        </motion.div>
      )}

      {/* DASHBOARD GRID SYSTEM */}
      <Grid container spacing={3}>
        
        {/* CARD 1: CIRCULAR AI RISK SCORE & SAFETY SCORE CHART */}
        <Grid item xs={12} md={6} lg={4}>
          <Card className="glass-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, alignSelf: 'flex-start' }}>
                🛡️ {t('safetyStatus')}
              </Typography>
              
              <Box sx={{ position: 'relative', width: 170, height: 170, mb: 2 }}>
                <svg width="170" height="170" viewBox="0 0 170 170" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="85" cy="85" r={arcRadius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                  <circle
                    cx="85"
                    cy="85"
                    r={arcRadius}
                    fill="none"
                    stroke={riskColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={arcCircumference}
                    strokeDashoffset={scoreOffset}
                    style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${riskColor}55)` }}
                  />
                </svg>
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: riskColor, textShadow: `0 0 10px ${riskColor}33` }}>
                    {100 - currentScore}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('safety_score').toUpperCase()}
                  </Typography>
                </Box>
              </Box>

              <Chip
                label={`${t('riskScore')}: ${currentScore} / 100`}
                sx={{
                  bgcolor: `${riskColor}15`,
                  color: riskColor,
                  borderColor: `${riskColor}33`,
                  border: '1px solid',
                  fontWeight: 800,
                  mb: 3
                }}
              />

              {/* Safety Score History area chart */}
              <Box sx={{ width: '100%', height: 100, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={safetyHistory}>
                    <defs>
                      <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={riskColor} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={riskColor} stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} />
                    <YAxis domain={[70, 100]} hide />
                    <RechartsTooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }} labelStyle={{ color: '#fff' }} />
                    <Area type="monotone" dataKey="Score" stroke={riskColor} strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                7-Day Daily Safety Trend (Avg: 96%)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 2: CURRENT SHIFT INFORMATION */}
        <Grid item xs={12} md={6} lg={4}>
          <Card className="glass-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  ⏰ {t('shiftInfo')}
                </Typography>
                <Chip
                  label={activeShift ? t('activeShift') : t('offDuty')}
                  color={activeShift ? "success" : "default"}
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">{t('supervisorName')}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Vikram Singh (ID: 405)</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">{t('shiftTime')}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>08:00 AM - 04:00 PM</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">{t('attendance')}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{activeShift?.attendance_status ? activeShift.attendance_status.toUpperCase() : "CHECKED OUT"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">{t('breakStatus')}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{breakActive ? "On Break (12m)" : "Working"}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.06)' }} />

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">{t('workDuration')}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {activeShift?.total_hours ? `${activeShift.total_hours} hrs` : activeShift ? "5.4 / 8.0 hrs" : "0 hrs"}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={activeShift ? 68 : 0}
                  sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' } }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                  onClick={() => navigate('/worker/shift')}
                >
                  Manage Shift
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  color={breakActive ? "warning" : "inherit"}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)' }}
                  onClick={() => setBreakActive(!breakActive)}
                  disabled={!activeShift}
                >
                  {breakActive ? "End Break" : t('requestBreak')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 3: MEANINGFUL LOCALIZED MINE INFORMATION */}
        <Grid item xs={12} md={12} lg={4}>
          <Card className="glass-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5 }}>
                📍 Localized Position Info
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)', color: 'var(--neon-cyan)', width: 40, height: 40 }}>
                    <Compass size={20} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">{t('mineName')}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{mineInfo.mine}</Typography>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Navigation size={16} color="rgba(255,255,255,0.5)" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">{t('tunnel')}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{mineInfo.tunnel}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <MapPin size={16} color="rgba(255,255,255,0.5)" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">{t('section')}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{mineInfo.section}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Activity size={16} color="rgba(255,255,255,0.5)" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">{t('depth')}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{mineInfo.depth}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Shield size={16} color="rgba(255,255,255,0.5)" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">{t('nearestSafeExit')}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--neon-lime)' }}>{mineInfo.exit}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.06)' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Coordinates</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : "Tracking location..."}
                  </Typography>
                </Box>
                {isSimulated && (
                  <Chip label="GPS Sim Active" size="small" variant="outlined" color="warning" sx={{ height: 20, fontSize: 10, fontWeight: 'bold' }} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 4: AI SAFETY ASSISTANT (PERSONAL RECOMMENDATIONS) */}
        <Grid item xs={12} md={7}>
          <Card className="glass-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  🤖 {t('aiAssistant')}
                </Typography>
                <IconButton onClick={fetchDashboardData} size="small">
                  <RefreshCw size={16} />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 310, overflowY: 'auto', pr: 1 }}>
                {recommendations.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <CircularProgress size={30} sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">Aggregating real-time safety recommendations...</Typography>
                  </Box>
                ) : (
                  recommendations.map((rec, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: rec.severity === 'high' ? 'rgba(255, 51, 85, 0.06)' : rec.severity === 'medium' ? 'rgba(255, 170, 0, 0.05)' : 'rgba(0, 255, 136, 0.04)',
                          border: '1px solid',
                          borderColor: rec.severity === 'high' ? 'rgba(255, 51, 85, 0.15)' : rec.severity === 'medium' ? 'rgba(255, 170, 0, 0.12)' : 'rgba(0, 255, 136, 0.1)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1.5
                        }}
                      >
                        <Box sx={{ mt: 0.5 }}>
                          {rec.severity === 'high' ? (
                            <AlertCircle size={18} color="var(--neon-red)" />
                          ) : rec.severity === 'medium' ? (
                            <AlertTriangle size={18} color="var(--neon-amber)" />
                          ) : (
                            <Shield size={18} color="var(--neon-lime)" />
                          )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                              {rec.category}
                            </Typography>
                            <Chip
                              label={rec.severity.toUpperCase()}
                              size="small"
                              sx={{
                                height: 16,
                                fontSize: 9,
                                fontWeight: 900,
                                bgcolor: rec.severity === 'high' ? 'error.main' : rec.severity === 'medium' ? 'warning.main' : 'success.main',
                                color: '#fff'
                              }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.4 }}>
                            {rec.message}
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 5: MINE ENVIRONMENT SENSORS & UPDATES */}
        <Grid item xs={12} md={5}>
          <Card className="glass-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  🌡️ {t('environment')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Typography variant="caption" color="text.secondary">Live Feed</Typography>
                  <span className="status-dot status-dot-safe" />
                </Box>
              </Box>

              <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Thermometer size={20} color="var(--neon-amber)" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">{t('temperature')}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{telemetry?.telemetry?.temperature || "28.5"} °C</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Droplets size={20} color="var(--neon-cyan)" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">{t('humidity')}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{telemetry?.telemetry?.humidity || "62"} %</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Wind size={20} color="var(--neon-lime)" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">{t('airQuality')}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {telemetry?.telemetry?.co_level ? `${Math.round(telemetry.telemetry.co_level * 1.5)} AQI` : "38 AQI"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Shield size={20} color="var(--neon-lime)" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">{t('gasStatus')}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--neon-lime)' }}>
                        CH₄: {telemetry?.telemetry?.methane_level || "0.8"} %
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary', fontSize: '0.85rem' }}>
                📢 {t('supervisorAnnounce')}
              </Typography>
              
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 1.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.04)', height: 80, overflowY: 'auto' }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 'bold' }}>
                  Vikram Singh (09:15 AM)
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.3 }}>
                  Safety Check completed for Tunnel 4-C. Section A is approved for blasting.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 6: CHECKLIST COMPLIANCE PROGRESS */}
        <Grid item xs={12} md={5} lg={4}>
          <Card className="glass-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                📋 {t('todayTasks')}
              </Typography>

              {/* Progress bar */}
              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">{t('progress')}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {Object.values(checklist).filter(Boolean).length} / 5 Done
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Object.values(checklist).filter(Boolean).length * 20}
                  sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.05)' }}
                />
              </Box>

              {/* Interactive Checklist checkboxes */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                {[
                  { key: 'helmet_worn', label: 'Safety Helmet & Headlamp' },
                  { key: 'safety_boots_worn', label: 'Steel-toed safety boots' },
                  { key: 'gas_detector_checked', label: 'Gas Detector Calibrated' },
                  { key: 'emergency_light_working', label: 'Jacket & Emergency Light' },
                  { key: 'communication_device_working', label: 'Two-Way Radio check' }
                ].map((item) => (
                  <Box
                    key={item.key}
                    onClick={() => handleChecklistToggle(item.key)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: checklist[item.key] ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255,255,255,0.04)',
                      bgcolor: checklist[item.key] ? 'rgba(0, 255, 136, 0.04)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: checklist[item.key] ? 600 : 400 }}>
                      {item.label}
                    </Typography>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '4px',
                        border: '2px solid',
                        borderColor: checklist[item.key] ? 'var(--neon-lime)' : 'rgba(255,255,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: checklist[item.key] ? 'var(--neon-lime)' : 'transparent'
                      }}
                    >
                      {checklist[item.key] && <Check size={14} color="#000" strokeWidth={3} />}
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 7: RECENT ALERTS TIMELINE */}
        <Grid item xs={12} md={7} lg={4}>
          <Card className="glass-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                🔔 {t('notifications')}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 310, overflowY: 'auto' }}>
                {alerts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                    No alerts reported today.
                  </Typography>
                ) : (
                  alerts.map((alert) => (
                    <Box
                      key={alert.id}
                      sx={{
                        position: 'relative',
                        pl: 2.5,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 4,
                          top: 8,
                          bottom: -20,
                          width: 2,
                          bgcolor: 'rgba(255,255,255,0.08)'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: 4,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: alert.type === 'hazard_warning' ? 'error.main' : 'info.main',
                          boxShadow: `0 0 6px ${alert.type === 'hazard_warning' ? '#ff3355' : '#00f0ff'}`
                        }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                          {alert.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.3 }}>
                        {alert.message}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 8: SAFETY EQUIPMENT STATUS */}
        <Grid item xs={12} md={12} lg={4}>
          <Card className="glass-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5 }}>
                🧰 {t('equipmentStatus')}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {assignedEquipment.map((eq) => (
                  <Box
                    key={eq.id}
                    sx={{
                      p: 1.8,
                      borderRadius: 3,
                      border: '1px solid rgba(255,255,255,0.04)',
                      bgcolor: 'rgba(255,255,255,0.01)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.03)', color: 'text.secondary', width: 36, height: 36 }}>
                        {eq.id === 1 ? <BatteryCharging size={18} /> : eq.id === 2 ? <Activity size={18} /> : <Wrench size={18} />}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{eq.name}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {t('dueMaintenance')}: {eq.service}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: 'right' }}>
                      {eq.battery !== null ? (
                        <Chip
                          label={`${eq.battery}% ${t('battery')}`}
                          size="small"
                          color={eq.battery > 50 ? "success" : eq.battery > 20 ? "warning" : "error"}
                          variant="outlined"
                          sx={{ height: 20, fontSize: 10, fontWeight: 'bold' }}
                        />
                      ) : (
                        <Chip
                          label={eq.status}
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ height: 20, fontSize: 10, fontWeight: 'bold' }}
                        />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* QUICK ACTIONS ROW */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5, mb: 2 }}>
            ⚡ {t('quickActions')}
          </Typography>
          <Grid container spacing={2}>
            {[
              { label: t('aiHazardScanner'), icon: <Camera size={24} />, color: 'primary.main', action: () => setScannerOpen(true) },
              { label: 'Report Incident', icon: <AlertTriangle size={24} />, color: 'warning.main', action: () => navigate('/worker/hazards') },
              { label: t('aiAssistant'), icon: <Sparkles size={24} />, color: 'secondary.main', action: () => setChatOpen(true) },
              { label: t('offlineMap'), icon: <Navigation size={24} />, color: 'success.main', action: () => setMapOpen(true) },
              { label: t('emergencySos'), icon: <AlertCircle size={24} />, color: 'error.main', action: handleEmergencySOS },
              { label: t('voiceAssistant'), icon: <Mic size={24} />, color: 'info.main', action: () => setVoiceOpen(true) },
              { label: t('checklist'), icon: <CheckSquare size={24} />, color: 'text.secondary', action: () => navigate('/worker/checklist') },
              { label: t('notifications'), icon: <Bell size={24} />, color: 'action.disabled', action: () => navigate('/worker/notifications') }
            ].map((act, index) => (
              <Grid item xs={6} sm={3} md={1.5} key={index}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card
                    onClick={act.action}
                    className="glass-card"
                    sx={{
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: 3,
                      p: 1.5,
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <Box sx={{ color: act.color, mb: 1, display: 'flex', justifyContent: 'center' }}>
                      {act.icon}
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: 0.5 }}>
                      {act.label}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* CARD 9: OFFLINE MINE MAP ROUTE WIDGET */}
        <Grid item xs={12} md={5}>
          <Card className="glass-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                🗺️ {t('offlineMap')}
              </Typography>
              
              <Box
                sx={{
                  position: 'relative',
                  height: 250,
                  borderRadius: 3,
                  bgcolor: '#0d1117',
                  border: '1px solid rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Simulated SVG Grid Map */}
                <svg width="100%" height="100%" viewBox="0 0 400 250">
                  {/* Grid Layout lines */}
                  <path d="M 0,50 L 400,50 M 0,100 L 400,100 M 0,150 L 400,150 M 0,200 L 400,200 M 100,0 L 100,250 M 200,0 L 200,250 M 300,0 L 300,250" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  
                  {/* Mine Shaft Walls */}
                  <path d="M 20,40 H 380 M 20,210 H 380 M 100,40 V 210 M 300,40 V 210" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
                  
                  {/* Safe Exit Escape Path */}
                  <path d="M 50,120 L 100,120 L 100,60 L 300,60 L 300,180 L 350,180" stroke="var(--neon-lime)" strokeWidth="3" strokeDasharray="6,4" fill="none" style={{ animation: 'radar-sweep 8s linear infinite' }} />

                  {/* Escape assembly point */}
                  <g transform="translate(350, 180)">
                    <circle cx="0" cy="0" r="10" fill="#00ff88" opacity="0.3" />
                    <circle cx="0" cy="0" r="4" fill="#00ff88" />
                  </g>
                  
                  {/* Emergency Refuge Chamber */}
                  <g transform="translate(100, 160)">
                    <rect x="-8" y="-8" width="16" height="16" rx="3" fill="#ffaa00" opacity="0.8" />
                    <text x="-4" y="4" fill="#000" fontSize="10" fontWeight="bold">RC</text>
                  </g>

                  {/* Worker Position */}
                  <g transform="translate(50, 120)">
                    <circle cx="0" cy="0" r="14" fill="#00f0ff" opacity="0.2" style={{ animation: 'pulse-glow 2s infinite' }} />
                    <circle cx="0" cy="0" r="6" fill="#00f0ff" />
                  </g>
                </svg>

                {/* Info Overlay */}
                <Box sx={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', bgcolor: 'rgba(0,0,0,0.6)', p: 1, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: 'var(--neon-lime)' }}>
                    🟢 Exit Route Clear
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Exit 3: 80m away
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2, borderRadius: 2, textTransform: 'none', border: '1px solid rgba(255,255,255,0.08)' }}
                onClick={() => navigate('/worker/map')}
              >
                Open Full Interactive Map
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 10: PERSONAL SAFETY ANALYTICS */}
        <Grid item xs={12} md={7}>
          <Card className="glass-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                📈 {t('safetyAnalytics')}
              </Typography>
              
              <Box sx={{ width: '100%', height: 210 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Jan', Checklists: 12, Hazards: 1, SafeDays: 28 },
                    { name: 'Feb', Checklists: 18, Hazards: 2, SafeDays: 26 },
                    { name: 'Mar', Checklists: 22, Hazards: 0, SafeDays: 31 },
                    { name: 'Apr', Checklists: 20, Hazards: 1, SafeDays: 30 },
                    { name: 'May', Checklists: 24, Hazards: 3, SafeDays: 27 },
                    { name: 'Jun', Checklists: 26, Hazards: 1, SafeDays: 29 },
                  ]}>
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                    <RechartsTooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }} labelStyle={{ color: '#fff' }} />
                    <Bar dataKey="Checklists" fill="var(--neon-cyan)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="SafeDays" fill="var(--neon-lime)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" display="block">{t('reportedHazards')}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>8 Total</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" display="block">{t('checklistsCompleted')}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>112 Days</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" display="block">Safe Working Streak</Typography>
                  <Typography variant="h6" color="var(--neon-lime)" sx={{ fontWeight: 800 }}>120 Days</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 11: ACHIEVEMENTS & BADGES CARD */}
        <Grid item xs={12} md={5} lg={4}>
          <Card className="glass-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                🏆 {t('achievements')}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255, 170, 0, 0.1)', color: 'var(--neon-amber)', width: 50, height: 50 }}>
                  <Award size={30} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 850 }}>120 Days</Typography>
                  <Typography variant="body2" color="text.secondary">{t('safeDays')}</Typography>
                </Box>
              </Box>

              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontWeight: 'bold' }}>
                Safety Badges Earned
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {[
                  { name: "PPE Champion", color: 'var(--neon-lime)' },
                  { name: "Zero Incident Hero", color: 'var(--neon-cyan)' },
                  { name: "First Aid Cert", color: 'var(--neon-amber)' }
                ].map((badge, idx) => (
                  <Chip
                    key={idx}
                    label={badge.name}
                    variant="outlined"
                    sx={{
                      borderColor: badge.color,
                      color: badge.color,
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      bgcolor: 'rgba(255,255,255,0.01)'
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 12: EMERGENCY QUICK CONTACTS */}
        <Grid item xs={12} md={7} lg={4}>
          <Card className="glass-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5 }}>
                🚨 {t('emergencyContacts')}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { name: "Control Room Dispatch", phone: "+91 326 220 5411" },
                  { name: "Medical Response Team", phone: "+91 326 220 5422" },
                  { name: "Rescue / Evacuation Team", phone: "+91 326 220 5433" }
                ].map((contact, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      border: '1px solid rgba(255,255,255,0.04)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{contact.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{contact.phone}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" component="a" href={`tel:${contact.phone}`} sx={{ color: 'var(--neon-lime)' }}>
                        <PhoneCall size={16} />
                      </IconButton>
                      <IconButton size="small" component="a" href={`sms:${contact.phone}`} sx={{ color: 'var(--neon-cyan)' }}>
                        <MessageSquare size={16} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 13: RECENT HAZARD REPORTS LOG */}
        <Grid item xs={12} md={12} lg={4}>
          <Card className="glass-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                📑 {t('recentHazards')}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 220, overflowY: 'auto' }}>
                {recentReports.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                    No hazards reported recently.
                  </Typography>
                ) : (
                  recentReports.map((report) => (
                    <Box
                      key={report.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        border: '1px solid rgba(255,255,255,0.04)',
                        bgcolor: 'rgba(255,255,255,0.01)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {report.images && report.images.length > 0 ? (
                          <Box
                            component="img"
                            src={`http://localhost:8000/api${report.images[0].image_url}`}
                            sx={{ width: 44, height: 44, borderRadius: 2, objectFit: 'cover' }}
                          />
                        ) : (
                          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.04)', width: 44, height: 44 }}>
                            <AlertTriangle size={20} />
                          </Avatar>
                        )}
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{report.hazard_type}</Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {report.location} • {new Date(report.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>

                      <Chip
                        label={report.status.toUpperCase()}
                        size="small"
                        color={report.status === 'resolved' ? 'success' : report.status === 'under_review' ? 'warning' : 'default'}
                        sx={{ fontSize: '0.65rem', height: 18, fontWeight: 'bold' }}
                      />
                    </Box>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* ------------------ MODAL 1: AI HAZARD SCANNER ------------------ */}
      <Dialog open={scannerOpen} onClose={() => setScannerOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#0b0f17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Camera size={20} color="var(--neon-cyan)" />
          {t('aiHazardScanner')}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: '100%',
                height: 200,
                border: '2px dashed rgba(255,255,255,0.1)',
                borderRadius: 3,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                bgcolor: 'rgba(0,0,0,0.2)'
              }}
            >
              {scanPreview ? (
                <>
                  <Box component="img" src={scanPreview} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  {isScanning && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: 4,
                        bgcolor: 'var(--neon-cyan)',
                        boxShadow: '0 0 10px var(--neon-cyan)',
                        animation: 'scan-line 2s linear infinite'
                      }}
                    />
                  )}
                </>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <Upload size={36} color="rgba(255,255,255,0.4)" style={{ marginBottom: 8 }} />
                  <Typography variant="body2" color="text.secondary">Select or capture a hazard image</Typography>
                </Box>
              )}
            </Box>

            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleScanFileChange} style={{ display: 'none' }} />

            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
              <Button variant="outlined" fullWidth onClick={() => fileInputRef.current.click()} startIcon={<Upload size={16} />}>
                {t('uploadImage')}
              </Button>
              <Button variant="contained" fullWidth onClick={triggerScanner} disabled={!scanFile || isScanning} startIcon={isScanning ? <CircularProgress size={16} /> : <Play size={16} />}>
                {isScanning ? t('analyzingImage') : "Analyze Hazard"}
              </Button>
            </Box>

            {scanResult && (
              <Box sx={{ width: '100%', mt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: scanResult.severity === 'critical' ? 'rgba(255,51,85,0.1)' : 'rgba(255,170,0,0.1)',
                  border: '1px solid',
                  borderColor: scanResult.severity === 'critical' ? 'rgba(255,51,85,0.3)' : 'rgba(255,170,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <AlertTriangle size={18} color={scanResult.severity === 'critical' ? '#ff3355' : '#ffaa00'} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {scanResult.hazard_type} ({scanResult.severity.toUpperCase()} RISK)
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2"><strong>{t('riskLevel')}:</strong> {scanResult.risk_level}</Typography>
                  <Typography variant="body2"><strong>{t('precautions')}:</strong> {scanResult.precautions}</Typography>
                  <Typography variant="body2"><strong>{t('requiredPpe')}:</strong> {scanResult.required_ppe}</Typography>
                  <Typography variant="body2"><strong>{t('immediateActions')}:</strong> {scanResult.immediate_actions}</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setScannerOpen(false)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* ------------------ MODAL 2: TEXT & CHATBOT ASSISTANT ------------------ */}
      <Dialog open={chatOpen} onClose={() => setChatOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#0b0f17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Sparkles size={20} color="var(--neon-purple)" />
          {t('aiAssistant')}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.08)', p: 0 }}>
          <Box sx={{ height: 350, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {chatLogs.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender === 'worker' ? 'flex-end' : 'flex-start'
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    maxWidth: '80%',
                    bgcolor: msg.sender === 'worker' ? 'primary.main' : 'rgba(255,255,255,0.03)',
                    color: '#fff',
                    border: msg.sender === 'worker' ? 'none' : '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{msg.text}</Typography>
                </Box>
              </Box>
            ))}
            {chatLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <CircularProgress size={20} />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, display: 'flex', gap: 1 }}>
          <TextField
            placeholder={t('askQuestion')}
            fullWidth
            size="small"
            value={chatQuery}
            onChange={(e) => setChatQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitChatQuestion()}
            sx={{ fieldset: { borderColor: 'rgba(255,255,255,0.08)' } }}
          />
          <Button variant="contained" onClick={submitChatQuestion} disabled={chatLoading}>
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------ MODAL 3: VOICE AI ASSISTANT PORTAL ------------------ */}
      <Dialog open={voiceOpen} onClose={() => { setVoiceOpen(false); synthRef.current.cancel(); }} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: '#0b0f17', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Mic size={20} color="var(--neon-red)" />
          {t('voiceAssistant')}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 3 }}>
          
          <Box sx={{ position: 'relative' }}>
            <motion.div
              animate={{
                scale: isVoiceListening ? [1, 1.2, 1] : 1,
                boxShadow: isVoiceListening ? ["0 0 0px rgba(255, 51, 85, 0.4)", "0 0 20px rgba(255, 51, 85, 0.8)", "0 0 0px rgba(255, 51, 85, 0.4)"] : "none"
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{
                width: 90, height: 90, borderRadius: '50%',
                backgroundColor: isVoiceListening ? '#ff3355' : 'rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                border: '2px solid rgba(255,255,255,0.1)'
              }}
              onClick={toggleVoiceListening}
            >
              {isVoiceListening ? <Mic size={40} color="#fff" /> : <MicOff size={40} color="rgba(255,255,255,0.4)" />}
            </motion.div>
          </Box>

          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {isVoiceListening ? t('listening') : isSpeakingAnswer ? "Speaking Response..." : "Tap Mic to speak"}
            </Typography>
            {voiceTranscript && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, italic: true }}>
                "{voiceTranscript}"
              </Typography>
            )}
          </Box>

          {/* Speaks Indicator */}
          {isSpeakingAnswer && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Volume2 size={20} color="var(--neon-cyan)" style={{ animation: 'breathe 1.5s infinite' }} />
              <Typography variant="caption" color="var(--neon-cyan)">Voice Broadcast Playing</Typography>
            </Box>
          )}

          {/* Mini Chat logs showing response text */}
          {chatLogs.length > 0 && (
            <Box sx={{ width: '100%', mt: 2, bgcolor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', p: 1.5, borderRadius: 2, maxHeight: 110, overflowY: 'auto' }}>
              <Typography variant="caption" color="text.secondary">Latest Response Summary:</Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.3, mt: 0.5, whiteSpace: 'pre-line' }}>
                {chatLogs[chatLogs.length - 1].text}
              </Typography>
            </Box>
          )}

        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setVoiceOpen(false); synthRef.current.cancel(); }} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

