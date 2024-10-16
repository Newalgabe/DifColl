using System.ComponentModel.DataAnnotations;

namespace DifColl.Server.Models
{
    public class Book
    {
        [Key]
        public string Id { get; set; } // Google Books ID

        public string Title { get; set; }

        public string Authors { get; set; }

        public string Thumbnail { get; set; }

        public string PublishedDate { get; set; } // New

        public string Description { get; set; } // New

        public string Genres { get; set; } // New

        public float Rating { get; set; } // New

        public string UserId { get; set; }
    }
}
