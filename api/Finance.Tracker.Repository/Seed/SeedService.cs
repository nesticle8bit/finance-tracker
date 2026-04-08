using Finance.Tracker.Entities.Finance;
using Finance.Tracker.Entities.Parameters;

namespace Finance.Tracker.Repository.Seed
{
    public class SeedService(RepositoryContext db)
    {
        private static readonly List<(string Name, string Icon, string Color, string Type)> Defaults =
        [
            ("Restaurante",     "restaurant",    "#f97316", "expense"),
            ("Esenciales",      "home",          "#3b82f6", "expense"),
            ("Transporte",      "directions_car","#8b5cf6", "expense"),
            ("Salud",           "local_hospital","#ef4444", "expense"),
            ("Entretenimiento", "movie",         "#ec4899", "expense"),
            ("Compras",         "shopping_bag",  "#f59e0b", "expense"),
            ("Educación",       "school",        "#06b6d4", "expense"),
            ("Salario",         "payments",      "#22c55e", "income"),
            ("Freelance",       "work",          "#14b8a6", "income"),
            ("Otros",           "more_horiz",    "#6b7280", "both"),
        ];

        public async Task SeedUserCategories(Guid userId)
        {
            var cats = Defaults.Select(d => new Category
            {
                UserId = userId,
                Name = d.Name,
                Icon = d.Icon,
                Color = d.Color,
                Type = d.Type,
                IsDefault = true,
            }).ToList();

            db.Categories.AddRange(cats);
            db.BudgetConfigs.Add(new BudgetConfig { UserId = userId });

            await db.SaveChangesAsync();
        }
    }
}
