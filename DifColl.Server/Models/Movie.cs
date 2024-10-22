using System.ComponentModel.DataAnnotations;

namespace DifColl.Server.Models
{
    public class Movie
    {
        [Key]
        public string Id { get; set; } // TMDb Movie ID

        public string Title { get; set; }

        public string Directors { get; set; } // Comma-separated list

        public string Genres { get; set; } // Comma-separated list

        public string ReleaseDate { get; set; }


        public string PosterPath { get; set; }

        public string Overview { get; set; }

        public float Rating { get; set; } // New

        public string UserId { get; set; }
    }
}
