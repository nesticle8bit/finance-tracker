using Finance.Tracker.Shared.DataTransferObjects.Pagination;

namespace Finance.Tracker.Shared.Extensions
{
    public static class QueryParametersExtensions
    {
        public static bool HasPrevious(this QueryParameters queryParameters) =>
            (queryParameters.Page > 1);

        public static bool HasNext(this QueryParameters queryParameters, int totalCount) =>
            (queryParameters.Page < (int)GetTotalPages(queryParameters, totalCount));

        public static double GetTotalPages(this QueryParameters queryParameters, long totalCount) =>
            Math.Ceiling(totalCount / (double)queryParameters.PageCount);

        public static bool HasQuery(this QueryParameters queryParameters) =>
            !string.IsNullOrEmpty(queryParameters.Query);

        public static bool IsDescending(this QueryParameters queryParameters)
        {
            if (!string.IsNullOrEmpty(queryParameters.OrderBy))
                return queryParameters.OrderBy.Split(' ').Last().ToLowerInvariant().StartsWith("desc");

            return false;
        }
    }
}
