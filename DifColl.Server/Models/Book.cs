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

        public string UserId { get; set; }
    }
}
