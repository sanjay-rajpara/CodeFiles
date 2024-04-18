using Microsoft.AspNetCore.Http;

namespace LAMT.Model
{
    /// <summary>
    /// Ambulance Fee Model
    /// </summary>
    public class AmbulanceFeeModel
    {
        public long? Id { get; set; }
        public string Locality { get; set; }
        public string HCPCS { get; set; }
        public decimal? RVU { get; set; }
        public decimal? FlatRate { get; set; }
        public decimal? BaseRate { get; set; }
        public int? Year { get; set; }
    }

    /// <summary>
    /// Ambulance Fee List Model
    /// </summary>
    public class AmbulanceFeeListModel
    {
        public long? Id { get; set; }
        public string Locality { get; set; }
        public string Zipcode { get; set; }
        public string State { get; set; }
        public string HCPCS { get; set; }
        public decimal? BaseRate { get; set; }
        public int? Year { get; set; }
        public string Description { get; set; }
    }

    /// <summary>
    /// Ambulance Fee Filter Model
    /// </summary>
    public class AmbulanceFeeFilterModel
    {
        public string HCPCS { get; set; }
        public string Zipcode { get; set; }
        public int? Year { get; set; }
        public string State { get; set; }
    }

    /// <summary>
    /// Ambulance Fee Import Model
    /// </summary>
    public class AmbulanceFeeImportModel
    {
        public IFormFile File { get; set; }
        public int? Year { get; set; }
       
    }

}
