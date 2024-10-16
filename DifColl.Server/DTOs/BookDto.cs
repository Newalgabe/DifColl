namespace DifColl.Server.DTOs
{
    public class BookDto
    {
        public string Id { get; set; }

        public string Title { get; set; }

        public string[] Authors { get; set; }

        public string Thumbnail { get; set; }

        public string PublishedDate { get; set; } // New

        public string Description { get; set; } // New

        public string[] Genres { get; set; } // New

        public float Rating { get; set; } // New
    }
}
