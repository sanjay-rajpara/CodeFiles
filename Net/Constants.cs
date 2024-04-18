namespace LAMT.Repository.Helper
{
    /// <summary>
    /// Constants
    /// </summary>
    public class Constants
    {
        //facility billing
        public const string GetFacilityBilling = "dbo.usp_Get_Billing_Facility";
        public const string GetCurrentMonthFacilityBillings = "dbo.usp_Get_Billing_Facility_Current_Month";
        public const string SaveBillingFacility = "dbo.usp_Save_Billing_Facility";
        public const string GetFacilityBillingDetailsById = "dbo.usp_Get_FacilityInvoice_Details";
        public const string GetBillingFacilityList = "dbo.usp_Get_FacilityBillingList";

        // Review Billing
        public const string GetReviewLegList = "dbo.usp_Get_Billing_Review";

        //provider section
        public const string GetProviderBilling = "dbo.usp_Get_Billing_Provider";
        public const string GetCurrentMonthProviderBilling = "dbo.usp_Get_Billing_Provider_Current_Month";
        public const string SaveBillingProvider = "dbo.usp_Save_Billing_Provider";
        public const string GetBillingProviderList = "dbo.usp_Get_ProviderBillingList";
        public const string GetProviderBillingDetailsById = "dbo.usp_Get_ProviderInvoice_Details";
        public const string GetBillerCounts = "dbo.usp_Get_BillerCounts";

        //provider remit
        public const string GetProviderRemitOrderLegs = "dbo.usp_Get_ProviderRemitOrderLegs";
        public const string GetProviderRemit = "dbo.usp_Get_ProviderRemit";
        public const string GetProviderRefundTransactions = "dbo.usp_Get_ProviderRefundTransactions";
        public const string GetBillingInsuranceDenialsList = "dbo.usp_Get_InsuranceDenial";
        public const string GetProviderRemitDetails = "dbo.usp_GetProviderRemitDetails";
        public const string GetProviderForRemitOrderLegs = "dbo.usp_Get_RemitProviders";
        public const string GetProviderRemitSummary = "dbo.usp_Get_ProviderRemitSummary";
        public const string GetProviderCreditChecks = "dbo.usp_Get_ProviderCreditChecks";
        public const string GetProviderInvoiceReceiptList = "dbo.usp_Get_ProviderReceiptList";
        public const string GetProviderRemitAppliedInvoicesDetails = "dbo.usp_Get_ProviderRemitAppliedInvoicesDetails";

        //private pay
        public const string GetPrivateTripList = "dbo.usp_Get_PrivateTripList";
        public const string GetInsuranceTripList = "dbo.usp_Get_InsuranceTripList";
        public const string GetPrivateTripDetailById = "dbo.usp_Get_PrivateTripDetailById";
        public const string GetInsuranceTripDetailById = "dbo.usp_Get_InsuranceTripDetailById";

        //Listing Sp for master
        public const string GetDispatchOrderLegList = "dbo.usp_Get_DispatchOrderLegList";
        public const string GetFacilityList = "dbo.usp_Get_Facility_List";
        public const string GetNotesList = "dbo.usp_Get_Notes_List";
        public const string GetDispatchOrderTransactionList = "dbo.usp_Get_DispatchOrderTransactionList";
        public const string GetPatientList = "dbo.usp_Get_Patient_List";
        public const string GetPatientInsuranceList = "dbo.usp_Get_PatientInsurance_List";
        public const string GetBillerProcessingList = "dbo.usp_Get_BillerProcessingList";
        public const string GetPreAuthList = "[dbo].[usp_Get_PreAuthList]";
        public const string GetFollowUpList = "[dbo].[usp_Get_FollowUpList]";
        public const string GetBillingSearch = "dbo.usp_Get_BillingSearch";
        public const string GetRoleList = "dbo.usp_Get_Role_List";
        public const string GetMedicalProviderList = "dbo.usp_Get_MedicalProvider_List";
        public const string GetProviderList = "dbo.usp_Get_Provider_List";
        public const string GetPatientTripList = "dbo.usp_Get_PatientTrip_List";

        public const string GetAllPatientInsuranceList = "dbo.usp_Get_AllPatientInsuranceList";
        public const string GetSelectedProviderListForProviderSelection = "dbo.usp_Get_SelectedProviderList";
        public const string GetTripDetails = "dbo.usp_Get_TripDetails";
        public const string GetDashboardLegCount = "dbo.usp_GetDashboardLegCount";
        public const string ConfirmTrip = "dbo.usp_ConfirmTrip";
        public const string GetProviderMissingRates = "dbo.usp_Get_ProviderMissingRates";

        public const string CreateDisptachOrderRecurringLegs = "dbo.usp_CreateDisptachOrderRecurringLegs";
        public const string CreateDisptachOrderFromTemplateId = "dbo.usp_CreateDisptachOrderFromTemplateId";
        public const string UpdateTripRate = "dbo.usp_UpdateTripRate";
        public const string GetDispatchOrderLegRate = "dbo.usp_Get_DispatchOrderLegRate";
        public const string UpdateProviderOnTripDetailsChange = "dbo.usp_UpdateProviderOnTripDetailsChange";
        public const string GetTripDetailForProviderConfirmationMail = "dbo.usp_GetTripDetailForProviderConfirmationMail";

        public const string GetBidHistory = "dbo.usp_Get_BidHistory";
        public const string GetSearchFacility = "usp_get_SearchFacility";
        public const string GetSearchTripFacility = "usp_get_SearchTripFacility";
        public const string GetCallHistory = "dbo.usp_Get_CallHistory";
        public const string GetDispatchOrderLegAdditionalFees = "dbo.usp_Get_DispatchOrderLegAdditionalFees";
        public const string UpdateTripAdditionalFees = "dbo.usp_UpdateTripAdditionalFees";

        public const string CheckIsTripEditAllow = "dbo.fn_IsTripEditAllow";
        public const string NeedsCorrectionList = "usp_Get_DispatchOrderLegList_NeedsCorrection";

        public const string GetInsuranceCarrierList = "dbo.usp_Get_InsuranceCarrierList";

        public const string GetRemainingDataForPreAuth = "dbo.usp_Get_RemainingDataForPreAuthTripDocument";
        public const string GetInquiryRates = "dbo.usp_Get_RatesFromExpandedDetails";
        public const string GetDeletedCreditCardTransactions = "dbo.usp_Get_DeletedCreditCardTransactions";

        public const string Report_GetFacilityCallLogs = "[dbo].[usp_Get_Facility_Call_Logs]";
        public const string Report_GetMonthlyRevenue = "[dbo].[usp_Get_Monthly_Revenue]";

        public const string GetRateRevisions = "dbo.usp_Get_RateRevisions";
        public const string GetAmbulanceFees = "dbo.usp_Get_AmbulanceFees";

        public const string GetProviderRates = "dbo.usp_Get_ProviderRates";
        public const string GetRates = "dbo.usp_Get_Rates";

        public const string GetProviderNotifications = "[dbo].[usp_Get_ProviderNotification_List]";
    }
}
