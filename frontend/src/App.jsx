import { Route, Routes } from "react-router-dom";
import React, { useEffect, lazy, Suspense } from "react";
import { ToastContainer } from "react-toastify";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "./App.css";
import NavBar from "./components/layout/navbar";
import Footer from "./components/layout/footer";
import { useAuth } from "./hooks/useAuth";
import { fetchCachedRecommendations } from "./pages/recommendations/recommendationCache";
import { PageLoader } from "./components/ui/LoadingSpinner";

// Lazy-loaded route pages for optimized initial bundle
const Home = lazy(() => import("./pages/home/Home"));
const Movies = lazy(() => import("./pages/Movies"));
const TVShows = lazy(() => import("./pages/TVShows"));
const MediaDetails = lazy(() => import("./pages/details/MediaDetails"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const PersonMedia = lazy(() => import("./pages/PersonMedia"));
const NotFound = lazy(() => import("./pages/404"));
const Auth = lazy(() => import("./pages/Auth"));

function App() {
  const { user } = useAuth();

  // Background hydration for user recommendations
  useEffect(() => {
    if (user?.id) {
      fetchCachedRecommendations(user.id);
    }
  }, [user?.id]);

  return (
    <div className="font-poppins bg-black-100 min-h-screen flex flex-col selection:bg-purple-600/30 selection:text-purple-200">
      <NavBar />
      <main className="flex-1 m-h-full relative">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tvshows" element={<TVShows />} />

            <Route path="/media/:type/:id" element={<MediaDetails />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/signin" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/person/:personId" element={<PersonMedia />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
      <ReactQueryDevtools initialIsOpen={false} />
    </div>
  );
}

export default App;
