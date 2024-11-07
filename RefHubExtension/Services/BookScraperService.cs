using HtmlAgilityPack;
using Microsoft.Extensions.Logging;
using RefHubExtension.Models;
using RefHubExtension.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace RefHubExtension.Services
{
    public class BookScraperService : IBookScraperService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<BookScraperService> _logger;
        private const string BaseUrl = "https://refhub.ir/fa/search/";

        public BookScraperService(HttpClient httpClient, ILogger<BookScraperService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<SearchResponse> SearchBooksAsync(string query, int page)
        {
            try
            {
                var searchUrl = BuildSearchUrl(query, page);
                var doc = await FetchAndParseHtmlAsync(searchUrl);
                
                var books = ParseBooks(doc);
                var pagination = ParsePagination(doc, page);

                return new SearchResponse
                {
                    Books = books,
                    Pagination = pagination,
                    TotalResults = books.Count
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching books for query: {Query}, page: {Page}", query, page);
                throw;
            }
        }

        private string BuildSearchUrl(string query, int page)
        {
            return string.IsNullOrEmpty(query)
                ? $"{BaseUrl}?page={page}"
                : $"{BaseUrl}?page={page}&query={Uri.EscapeDataString(query)}";
        }

        private async Task<HtmlDocument> FetchAndParseHtmlAsync(string url)
        {
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            
            var content = await response.Content.ReadAsStringAsync();
            var doc = new HtmlDocument();
            doc.LoadHtml(content);
            return doc;
        }

        private List<Book> ParseBooks(HtmlDocument doc)
        {
            var books = new List<Book>();
            var bookCards = doc.DocumentNode.SelectNodes("//div[contains(@class, 'col-sm-6 col-lg-3 col-xl-3')]");

            if (bookCards == null) return books;

            foreach (var card in bookCards)
            {
                var book = ParseBookCard(card);
                if (book != null)
                {
                    books.Add(book);
                }
            }

            return books;
        }

        private Book ParseBookCard(HtmlNode card)
        {
            var titleNode = card.SelectSingleNode(".//img[@class='card-img-top']");
            var yearNode = card.SelectSingleNode(".//span[@class='badge text-bg-primary float-start']");
            var descriptionNode = card.SelectSingleNode(".//p[@class='card-text']");
            var skillLevelNode = card.SelectSingleNode(".//span[contains(@class, 'badge bg-purple')]");
            var categoryNode = card.SelectSingleNode(".//span[contains(@class, 'badge bg-blue')]");
            var languageNode = card.SelectSingleNode(".//span[contains(@class, 'badge bg-primary-subtle')]");
            var tagsNodes = card.SelectNodes(".//span[contains(@class, 'badge bg-blue bg-opacity-10 text-blue col')]");
            var urlNode = card.SelectSingleNode(".//a[@class='text-decoration-none']");

            return new Book
            {
                Title = titleNode?.GetAttributeValue("alt", "").Trim(),
                ImageUrl = titleNode?.GetAttributeValue("src", "").Trim(),
                Year = yearNode?.InnerText.Replace("Published on:", "").Trim(),
                Description = descriptionNode?.InnerText.Trim(),
                SkillLevel = skillLevelNode?.InnerText.Trim(),
                Category = categoryNode?.InnerText.Trim(),
                Language = languageNode?.InnerText.Trim(),
                Tags = tagsNodes?.Select(t => t.InnerText.Trim()).ToList() ?? new List<string>(),
                IsFeatured = card.SelectSingleNode(".//div[@class='ribbon']") != null,
                Url = urlNode?.GetAttributeValue("href", "").Trim()
            };
        }

        private Pagination ParsePagination(HtmlDocument doc, int currentPage)
        {
            var paginationText = doc.DocumentNode.SelectSingleNode("//span[contains(text(), 'Page')]")?.InnerText;
            var totalPages = 1;
            
            if (paginationText != null)
            {
                var match = System.Text.RegularExpressions.Regex.Match(paginationText, @"Page (\d+) of (\d+)");
                if (match.Success)
                {
                    currentPage = int.Parse(match.Groups[1].Value);
                    totalPages = int.Parse(match.Groups[2].Value);
                }
            }

            return new Pagination
            {
                CurrentPage = currentPage,
                TotalPages = totalPages,
                HasNextPage = currentPage < totalPages,
                HasPreviousPage = currentPage > 1
            };
        }
    }
} 