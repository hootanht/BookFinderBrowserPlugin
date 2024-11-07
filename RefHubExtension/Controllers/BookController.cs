using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Cors;
using System;
using System.Collections.Generic;
using System.Linq;
namespace RefHubExtension.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [EnableCors("AllowAll")]
    public class BookController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public BookController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        /// <summary>
        /// Searches for books on RefHub.ir
        /// </summary>
        /// <param name="query">The search term for finding books</param>
        /// <param name="page">The page number to fetch</param>
        /// <returns>A list of books matching the search criteria</returns>
        /// <response code="200">Returns the list of found books</response>
        /// <response code="400">If the query is invalid or the request fails</response>
        [HttpGet("search")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SearchBooks(string? query, int page = 1)
        {
            try
            {
                var baseUrl = "https://refhub.ir/fa/search/";
                var searchUrl = string.IsNullOrEmpty(query) 
                    ? $"{baseUrl}?page={page}"
                    : $"{baseUrl}?page={page}&query={Uri.EscapeDataString(query)}";

                var response = await _httpClient.GetAsync(searchUrl);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var doc = new HtmlDocument();
                doc.LoadHtml(content);

                // Parse book cards
                var bookCards = doc.DocumentNode.SelectNodes("//div[contains(@class, 'col-sm-6 col-lg-3 col-xl-3')]");
                var books = new List<object>();

                if (bookCards != null)
                {
                    foreach (var card in bookCards)
                    {
                        var titleNode = card.SelectSingleNode(".//img[@class='card-img-top']");
                        var yearNode = card.SelectSingleNode(".//span[@class='badge text-bg-primary float-start']");
                        var descriptionNode = card.SelectSingleNode(".//p[@class='card-text']");
                        var skillLevelNode = card.SelectSingleNode(".//span[contains(@class, 'badge bg-purple')]");
                        var categoryNode = card.SelectSingleNode(".//span[contains(@class, 'badge bg-blue')]");
                        var languageNode = card.SelectSingleNode(".//span[contains(@class, 'badge bg-primary-subtle')]");
                        var tagsNodes = card.SelectNodes(".//span[contains(@class, 'badge bg-blue bg-opacity-10 text-blue col')]");
                        var urlNode = card.SelectSingleNode(".//a[@class='text-decoration-none']");

                        var book = new
                        {
                            title = titleNode?.GetAttributeValue("alt", "").Trim(),
                            imageUrl = titleNode?.GetAttributeValue("src", "").Trim(),
                            year = yearNode?.InnerText.Replace("Published on:", "").Trim(),
                            description = descriptionNode?.InnerText.Trim(),
                            skillLevel = skillLevelNode?.InnerText.Trim(),
                            category = categoryNode?.InnerText.Trim(),
                            language = languageNode?.InnerText.Trim(),
                            tags = tagsNodes?.Select(t => t.InnerText.Trim()).ToList() ?? new List<string>(),
                            isFeatured = card.SelectSingleNode(".//div[@class='ribbon']") != null,
                            url = urlNode?.GetAttributeValue("href", "").Trim()
                        };

                        books.Add(book);
                    }
                }

                // Parse pagination info
                var paginationText = doc.DocumentNode.SelectSingleNode("//span[contains(text(), 'Page')]")?.InnerText;
                var totalPages = 1;
                var currentPage = page;
                
                if (paginationText != null)
                {
                    var match = System.Text.RegularExpressions.Regex.Match(paginationText, @"Page (\d+) of (\d+)");
                    if (match.Success)
                    {
                        currentPage = int.Parse(match.Groups[1].Value);
                        totalPages = int.Parse(match.Groups[2].Value);
                    }
                }

                // Check if we need to fetch more pages
                var hasNextPage = currentPage < totalPages;
                var hasPreviousPage = currentPage > 1;

                // Add delay between requests to be respectful to the server
                await Task.Delay(TimeSpan.FromMilliseconds(500));

                return Ok(new
                {
                    query,
                    searchUrl,
                    pagination = new
                    {
                        currentPage,
                        totalPages,
                        hasNextPage,
                        hasPreviousPage
                    },
                    books,
                    totalResults = books.Count
                });
            }
            catch (HttpRequestException ex)
            {
                return BadRequest($"Failed to fetch data from RefHub: {ex.Message}");
            }
            catch (Exception ex)
            {
                return BadRequest($"An error occurred: {ex.Message}");
            }
        }

        // Optional: Add a method to fetch all pages (use with caution)
        private async Task<List<object>> FetchAllPages(string query)
        {
            var allBooks = new List<object>();
            var page = 1;
            var hasMorePages = true;

            while (hasMorePages)
            {
                var baseUrl = "https://refhub.ir/fa/search/";
                var searchUrl = string.IsNullOrEmpty(query) 
                    ? $"{baseUrl}?page={page}"
                    : $"{baseUrl}?page={page}&query={Uri.EscapeDataString(query)}";

                var response = await _httpClient.GetAsync(searchUrl);
                if (!response.IsSuccessStatusCode)
                    break;

                var content = await response.Content.ReadAsStringAsync();
                var doc = new HtmlDocument();
                doc.LoadHtml(content);

                var bookCards = doc.DocumentNode.SelectNodes("//div[contains(@class, 'col-sm-6 col-lg-3 col-xl-3')]");
                if (bookCards == null || !bookCards.Any())
                {
                    hasMorePages = false;
                    continue;
                }

                // Parse books and add to collection
                foreach (var card in bookCards)
                {
                    var titleNode = card.SelectSingleNode(".//img[@class='card-img-top']");
                    var yearNode = card.SelectSingleNode(".//span[@class='badge text-bg-primary float-start']");
                    var descriptionNode = card.SelectSingleNode(".//p[@class='card-text']");
                    var skillLevelNode = card.SelectSingleNode(".//span[contains(@class, 'badge bg-purple')]");
                    var categoryNode = card.SelectSingleNode(".//span[contains(@class, 'badge bg-blue')]");
                    var languageNode = card.SelectSingleNode(".//span[contains(@class, 'badge bg-primary-subtle')]");
                    var tagsNodes = card.SelectNodes(".//span[contains(@class, 'badge bg-blue bg-opacity-10 text-blue col')]");
                    var urlNode = card.SelectSingleNode(".//a[@class='text-decoration-none']");

                    var book = new
                    {
                        title = titleNode?.GetAttributeValue("alt", "").Trim(),
                        imageUrl = titleNode?.GetAttributeValue("src", "").Trim(),
                        year = yearNode?.InnerText.Replace("Published on:", "").Trim(),
                        description = descriptionNode?.InnerText.Trim(),
                        skillLevel = skillLevelNode?.InnerText.Trim(),
                        category = categoryNode?.InnerText.Trim(),
                        language = languageNode?.InnerText.Trim(),
                        tags = tagsNodes?.Select(t => t.InnerText.Trim()).ToList() ?? new List<string>(),
                        isFeatured = card.SelectSingleNode(".//div[@class='ribbon']") != null,
                        url = urlNode?.GetAttributeValue("href", "").Trim()
                    };

                    allBooks.Add(book);
                }

                // Check pagination
                var paginationText = doc.DocumentNode.SelectSingleNode("//span[contains(text(), 'Page')]")?.InnerText;
                if (paginationText != null)
                {
                    var match = System.Text.RegularExpressions.Regex.Match(paginationText, @"Page (\d+) of (\d+)");
                    if (match.Success)
                    {
                        var currentPage = int.Parse(match.Groups[1].Value);
                        var totalPages = int.Parse(match.Groups[2].Value);
                        hasMorePages = currentPage < totalPages;
                    }
                }

                page++;
                // Add delay between requests
                await Task.Delay(TimeSpan.FromMilliseconds(500));
            }

            return allBooks;
        }
    }
}