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
        public DbSet<Movie> Movies { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<Friendship> Friendships { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Composite Key Configuration for Books
            modelBuilder.Entity<Book>()
                .HasKey(b => new { b.Id, b.UserId });

            // Composite Key Configuration for Movies
            modelBuilder.Entity<Movie>()
                .HasKey(m => new { m.Id, m.UserId });

            // Composite Key Configuration for Games
            modelBuilder.Entity<Game>()
                .HasKey(g => new { g.Id, g.UserId });
        }
    }
}
