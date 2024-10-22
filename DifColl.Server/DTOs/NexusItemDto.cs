namespace DifColl.Server.DTOs
{
    public class NexusItemDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Thumbnail { get; set; }
        public float Rating { get; set; }
        public string Type { get; set; } // To differentiate between books, movies, and games
        public string Authors { get; set; } // For books and movies
        public string PublishedDate { get; set; } // For books and movies
        public string Genres { get; set; } // For books, movies, and games
        public string Description { get; set; } // For books, movies, and games

        // Newly added fields
        public string Directors { get; set; } // For movies
        public string ReleaseDate { get; set; } // For movies
        public string PosterPath { get; set; } // For movies
        public string Overview { get; set; } // For movies
    }
}
