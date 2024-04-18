using System;
using System.Collections.Generic;

namespace LAMT.Data
{
    public partial class AmbulancePreschedule
    {
        public long Id { get; set; }
        public string Locality { get; set; }
        public string Hcpcs { get; set; }
        public decimal? Rvu { get; set; }
        public decimal? BaseRate { get; set; }
        public decimal? RatePerMile { get; set; }
    }
}
