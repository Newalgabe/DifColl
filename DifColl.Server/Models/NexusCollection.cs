namespace DifColl.Server.Models
{
    public class NexusCollection
    {
        public int Id { get; set; }
        public string UserId { get; set; }

        public virtual List<Book> Books { get; set; }
        public virtual List<Movie> Movies { get; set; }
        public virtual List<Game> Games { get; set; }

        public NexusCollection()
        {
            Books = new List<Book>();
            Movies = new List<Movie>();
            Games = new List<Game>();
        }
    }

}
