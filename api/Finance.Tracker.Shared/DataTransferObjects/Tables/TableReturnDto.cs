using System.Text.Json.Serialization;

namespace Finance.Tracker.Shared.DataTransferObjects.Tables;

public class TableReturnDto<T>
{
    [JsonPropertyName("list")]
    public T? List { get; set; }

    [JsonPropertyName("pagination")]
    public PaginationReturnDto? Pagination { get; set; }
}