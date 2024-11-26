using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DifColl.Server.Models
{
    public class Game
    {
        [Key, Column(Order = 0)]
        public string Id { get; set; }

        public string Name { get; set; }
        public string Released { get; set; }
        public string BackgroundImage { get; set; }
        public string Description { get; set; }
        public string Genres { get; set; }
        public double Rating { get; set; }
        public string Developer { get; set; } // New field for Developer
        public string Publisher { get; set; } // New field for Publisher

        [Key, Column(Order = 1)]
        public string UserId { get; set; } // Part of composite primary key
    }
}
