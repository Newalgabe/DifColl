import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export const renderStars = (rating) => {
  if (!rating) return null;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push(<FaStar key={i} className="star-filled" />);
    else if (i === full && half) stars.push(<FaStarHalfAlt key={i} className="star-filled" />);
    else stars.push(<FaRegStar key={i} className="star-empty" />);
  }
  return <span className="stars">{stars}</span>;
};

const SearchCard = ({ image, alt, title, metadata, genres, rating, ratingValue, onAddToCollection, onBookmark, onShare, onViewDetails, children }) => {
  const genreList = typeof genres === 'string' ? genres.split(',').map(g => g.trim()).filter(Boolean) : genres || [];

  return (
    <article className="search-card">
      <img
        src={image || 'https://via.placeholder.com/300x450?text=No+Image'}
        alt={alt}
        className="search-card-image"
        loading="lazy"
      />
      <div className="search-card-body">
        <h3 className="search-card-title">{title}</h3>
        {metadata?.map((item, i) => (
          item.value ? <p key={i} className="search-card-meta"><strong>{item.label}:</strong> {item.value}</p> : null
        ))}
        {genreList.length > 0 && (
          <div className="genre-badges">
            {genreList.slice(0, 3).map((g, i) => <span key={i} className="genre-badge">{g}</span>)}
          </div>
        )}
        {rating ? (
          <p className="rating-row">{renderStars(rating)} {ratingValue ? <span className="rating-value">{ratingValue}</span> : null}</p>
        ) : null}
        {children}
        <div className="actions">
          <button onClick={onAddToCollection} className="add-button">Add to Collection</button>
          <button onClick={onBookmark} className="bookmark-button">Bookmark</button>
          <button onClick={onShare} className="share-button">Share</button>
          <button onClick={onViewDetails} className="details-button">View Details</button>
        </div>
      </div>
    </article>
  );
};

export default SearchCard;
