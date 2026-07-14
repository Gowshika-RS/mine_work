// import { useState } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { ThemeProvider, CssBaseline } from '@mui/material';
// import { lightTheme, darkTheme } from './theme/theme';
// import { useTheme } from './hooks/useTheme';
// import { MainLayout } from './components/layout';

// // Auth Pages
// import { Login, Register, ForgotPassword } from './pages/auth';

// // Worker Pages
// import {
//   WorkerDashboard,
//   Profile,
//   Shift,
//   Map,
//   Hazards as WorkerHazards,
//   Checklist,
//   Recommendations,
//   Notifications,
// } from './pages/worker';

// // Admin Pages
// import {
//   AdminDashboard,
//   Workers,
//   WorkerDetails,
//   LiveMap,
//   Hazards as AdminHazards,
//   SOSCenter,
//   Reports,
//   Settings,
// } from './pages/admin';

// function App() {
//   const { isDarkMode, toggleTheme } = useTheme();
//   const [userRole, setUserRole] = useState('worker');
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   const handleLogout = () => {
//     setIsAuthenticated(false);
//     setUserRole('worker');
//   };

//   const theme = isDarkMode ? darkTheme : lightTheme;

//   // Protected Layout Wrapper
//   const ProtectedLayout = ({ children, role }) => {
//     if (!isAuthenticated) {
//       return <Navigate to="/login" />;
//     }
//     return (
//       <MainLayout
//         isDarkMode={isDarkMode}
//         onThemeToggle={toggleTheme}
//         userRole={role}
//         onLogout={handleLogout}
//       >
//         {children}
//       </MainLayout>
//     );
//   };

//   // Worker Routes Config
//   const workerRoutes = [
//     { path: '/worker/dashboard', component: WorkerDashboard },
//     { path: '/worker/profile', component: Profile },
//     { path: '/worker/shift', component: Shift },
//     { path: '/worker/map', component: Map },
//     { path: '/worker/hazards', component: WorkerHazards },
//     { path: '/worker/checklist', component: Checklist },
//     { path: '/worker/recommendations', component: Recommendations },
//     { path: '/worker/notifications', component: Notifications },
//   ];

//   // Admin Routes Config
//   const adminRoutes = [
//     { path: '/admin/dashboard', component: AdminDashboard },
//     { path: '/admin/workers', component: Workers },
//     { path: '/admin/worker-details', component: WorkerDetails },
//     { path: '/admin/live-map', component: LiveMap },
//     { path: '/admin/hazards', component: AdminHazards },
//     { path: '/admin/sos-center', component: SOSCenter },
//     { path: '/admin/reports', component: Reports },
//     { path: '/admin/settings', component: Settings },
//   ];

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <Router>
//         <Routes>
//           {/* Auth Routes */}
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />

//           {/* Worker Routes */}
//           {workerRoutes.map(({ path, component: Component }) => (
//             <Route
//               key={path}
//               path={path}
//               element={
//                 <ProtectedLayout role="worker">
//                   <Component />
//                 </ProtectedLayout>
//               }
//             />
//           ))}

//           {/* Admin Routes */}
//           {adminRoutes.map(({ path, component: Component }) => (
//             <Route
//               key={path}
//               path={path}
//               element={
//                 <ProtectedLayout role="admin">
//                   <Component />
//                 </ProtectedLayout>
//               }
//             />
//           ))}

//           {/* Default Route */}
//           <Route path="/" element={<Navigate to="/login" />} />
//           <Route path="*" element={<Navigate to="/login" />} />
//         </Routes>
//       </Router>
//     </ThemeProvider>
//   );
// }

// export default App;
//                 <img className="button-icon" src={reactLogo} alt="" />
//                 Learn more
//               </a>
//             </li>
//           </ul>
//         </div>
//         <div id="social">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#social-icon"></use>
//           </svg>
//           <h2>Connect with us</h2>
//           <p>Join the Vite community</p>
//           <ul>
//             <li>
//               <a href="https://github.com/vitejs/vite" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#github-icon"></use>
//                 </svg>
//                 GitHub
//               </a>
//             </li>
//             <li>
//               <a href="https://chat.vite.dev/" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#discord-icon"></use>
//                 </svg>
//                 Discord
//               </a>
//             </li>
//             <li>
//               <a href="https://x.com/vite_js" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#x-icon"></use>
//                 </svg>
//                 X.com
//               </a>
//             </li>
//             <li>
//               <a href="https://bsky.app/profile/vite.dev" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#bluesky-icon"></use>
//                 </svg>
//                 Bluesky
//               </a>
//             </li>
//           </ul>
//         </div>
//       </section>

//       <div className="ticks"></div>
//       <section id="spacer"></section>
//     </>
//   )
// }

// export default App
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { lightTheme, darkTheme } from "./theme/theme";
import { useTheme } from "./hooks/useTheme";
import { MainLayout } from "./components/layout";

// Auth Pages
import { Login, Register, ForgotPassword } from "./pages/auth";

// Worker Pages
import {
  WorkerDashboard,
  Profile,
  Shift,
  Map,
  Hazards as WorkerHazards,
  Checklist,
  Recommendations,
  Notifications,
  RiskAnalysis,
  AIPrediction,
} from "./pages/worker";

// Admin Pages
import {
  AdminDashboard,
  Workers,
  WorkerDetails,
  LiveMap,
  Hazards as AdminHazards,
  SOSCenter,
  Reports,
  Settings,
} from "./pages/admin";

function App() {
  const { isDarkMode, toggleTheme } = useTheme();

  const [userRole, setUserRole] = useState("worker");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const theme = isDarkMode ? darkTheme : lightTheme;

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole("worker");
  };

  const ProtectedLayout = ({ children, role }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    return (
      <MainLayout
        isDarkMode={isDarkMode}
        onThemeToggle={toggleTheme}
        userRole={role}
        onLogout={handleLogout}
      >
        {children}
      </MainLayout>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Router>
        <Routes>
          {/* Authentication Routes */}

          <Route
            path="/login"
            element={
              <Login
                setIsAuthenticated={setIsAuthenticated}
                setUserRole={setUserRole}
              />
            }
          />

          <Route path="/register" element={<Register />} />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          {/* Worker Routes */}

          <Route
            path="/worker/dashboard"
            element={
              <ProtectedLayout role="worker">
                <WorkerDashboard />
              </ProtectedLayout>
            }
          />

          <Route
            path="/worker/profile"
            element={
              <ProtectedLayout role="worker">
                <Profile />
              </ProtectedLayout>
            }
          />

          <Route
            path="/worker/shift"
            element={
              <ProtectedLayout role="worker">
                <Shift />
              </ProtectedLayout>
            }
          />

          <Route
            path="/worker/map"
            element={
              <ProtectedLayout role="worker">
                <Map />
              </ProtectedLayout>
            }
          />

          <Route
            path="/worker/hazards"
            element={
              <ProtectedLayout role="worker">
                <WorkerHazards />
              </ProtectedLayout>
            }
          />

          <Route
            path="/worker/checklist"
            element={
              <ProtectedLayout role="worker">
                <Checklist />
              </ProtectedLayout>
            }
          />

          <Route
            path="/worker/recommendations"
            element={
              <ProtectedLayout role="worker">
                <Recommendations />
              </ProtectedLayout>
            }
          />

          <Route
            path="/worker/notifications"
            element={
              <ProtectedLayout role="worker">
                <Notifications />
              </ProtectedLayout>
            }
          />

          <Route
            path="/worker/risk-analysis"
            element={
              <ProtectedLayout role="worker">
                <RiskAnalysis />
              </ProtectedLayout>
            }
          />

          <Route
            path="/worker/ai-prediction"
            element={
              <ProtectedLayout role="worker">
                <AIPrediction />
              </ProtectedLayout>
            }
          />

          {/* Admin Routes */}

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedLayout role="admin">
                <AdminDashboard />
              </ProtectedLayout>
            }
          />

          <Route
            path="/admin/workers"
            element={
              <ProtectedLayout role="admin">
                <Workers />
              </ProtectedLayout>
            }
          />

          <Route
            path="/admin/worker-details"
            element={
              <ProtectedLayout role="admin">
                <WorkerDetails />
              </ProtectedLayout>
            }
          />

          <Route
            path="/admin/live-map"
            element={
              <ProtectedLayout role="admin">
                <LiveMap />
              </ProtectedLayout>
            }
          />

          <Route
            path="/admin/hazards"
            element={
              <ProtectedLayout role="admin">
                <AdminHazards />
              </ProtectedLayout>
            }
          />

          <Route
            path="/admin/sos-center"
            element={
              <ProtectedLayout role="admin">
                <SOSCenter />
              </ProtectedLayout>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <ProtectedLayout role="admin">
                <Reports />
              </ProtectedLayout>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <ProtectedLayout role="admin">
                <Settings />
              </ProtectedLayout>
            }
          />

          {/* Default Routes */}

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;