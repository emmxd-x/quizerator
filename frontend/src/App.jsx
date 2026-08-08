import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import History from "./pages/History";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import CollectionDetail from "./pages/CollectionDetail";
import Profile from "./pages/Profile";

function ProtectedRoute({ children }) {
  const { user, isGuest } = useAuth();
  if (!user && !isGuest) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/quiz" element={
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        } />
        <Route path="/results" element={
          <ProtectedRoute>
            <Results />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
<Route path="/collection/:id" element={
  <ProtectedRoute>
    <CollectionDetail />
  </ProtectedRoute>
} />
<Route path="/profile" element={
  <ProtectedRoute>
    <Profile />
  </ProtectedRoute>
} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;