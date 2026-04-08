using System.Text.Json.Serialization;

namespace Finance.Tracker.Shared.DataTransferObjects.Tables;

public class PaginationReturnDto
{
    [JsonPropertyName("totalCount")]
    public int? TotalCount { get; set; }

    [JsonPropertyName("pageSize")]
    public int PageSize { get; set; }

    [JsonPropertyName("currentPage")]
    public int CurrentPage { get; set; }

    [JsonPropertyName("totalPages")]
    public double TotalPages { get; set; }
}