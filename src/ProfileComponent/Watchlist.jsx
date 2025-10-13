import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getMediaByPreference } from "../supabasePreferences";
import { getMovieDetails, getTVShowDetails } from "../movieAPI";
import MovieList from "./MovieList";
import TVShowList from "./TVShowList";

export default function Watchlist() {
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;

  const [userTVMediaIds, setUserTVMediaIds] = useState([]);
  const [userMovieMediaIds, setUserMovieMediaIds] = useState([]);
  const [userTVMedia, setUserTVMedia] = useState([]);
  const [userMovieMedia, setUserMovieMedia] = useState([]);

  useEffect(() => {
    if (userId) {
      getMediaByPreference(userId, "watchlist", "tv").then(setUserTVMediaIds);
      getMediaByPreference(userId, "watchlist", "movie").then(
        setUserMovieMediaIds
      );
    }
  }, [userId]);

  useEffect(() => {
    async function fetchUserMedia() {
      if (userTVMediaIds.length > 0) {
        const tvData = await Promise.all(userTVMediaIds.map(getTVShowDetails));
        setUserTVMedia(tvData);
      } else {
        setUserTVMedia([]);
      }

      if (userMovieMediaIds.length > 0) {
        const movieData = await Promise.all(
          userMovieMediaIds.map(getMovieDetails)
        );
        setUserMovieMedia(movieData);
      } else {
        setUserMovieMedia([]);
      }
    }

    fetchUserMedia();
  }, [userTVMediaIds, userMovieMediaIds]);

  return (
    <section className="p-6 md:p-10">
      <h1 className="text-3xl font-semibold text-white-100 mb-6">
        Your Watchlist
      </h1>

      {userMovieMedia.length > 0 && (
        <MovieList
          movies={userMovieMedia}
          watchlistMovies={userMovieMedia}
          watchlistTVShows={userTVMedia}
        />
      )}

      {userTVMedia.length > 0 && (
        <TVShowList
          tvShows={userTVMedia}
          watchlistMovies={userMovieMedia}
          watchlistTVShows={userTVMedia}
        />
      )}

      {userMovieMedia.length === 0 && userTVMedia.length === 0 && (
        <p className="text-white-300">You have no items in your watchlist.</p>
      )}
    </section>
  );
}
