using Finance.Tracker.API.Extensions;
using Finance.Tracker.Shared.Helpers;

DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

IOHelper.CreateDirectory(Path.Combine("wwwroot"));

builder.Services.AddControllers(config =>
{
    config.RespectBrowserAcceptHeader = true;
    config.ReturnHttpNotAcceptable = true;
})
.AddXmlDataContractSerializerFormatters()
.AddApplicationPart(typeof(Finance.Tracker.Presentation.AssemblyReference).Assembly);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

ConfigurationManager configuration = builder.Configuration;

builder.Services.ConfigureCors(configuration);
builder.Services.ConfigureJwtAuthentication(configuration);
builder.Services.ConfigureRepositoryManager();
builder.Services.ConfigureServiceManager();
builder.Services.ConfigurePostgresContext(configuration);
builder.Services.ConfigureTransversalValue();
builder.Services.ConfigureDbSeed();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("FINANCE_TRACKER_CORS");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
