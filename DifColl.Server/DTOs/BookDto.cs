namespace DifColl.Server.DTOs
{
    public class BookDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Authors { get; set; } // Keep as string[]
        public string Thumbnail { get; set; }
        public string PublishedDate { get; set; }
        public string Description { get; set; }
        public string Genres { get; set; } // Keep as string[]
        public float Rating { get; set; }
    }
}
