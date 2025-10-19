import { useState } from "react";
import axios from "axios";

export default function Recommendations() {
  const [movie, setMovie] = useState("");
  const [recommendations, setRecommendations] = useState([]);

  const getRecommendations = async () => {
    const res = await axios.get(
      `http://127.0.0.1:8000/recommend?title=${encodeURIComponent(movie)}`
    );
    setRecommendations(res.data.recommendations);
  };

  console.log(recommendations);

  return (
    <div>
      <h2>Movie Recommendations</h2>
      <input
        type="text"
        placeholder="Enter movie title"
        value={movie}
        onChange={(e) => setMovie(e.target.value)}
      />
      <button onClick={getRecommendations}>Get Recommendations</button>

      <ul>
        {recommendations &&
        Array.isArray(recommendations) &&
        recommendations.length > 0 ? (
          recommendations.map((rec, idx) => (
            <div key={idx}>
              {rec.title} — ⭐ {rec.avg_rating} | Sim: {rec.similarity}
            </div>
          ))
        ) : (
          <p>No recommendations found for this movie.</p>
        )}
      </ul>
    </div>
  );
}
