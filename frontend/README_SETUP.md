# Safety App - Frontend

A modern React-based safety management application with Material UI, built with Vite.

## 🚀 Features

- **Authentication Pages**
  - Login
  - Register
  - Forgot Password

- **Worker Dashboard**
  - Dashboard with incident trends and safety scores
  - Profile management
  - Shift tracking and timeline
  - Map integration for location tracking
  - Hazard detection and acknowledgment
  - Safety checklist
  - Personalized recommendations
  - Notifications management

- **Admin Dashboard**
  - Comprehensive dashboard with analytics
  - Worker management and details
  - Live map tracking
  - Hazard management
  - SOS Center for emergency response
  - Advanced reporting with charts
  - System settings

- **UI/UX Features**
  - Material UI components
  - Responsive design (mobile, tablet, desktop)
  - Dark/Light theme toggle
  - Persistent theme preference
  - Sidebar navigation
  - Charts (Line, Pie, Bar)

## 📋 Prerequisites

- Node.js 18+ 
- npm 9+ or yarn 4+

## ⚙️ Installation

1. **Install dependencies**
```bash
npm install
```

2. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── auth/              # Authentication pages
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── index.js
│   │   ├── worker/            # Worker pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Shift.jsx
│   │   │   ├── Map.jsx
│   │   │   ├── Hazards.jsx
│   │   │   ├── Checklist.jsx
│   │   │   ├── Recommendations.jsx
│   │   │   ├── Notifications.jsx
│   │   │   └── index.js
│   │   └── admin/             # Admin pages
│   │       ├── Dashboard.jsx
│   │       ├── Workers.jsx
│   │       ├── WorkerDetails.jsx
│   │       ├── LiveMap.jsx
│   │       ├── Hazards.jsx
│   │       ├── SOSCenter.jsx
│   │       ├── Reports.jsx
│   │       ├── Settings.jsx
│   │       └── index.js
│   ├── components/
│   │   ├── layout/            # Layout components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MainLayout.jsx
│   │   │   └── index.js
│   │   └── charts/            # Chart components
│   │       ├── LineChart.jsx
│   │       ├── PieChart.jsx
│   │       ├── BarChart.jsx
│   │       └── index.js
│   ├── theme/
│   │   └── theme.js           # Light/Dark themes
│   ├── hooks/
│   │   └── useTheme.js        # Theme hook with localStorage
│   ├── App.jsx                # Main app with routing
│   ├── main.jsx               # Entry point
│   ├── index.css
│   └── assets/
├── public/
├── package.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

## 🎨 Theming

### Available Themes
- **Light Theme**: Clean, professional appearance
- **Dark Theme**: Reduced eye strain for night usage

### Theme Colors
- **Primary**: Blue (`#1976d2`)
- **Secondary**: Pink (`#dc004e`)
- **Success**: Green (`#2e7d32`)
- **Warning**: Orange (`#ed6c02`)
- **Error**: Red (`#d32f2f`)

### Using Themes
Theme preference is automatically saved to localStorage and persists across sessions.

```jsx
import { useTheme } from './hooks/useTheme';

function MyComponent() {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {isDarkMode ? 'Light' : 'Dark'} Mode
    </button>
  );
}
```

## 📊 Charts

The app includes three chart types powered by Recharts:

### LineChart
For displaying trends over time
```jsx
<LineChartComponent data={data} dataKey="value" xKey="name" />
```

### BarChart
For comparing values across categories
```jsx
<BarChartComponent data={data} dataKey="value" xKey="name" />
```

### PieChart
For showing proportions
```jsx
<PieChartComponent data={data} nameKey="name" dataKey="value" />
```

## 🔐 Authentication & Authorization

Currently using client-side route protection. To integrate with backend:

1. **Update Login API**
```jsx
// In pages/auth/Login.jsx
const response = await axios.post('/api/auth/login', { email, password });
localStorage.setItem('token', response.data.token);
```

2. **Add API interceptor**
```jsx
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

3. **Implement proper authentication context** (recommended for production)

## 🚢 Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Preview Production Build
```bash
npm run preview
```

## 🔍 Code Quality

### Linting
```bash
npm run lint
```

## 📦 Dependencies

- **react**: UI library
- **react-dom**: React DOM rendering
- **react-router-dom**: Client-side routing
- **@mui/material**: Material Design components
- **@mui/icons-material**: Material Design icons
- **@emotion/react** & **@emotion/styled**: CSS-in-JS solution
- **recharts**: Charts and graphs
- **axios**: HTTP client (ready to use)

## 🔗 Integration Points

### Backend API Endpoints (to be configured)

The following endpoints need to be implemented in your backend:

**Authentication**
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`

**Worker Operations**
- `GET /api/workers/:id` - Get worker profile
- `PUT /api/workers/:id` - Update worker profile
- `GET /api/workers/:id/shifts` - Get shift information
- `GET /api/workers/:id/hazards` - Get hazards
- `POST /api/workers/:id/hazards/:hazardId/acknowledge` - Acknowledge hazard
- `GET /api/workers/:id/notifications` - Get notifications

**Admin Operations**
- `GET /api/admin/workers` - List all workers
- `GET /api/admin/workers/:id` - Get worker details
- `GET /api/admin/hazards` - List hazards
- `GET /api/admin/sos-alerts` - Get SOS alerts
- `POST /api/admin/sos-alerts/:id/respond` - Respond to SOS
- `GET /api/admin/reports` - Get reports data
- `PUT /api/admin/settings` - Update settings

## 🤝 Contributing

When adding new features:

1. Create pages in the appropriate folder (`auth`, `worker`, `admin`)
2. Add routing in `App.jsx`
3. Use existing components and themes
4. Follow Material UI best practices
5. Ensure responsive design

## 📝 Notes

- Mock data is currently used. Replace with actual API calls when backend is ready.
- Authentication is client-side only. Implement proper backend authentication.
- Some pages (Map, Live Map) include placeholders for third-party integrations.

## 🐛 Troubleshooting

### Port 5173 already in use
```bash
npm run dev -- --port 5174
```

### Module not found errors
```bash
npm install
npm run dev
```

### Build errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📞 Support

For issues or questions, please refer to the backend documentation or contact the development team.

## 📄 License

This project is part of the Safety App suite. All rights reserved.
