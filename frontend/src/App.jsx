import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "./App.css";
import NavBar from "./components/layout/navbar";
import Footer from "./components/layout/footer";
import { supabase } from "./services/supabase/client";
import { clearUser, setUser } from "./redux/userSlice";
import { fetchCachedRecommendations } from "./pages/recommendations/recommendationCache";

// Pages
import Home from "./pages/home/Home";
import Movies from "./pages/Movies";
import TVShows from "./pages/TVShows";
import MediaDetails from "./pages/details/MediaDetails";
import SearchResults from "./pages/SearchResults";
import Profile from "./pages/profile/Profile";
// import PersonMedia from "./pages/details/PersonMedia";
// import Recommendations from "./pages/recommendations/Recommend";
import NotFound from "./pages/404";
import Auth from "./pages/Auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

function RedirectToMedia({ type }) {
  const { id } = useParams();
  return <Navigate to={`/media/${type}/${id}`} replace />;
}

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  // Fix: Move global recommendations fetch into a controlled effect
  useEffect(() => {
    if (user?.id) {
      fetchCachedRecommendations(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    const initSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        dispatch(
          setUser({
            id: session.user.id,
            email: session.user.email,
            display_name: session.user.user_metadata?.display_name || "",
          }),
        );
      }
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          dispatch(
            setUser({
              id: session.user.id,
              email: session.user.email,
              display_name: session.user.user_metadata?.display_name || "",
            }),
          );
        } else {
          dispatch(clearUser());
        }
      },
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [dispatch]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="font-poppins bg-black-100 min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 m-h-full relative">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tvshows" element={<TVShows />} />

            <Route path="/media/:type/:id" element={<MediaDetails />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/signin" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            {/* <Route path="/person/:personId" element={<PersonMedia />} /> */}
            {/* <Route path="/recommendations" element={<Recommendations />} /> */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
