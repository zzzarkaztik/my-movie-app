import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const MovieCard = ({ movie: { title, vote_average, release_date, poster_path, original_language } }) => {
  return (
    <div className="movie-card">
      <img
        src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : `${import.meta.env.BASE_URL}no-movie-portrait.png`}
        alt={`${title} poster`}
      />

      <div className="mt-4">
        <h3>{title}</h3>
        <div className="content">
          <div className="rating">
            <FontAwesomeIcon icon={faStar} color="#ed0" />
            <p>{vote_average ? vote_average.toFixed(1) : "N/A"}</p>
          </div>

          <span>·</span>
          <p className="lang">{original_language}</p>

          <span>·</span>
          <p className="year">{release_date ? new Date(release_date).getFullYear() : "N/A"}</p>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
