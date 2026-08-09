import { useState, useEffect } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Box, Typography } from '@mui/material';
import { Language } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
];

export const LanguageSelector = ({ variant = 'outlined', size = 'small', showLabel = true }) => {
  const { i18n, t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(
    i18n.language || localStorage.getItem('language') || localStorage.getItem('i18nextLng') || 'en'
  );

  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  const handleLanguageChange = (event) => {
    const langCode = event.target.value;
    setCurrentLang(langCode);
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    localStorage.setItem('i18nextLng', langCode);
  };

  return (
    <FormControl size={size} variant={variant} sx={{ minWidth: 160, width: '100%' }}>
      {showLabel && (
        <InputLabel id="language-select-label">
          🌐 {t('navbar.language') || 'Language'}
        </InputLabel>
      )}
      <Select
        labelId="language-select-label"
        id="language-select"
        value={currentLang}
        label={showLabel ? (`🌐 ${t('navbar.language') || 'Language'}`) : undefined}
        onChange={handleLanguageChange}
        startAdornment={<Language sx={{ mr: 1, color: 'primary.main', fontSize: 18 }} />}
        sx={{
          borderRadius: 2,
          bgcolor: 'background.paper',
          fontSize: '0.875rem',
        }}
      >
        {LANGUAGES.map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Typography variant="body2" fontWeight={600}>
                {lang.native}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                ({lang.label})
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;
