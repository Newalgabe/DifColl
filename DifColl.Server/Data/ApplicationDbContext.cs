// Data/ApplicationDbContext.cs
using DifColl.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace DifColl.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<Book> Books { get; set; }

        // New DbSets
        public DbSet<Movie> Movies { get; set; }
        public DbSet<Game> Games { get; set; }

    }
}
