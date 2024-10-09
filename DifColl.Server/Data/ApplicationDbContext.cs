using DifColl.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace DifColl.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<Book> Books { get; set; }
    }
}
