namespace Finance.Tracker.Shared.DataTransferObjects.SiteSettings
{
    public class SiteSettingsDto
    {
        public string SiteName { get; set; } = "Finance Tracker";
        public string Slogan { get; set; } = "Controla tus finanzas, transforma tu futuro.";
        public string LoginSubtitle { get; set; } = "Registra ingresos, gastos y presupuestos en un solo lugar, con claridad total.";
        public string Feature1Title { get; set; } = "Análisis visual";
        public string Feature1Desc { get; set; } = "Gráficas claras de tus movimientos diarios";
        public string Feature2Title { get; set; } = "Presupuesto inteligente";
        public string Feature2Desc { get; set; } = "Define límites por categoría y evita sobregastos";
        public string Feature3Title { get; set; } = "Datos seguros";
        public string Feature3Desc { get; set; } = "Autenticación JWT, tus datos solo son tuyos";
    }
}
