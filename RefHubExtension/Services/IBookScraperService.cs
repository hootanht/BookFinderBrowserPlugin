public interface IBookScraperService
{
    Task<SearchResponse> SearchBooksAsync(string query, int page);
} 