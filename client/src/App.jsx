import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar.jsx";
import PageWrapper from "./components/layout/PageWrapper.jsx";
import Home from "./pages/Home.jsx";
import WriteLetter from "./pages/WriteLetter.jsx";
import CaptainsLog from "./pages/CaptainsLog.jsx";
import TreasureChest from "./pages/TreasureChest.jsx";
import Noticeboard from "./pages/Noticeboard.jsx";
import Profile from "./pages/Profile.jsx";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <div className="min-h-screen ocean-waves text-text-primary font-ui">
      <div className="wave-anim" aria-hidden="true" />
      <div className="relative z-10">
        <Navbar />
        <PageWrapper>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/write" element={<WriteLetter />} />
            <Route path="/log" element={<CaptainsLog />} />
            <Route path="/treasure/:id" element={<TreasureChest />} />
            <Route path="/unlock/:token" element={<TreasureChest />} />
            <Route path="/noticeboard" element={<Noticeboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageWrapper>
      </div>
    </div>
  );
}
