using System.Text.Json;
using System.Text.Json.Serialization;

namespace Finance.Tracker.Presentation.Helpers
{
    public class JsonObjectResult<T>
    {
        public JsonObjectResult()
        {
            Status = 200;
            Errors = [];
        }

        public JsonObjectResult(int status)
        {
            Status = status;
            Errors = [];
        }

        [JsonPropertyName("errors")]
        public List<string?>? Errors { get; set; }

        [JsonPropertyName("status")]
        public int Status { get; set; }

        [JsonPropertyName("data")]
        public T? Data { get; set; }

        public override string ToString() => JsonSerializer.Serialize(this);
    }
}
