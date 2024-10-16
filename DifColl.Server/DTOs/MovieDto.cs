namespace DifColl.Server.DTOs
{
    public class MovieDto
    {
        public string Id { get; set; }

        public string Title { get; set; }

        public string Directors { get; set; }

        public string Genres { get; set; }

        public string ReleaseDate { get; set; }

        public string PosterPath { get; set; }

        public string Overview { get; set; }

        public float Rating { get; set; } // New
    }
}
