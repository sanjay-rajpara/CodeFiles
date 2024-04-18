using System;
using System.Collections.Generic;
using System.Text;

namespace LAMT.Entity
{
    /// <summary>
    /// It contains properties of dispatch order entity.
    /// </summary>
    public class DispatchOrder : BaseEntity
    {
        public long Id { get; set; }
        public long FacilityId { get; set; }
        public string CallerName { get; set; }
        public string CallerPhone { get; set; }
        public long PatientId { get; set; }
        public string PTDX { get; set; }
        public bool IsSTAT { get; set; }
        public int RecurringType { get; set; }
        public string RecurringDay { get; set; }
        public int RecurringUntil { get; set; }
        public int NoofRecurrences { get; set; }
        public DateTime? EndDate { get; set; }
        public string BillingNote { get; set; }
        public string ProviderNote { get; set; }
        public string File1 { get; set; }
        public string File2 { get; set; }
    }
}
