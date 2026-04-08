namespace Finance.Tracker.Shared.Helpers
{
    public static class IOHelper
    {
        public static void CreateDirectory(string path)
        {
            if (!Directory.Exists(path)) Directory.CreateDirectory(path);
        }
    }
}
