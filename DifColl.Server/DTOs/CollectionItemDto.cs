// DTOs/CollectionItemDto.cs
namespace DifColl.Server.DTOs
{
    public class CollectionItemDto
    {
        public string Id { get; set; }
        public string Name { get; set; } // Title for books and movies, Name for games
        public string Type { get; set; } // "Book", "Movie", "Game"
        public string Released { get; set; } // PublishedDate for books, ReleaseDate for movies and games
        public string Description { get; set; }
        public string Genres { get; set; }
        public string BackgroundImage { get; set; }
        public double Rating { get; set; }
    }
}
