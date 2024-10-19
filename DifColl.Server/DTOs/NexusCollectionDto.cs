namespace DifColl.Server.DTOs
{
    public class NexusCollectionDto
    {
        public List<BookDto> Books { get; set; }
        public List<MovieDto> Movies { get; set; }
        public List<GameDto> Games { get; set; }

        public NexusCollectionDto()
        {
            Books = new List<BookDto>();
            Movies = new List<MovieDto>();
            Games = new List<GameDto>();
        }
    }

}
