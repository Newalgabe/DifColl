using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DifColl.Server.Models
{
    public class Movie
    {
        [Key, Column(Order = 0)]
        public string Id { get; set; } // TMDb Movie ID

        public string Title { get; set; }
        public string Directors { get; set; } // Comma-separated list
        public string Genres { get; set; } // Comma-separated list
        public string ReleaseDate { get; set; }
        public string PosterPath { get; set; }
        public string Overview { get; set; }
        public float Rating { get; set; } // New

        [Key, Column(Order = 1)]
        public string UserId { get; set; } // Part of composite primary key
    }
}
