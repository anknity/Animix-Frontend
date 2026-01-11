import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import PrimarySidebar from './components/PrimarySidebar';
import TopBar from './components/TopBar';
import RightSidebar from './components/RightSidebar';
import MobileMenuSheet from './components/MobileMenuSheet';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import MangaDetailsPage from './pages/MangaDetailsPage';
import ReaderPage from './pages/ReaderPage';
import CommunityPage from './pages/CommunityPage';
import AnimePage from './pages/AnimePage';
import AnimeSchedulePage from './pages/AnimeSchedulePage';
import AnimeDetailsPage from './pages/AnimeDetailsPage';

const ScrollToHash = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const target = document.querySelector(location.hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  return null;
};

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openMenu = () => setMobileMenuOpen(true);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <Router>
      <ScrollToHash />
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-[1600px] mx-auto px-4 py-6 flex gap-6">
          <PrimarySidebar />
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <TopBar onMenuToggle={openMenu} />
            <main className="flex-1 min-h-0">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/manga/:mangaId" element={<MangaDetailsPage />} />
                <Route path="/manga/:mangaId/read/:chapterId" element={<ReaderPage />} />
                <Route path="/anime" element={<AnimePage />} />
                <Route path="/anime/:animeId" element={<AnimeDetailsPage />} />
                <Route path="/anime/schedule" element={<AnimeSchedulePage />} />
                <Route path="/community" element={<CommunityPage />} />
              </Routes>
            </main>
          </div>
          <RightSidebar />
        </div>
        <MobileMenuSheet open={mobileMenuOpen} onClose={closeMenu} />
      </div>
    </Router>
  );
}

export default App;
