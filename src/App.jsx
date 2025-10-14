import { Route, Routes } from "react-router-dom";
import "./App.css";
import NavBar from "./components/navbar";
import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import TVShowDetails from "./pages/TVShowDetails";
import SearchResults from "./pages/SearchResults";
import Auth from "./pages/Auth";
import Movies from "./pages/Movies";
import TVShows from "./pages/TVShows";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { supabase } from "./supabaseClient";
import { clearUser, setUser } from "./redux/userSlice";
import Profile from "./pages/Profile";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import NotFound from "./pages/404";
import Explore from "./pages/Explore";
import ExploreTVShows from "./pages/ExploreTVShows";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // optional: reduce refetch chatter
      staleTime: 1000 * 60 * 5, // 5 minutes by default
      cacheTime: 1000 * 60 * 30, // 30 minutes before garbage collect
    },
  },
});

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    // Get session on load
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
          })
        );
      }
    };

    initSession();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          dispatch(
            setUser({
              id: session.user.id,
              email: session.user.email,
              display_name: session.user.user_metadata?.display_name || "",
            })
          );
        } else {
          dispatch(clearUser());
        }
      }
    );

    // Cleanup listener
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
            <Route path="/exploremovies" element={<Explore />} />
            <Route path="/exploretvshows" element={<ExploreTVShows />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/tvshows" element={<TVShows />} />
            <Route path="/tvshows/:id" element={<TVShowDetails />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/signin" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
