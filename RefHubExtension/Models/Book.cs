public class Book
{
    public string Title { get; set; }
    public string ImageUrl { get; set; }
    public string Year { get; set; }
    public string Description { get; set; }
    public string SkillLevel { get; set; }
    public string Category { get; set; }
    public string Language { get; set; }
    public List<string> Tags { get; set; }
    public bool IsFeatured { get; set; }
    public string Url { get; set; }
}

public class SearchResponse
{
    public Pagination Pagination { get; set; }
    public List<Book> Books { get; set; }
    public int TotalResults { get; set; }
}

public class Pagination
{
    public int CurrentPage { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
} 