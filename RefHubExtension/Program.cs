using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Cors;
using Swashbuckle.AspNetCore.SwaggerUI;
using RefHubExtension.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Add Swagger services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "RefHub Book Finder API",
        Version = "v1",
        Description = "An API to search books on RefHub.ir",
        Contact = new OpenApiContact
        {
            Name = "Your Name",
            Email = "your.email@example.com"
        }
    });
});

// Update CORS policy to be more permissive for development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddHttpClient();

// Move the service registration BEFORE var app = builder.Build();
builder.Services.AddScoped<IBookScraperService, BookScraperService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "RefHub Book Finder API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
// Important: Place UseCors before other middleware that might use routing
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();