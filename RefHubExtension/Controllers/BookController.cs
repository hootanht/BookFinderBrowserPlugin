using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Cors;
using System;
using System.Collections.Generic;
using System.Linq;
using RefHubExtension.Models;
using RefHubExtension.Services;
namespace RefHubExtension.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [EnableCors("AllowAll")]
    public class BookController : ControllerBase
    {
        private readonly IBookScraperService _bookScraperService;
        private readonly ILogger<BookController> _logger;

        public BookController(IBookScraperService bookScraperService, ILogger<BookController> logger)
        {
            _bookScraperService = bookScraperService;
            _logger = logger;
        }

        /// <summary>
        /// Searches for books on RefHub.ir
        /// </summary>
        /// <param name="query">The search term for finding books</param>
        /// <param name="page">The page number to fetch (defaults to 1)</param>
        /// <returns>A SearchResponse containing books and pagination information</returns>
        /// <response code="200">Returns the search results</response>
        /// <response code="400">If the request fails</response>
        /// <response code="500">If there's a server error</response>
        [HttpGet("search")]
        [ProducesResponseType(typeof(SearchResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<SearchResponse>> SearchBooks(
            [FromQuery] string? query,
            [FromQuery] int page = 1)
        {
            try
            {
                var result = await _bookScraperService.SearchBooksAsync(query, page);
                return Ok(result);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Failed to fetch data from RefHub");
                return BadRequest($"Failed to fetch data from RefHub: {ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unexpected error occurred");
                return StatusCode(500, "An unexpected error occurred");
            }
        }
    }
}