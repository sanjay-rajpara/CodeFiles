using LAMT.Data;
using LAMT.Model;
using LAMT.Repository.Contract;
using LAMT.Service.Contract;
using LAMT.Utility.Helper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LAMT.Service.Implementation
{
    /// <summary>
    /// Add Transport Service
    /// </summary>
    /// <seealso cref="LAMT.Service.Contract.IAddTransportService" />
    public class AddTransportService : IAddTransportService
    {
        private readonly LAMTContext _context;
        private readonly IDispatchOrderLegService _dispatchOrderLegService;
        private readonly IDispatchOrderService _dispatchOrderService;
        private readonly IDispatchOrderLegRepository _dispatchOrderLegRepository;
        private readonly IServiceProvider _serviceProvider;

        /// <summary>
        /// Initializes a new instance of the <see cref="AddTransportService"/> class.
        /// </summary>
        /// <param name="context">The context.</param>
        /// <param name="dispatchOrderLegService">The dispatch order leg service.</param>
        /// <param name="dispatchOrderService">The dispatch order service.</param>
        public AddTransportService(
            LAMTContext context
            , IDispatchOrderLegService dispatchOrderLegService
            , IDispatchOrderService dispatchOrderService
            , IDispatchOrderLegRepository dispatchOrderLegRepository
            , IServiceProvider serviceProvider)
        {
            _context = context;
            _dispatchOrderLegService = dispatchOrderLegService;
            _dispatchOrderService = dispatchOrderService;
            _dispatchOrderLegRepository = dispatchOrderLegRepository;
            _serviceProvider = serviceProvider;
        }
        /// <summary>
        /// Updates all.
        /// </summary>
        /// <param name="model">The model.</param>
        /// <param name="enquiryId">The enquiry identifier.</param>
        /// <returns></returns>
        public async Task<EditTransportAll> UpdateAll(EditTransportAll model, long? enquiryId = 0)
        {

            model.DispatchOrder.DispatchOrderLeg = null;
            var dispatchOrder = _dispatchOrderService.Update(model.DispatchOrder);

            model.DispatchOrder = dispatchOrder;

            for (var i = 0; i < model.DispatchOrderLegs?.Count(); i++)
            {
                var orderleg = model.DispatchOrderLegs[i];
                orderleg.DispatchOrderId = dispatchOrder.Id;
                model.DispatchOrderLegs[i] = await _dispatchOrderLegService.UpdateAsync(orderleg, true, enquiryId);
            }

            // Update stripe charge if additonalcharge value updated 
            var dispatchOrderLeg = model.DispatchOrderLegs
                .Where(x => x.IsReturnTrip == false && x.IsRoundTrip == false && (x.Status == (byte)Status.InComplete || x.Status == (byte)Status.Assigned)
                && x.DispatchOrderTransaction.Any(y => y.TransactionType == (byte)PaymentType.CreditCard
                && y.PaymentStatus == (byte)PaymentStatus.Unpaid && y.Status == (byte)Status.Active)).FirstOrDefault();

            if (dispatchOrderLeg != null && dispatchOrderLeg.Id > 0)
            {
                ManageStripeChargeAfterTripUpdate(model.DispatchOrderLegs.Select(x => x.Id).ToList());
            }

            return model;
        }

        private void ManageStripeChargeAfterTripUpdate(List<long> legIds)
        {
            decimal TripAmount = 0;
            decimal Wco2Amount = 0;
            decimal AfterHourFee = 0;
            decimal HolidayFee = 0;
            decimal FacilityAdditionalFee = 0;
            decimal TotalAmount = 0;
            DispatchOrderLeg firstLeg = new DispatchOrderLeg();

            if (legIds.Count > 1)
            {
                // Round trips
                var trips = _context.DispatchOrderLeg.Where(x => legIds.Contains(x.Id)).ToList();

                trips.ForEach(x =>
                {
                    TripAmount += (x.TripAmount != null ? Convert.ToDecimal(x.TripAmount) : 0);
                    Wco2Amount += (x.Wco2amount != null ? Convert.ToDecimal(x.Wco2amount) : 0);
                    AfterHourFee += (x.AfterHourFee != null ? Convert.ToDecimal(x.AfterHourFee) : 0);
                    HolidayFee += (x.HolidayFee != null ? Convert.ToDecimal(x.HolidayFee) : 0);
                    FacilityAdditionalFee += (x.FacilityAdditionalFee != null ? Convert.ToDecimal(x.FacilityAdditionalFee) : 0);
                });

                firstLeg = trips.Where(x => x.IsReturnTrip == false).FirstOrDefault();

            }
            else
            {
                // Oneway trips
                firstLeg = _context.DispatchOrderLeg.Where(x => x.Id.Equals(legIds.First())).FirstOrDefault();

                TripAmount = (firstLeg.TripAmount != null ? Convert.ToDecimal(firstLeg.TripAmount) : 0);
                Wco2Amount = (firstLeg.Wco2amount != null ? Convert.ToDecimal(firstLeg.Wco2amount) : 0);
                AfterHourFee = (firstLeg.AfterHourFee != null ? Convert.ToDecimal(firstLeg.AfterHourFee) : 0);
                HolidayFee = (firstLeg.HolidayFee != null ? Convert.ToDecimal(firstLeg.HolidayFee) : 0);
                FacilityAdditionalFee = (firstLeg.FacilityAdditionalFee != null ? Convert.ToDecimal(firstLeg.FacilityAdditionalFee) : 0);
            }

            if (firstLeg.BillingType == (byte)BillingType.LongDistance)
                return;

            TotalAmount = TripAmount + Wco2Amount + AfterHourFee + HolidayFee + FacilityAdditionalFee;

            if (firstLeg.IsWillCall == true)
            {
                var waitingCharge = _dispatchOrderLegRepository.GetWaitingCharge(firstLeg.Id);
                if (waitingCharge > 0)
                    TotalAmount += waitingCharge;
            }

            var transaction = _context.DispatchOrderTransaction.Where(x => x.TransactionType == (byte)PaymentType.CreditCard && x.CreditCardId != null && x.DispatchOrderLegId == firstLeg.Id).FirstOrDefault();

            if (transaction != null)
            {
                var _paymentGatewayService = _serviceProvider.GetRequiredService<IPaymentGatewayService>();

                if (!string.IsNullOrEmpty(transaction.StripePaymentChargeId))
                {
                    var oldChargeAmount = _paymentGatewayService.GetChargeAmount(transaction.StripePaymentChargeId);
                    var newChargeAmount = _paymentGatewayService.CalculateChargeAmount(TotalAmount);

                    if (oldChargeAmount != newChargeAmount)
                    {
                        _paymentGatewayService.StripeRefund(transaction);

                        _context.SaveChanges();

                        _paymentGatewayService.ChargeRevisedTripAmount(firstLeg.Id, transaction.Amount.Value, TotalAmount, transaction.CreditCardId.Value);

                        _context.SaveChanges();
                    }
                }
            }
        }

        /// <summary>
        /// Updates the facility model.
        /// </summary>
        /// <param name="model">The model.</param>
        /// <returns></returns>
        public TripFacilityViewModel UpdateFacilityModel(TripDetails model)
        {
            var zipCode = model.MedicalProviderLocation[0].ServiceLocation.Zipcode;
            var isExistAsMedicalProvider = false;
            if (model.Id == 0)
            {
                isExistAsMedicalProvider = MedicalProviderIsExist(model);
            }

            var isExist = FacilityIsExist(model, true);

            if (isExist || isExistAsMedicalProvider)
            {
                return null;
            }

            var facility = _context.Facility
                .Include(x => x.FacilityLocation)
                    .ThenInclude(x => x.ServiceLocation)
                .FirstOrDefault(x => x.Id == model.Id);

            var entity = new Facility();

            if (facility != null)
            {
                facility.Name = model.ProviderName;
                facility.Phone = model.Phone;

                var serviceLocation = model.MedicalProviderLocation[0].ServiceLocation.ToType<ServiceLocation>();
                var location = facility.FacilityLocation.FirstOrDefault(x => x.LocationType == ServiceLocationType.Physical && x.Status != (byte)Status.Deleted);
                if (location != null)
                {
                    #region update location
                    if (location.ServiceLocation is null || location.ServiceLocation.Status == (byte)Status.Deleted)
                    {
                        serviceLocation.Status = (byte)Status.Active;
                        location.ServiceLocation = serviceLocation;
                        location.SuiteRoomNo = model.MedicalProviderLocation[0].SuiteRoomNo;
                        location.ServiceLocation.Country = "USA";
                        _context.Add(location.ServiceLocation);
                    }
                    else
                    {
                        location.ServiceLocation.AddressLine1 = serviceLocation.AddressLine1;
                        location.ServiceLocation.AddressLine2 = serviceLocation.AddressLine2;
                        location.ServiceLocation.AddressLine3 = serviceLocation.AddressLine3;
                        location.ServiceLocation.AddressLine4 = serviceLocation.AddressLine4;
                        location.ServiceLocation.BingMapEntityId = serviceLocation.BingMapEntityId;
                        location.ServiceLocation.City = serviceLocation.City;
                        location.ServiceLocation.Latitude = serviceLocation.Latitude;
                        location.ServiceLocation.Longitude = serviceLocation.Longitude;
                        location.ServiceLocation.StateProvince = serviceLocation.StateProvince;
                        location.ServiceLocation.Zipcode = serviceLocation.Zipcode;
                        location.SuiteRoomNo = model.MedicalProviderLocation[0].SuiteRoomNo;
                    }
                    #endregion
                }
                else
                {
                    location = new FacilityLocation();
                    location.ServiceLocation = serviceLocation;
                    location.SuiteRoomNo = model.MedicalProviderLocation[0].SuiteRoomNo;
                    location.LocationType = ServiceLocationType.Physical;
                    location.ServiceLocation.Status = (byte)Status.Active;
                    location.ServiceLocation.Country = "USA";
                    location.Status = (byte)Status.Active;
                    facility.FacilityLocation.Add(location);
                    _context.Add(serviceLocation);
                }
                _context.Update(facility);
                entity = facility.ToType<Facility>();
            }
            else
            {
                entity.Id = 0;
                entity.Name = model.ProviderName;
                entity.Phone = model.Phone;
                entity.FacilityLocation = new List<FacilityLocation>();
                entity.Status = (byte)Status.Active;

                var facilityType = new FacilityTypeModel();
                if (entity.Name?.Contains("residence", StringComparison.CurrentCultureIgnoreCase) == true)
                {
                    facilityType.PatientResidence = true;
                }
                else
                {
                    facilityType.GeneralAccuteCareHospitals = true;
                }

                entity.FacilityType = JsonConvert.SerializeObject(facilityType);

                var serviceType = new ServiceTypeModel
                {
                    AirFlight = true,
                    AllPurposeChair = true,
                    Ambulance = true,
                    BariatricWheelchairVan = true,
                    MedCar = true,
                    Wheelchair = true
                };

                entity.ServiceType = JsonConvert.SerializeObject(serviceType);

                var location = new FacilityLocation();
                var serviceLocation = model.MedicalProviderLocation[0].ServiceLocation.ToType<ServiceLocation>();
                serviceLocation.Id = 0;
                location.LocationType = ServiceLocationType.Physical;
                location.Status = (byte)Status.Active;

                location.ServiceLocation = serviceLocation;
                location.ServiceLocation.Status = (byte)Status.Active;
                location.ServiceLocation.Country = "USA";

                _context.Add(serviceLocation);
                entity.FacilityLocation.Add(location);
                _context.Add(entity);
            }
            _context.SaveChanges();

            var serviceLocationModel = entity.FacilityLocation.First(x => x.LocationType == ServiceLocationType.Physical && x.Status != (byte)Status.Deleted).ServiceLocation;

            var result = new TripFacilityViewModel()
            {
                FacilityId = entity.Id,
                Name = entity.Name,
                IsFacility = true,
                Phone = entity.Phone,
                SuiteRoomNo = model.MedicalProviderLocation[0].SuiteRoomNo,
                ServiceLocation = serviceLocationModel.ToType<ServiceLocationModel>(),
            };

            return result;

        }

        /// <summary>
        /// Medicals the provider is exist.
        /// </summary>
        /// <param name="model">The model.</param>
        /// <param name="isWithId">if set to <c>true</c> [is with identifier].</param>
        /// <returns></returns>
        private bool MedicalProviderIsExist(TripDetails model, bool isWithId = false)
        {


            var location = model.MedicalProviderLocation[0].ServiceLocation;

            var query =
                from f in _context.MedicalProvider.AsQueryable()
                from fl in _context.MedicalProviderLocation.Include(x => x.ServiceLocation).Where(y => y.LocationType == ServiceLocationType.Physical)
                select new { provider = f, location = fl };

            if (isWithId)
            {
                query = query.Where(x => x.provider.Id != model.Id);
            }

            var isExist =
                            query.Any(x =>
                                    x.provider.DoctorName.Equals(model.DoctorName) &&
                                    x.provider.ProviderName.Equals(model.ProviderName)
                                    && x.location.ServiceLocation.Zipcode == location.Zipcode
                                    && x.location.ServiceLocation.StateProvince == location.StateProvince
                                    && x.location.ServiceLocation.City == location.City
                                    && x.location.ServiceLocation.AddressLine1 == location.AddressLine1
                                );
            return isExist;
        }

        /// <summary>
        /// Facilities the is exist.
        /// </summary>
        /// <param name="model">The model.</param>
        /// <param name="isWithId">if set to <c>true</c> [is with identifier].</param>
        /// <returns></returns>
        private bool FacilityIsExist(TripDetails model, bool isWithId = false)
        {
            var location = model.MedicalProviderLocation[0].ServiceLocation;

            var query =
                from f in _context.Facility.AsQueryable()
                from fl in _context.FacilityLocation.Include(x => x.ServiceLocation).Where(y => y.LocationType == ServiceLocationType.Physical)
                select new { facility = f, location = fl };

            if (isWithId)
            {
                query = query.Where(x => x.facility.Id != model.Id);
            }

            var isExist =
                query.Any(x =>
                        x.facility.Name.Equals(model.ProviderName)
                        && x.location.ServiceLocation.Zipcode == location.Zipcode
                        && x.location.ServiceLocation.StateProvince == location.StateProvince
                        && x.location.ServiceLocation.City == location.City
                        && x.location.ServiceLocation.AddressLine1 == location.AddressLine1
                    );

            return isExist;
        }

        /// <summary>
        /// Updates the medical provider.
        /// </summary>
        /// <param name="model">The model.</param>
        /// <returns></returns>
        public TripFacilityViewModel UpdateMedicalProvider(TripDetails model)
        {

            var zipCode = model.MedicalProviderLocation[0].ServiceLocation.Zipcode;

            var isExist = MedicalProviderIsExist(model, true);

            var isExistAsFacility = false;
            if (model.Id == 0)
            {
                isExistAsFacility = FacilityIsExist(model);
            }

            if (isExist || isExistAsFacility)
            {
                return null;
            }

            var medicalProvider = _context.MedicalProvider
                .Include(x => x.MedicalProviderLocation)
                    .ThenInclude(x => x.ServiceLocation)
                .FirstOrDefault(x => x.Id == model.Id);

            var entity = new MedicalProvider();

            if (medicalProvider != null)
            {
                medicalProvider.ProviderName = model.ProviderName;
                medicalProvider.DoctorName = model.DoctorName;
                medicalProvider.Phone = model.Phone;

                var serviceLocation = model.MedicalProviderLocation[0].ServiceLocation.ToType<ServiceLocation>();
                var location = medicalProvider.MedicalProviderLocation.FirstOrDefault(x => x.LocationType == ServiceLocationType.Physical && x.Status != (byte)Status.Deleted);
                if (location != null)
                {
                    #region update location
                    if (location.ServiceLocation is null || location.ServiceLocation.Status == (byte)Status.Deleted)
                    {
                        location.ServiceLocation = serviceLocation;
                        location.SuiteRoomNo = model.MedicalProviderLocation[0].SuiteRoomNo;
                        location.ServiceLocation.Status = (byte)Status.Active;
                        location.ServiceLocation.Country = "USA";
                        _context.Add(location.ServiceLocation);
                    }
                    else
                    {
                        location.ServiceLocation.AddressLine1 = serviceLocation.AddressLine1;
                        location.ServiceLocation.AddressLine2 = serviceLocation.AddressLine2;
                        location.ServiceLocation.AddressLine3 = serviceLocation.AddressLine3;
                        location.ServiceLocation.AddressLine4 = serviceLocation.AddressLine4;
                        location.SuiteRoomNo = model.MedicalProviderLocation[0].SuiteRoomNo;
                        location.ServiceLocation.BingMapEntityId = serviceLocation.BingMapEntityId;
                        location.ServiceLocation.City = serviceLocation.City;
                        location.ServiceLocation.Latitude = serviceLocation.Latitude;
                        location.ServiceLocation.Longitude = serviceLocation.Longitude;
                        location.ServiceLocation.StateProvince = serviceLocation.StateProvince;
                        location.ServiceLocation.Zipcode = serviceLocation.Zipcode;
                    }
                    #endregion
                }
                else
                {
                    location = new MedicalProviderLocation();
                    location.ServiceLocation = serviceLocation;
                    location.LocationType = ServiceLocationType.Physical;
                    location.SuiteRoomNo = model.MedicalProviderLocation[0].SuiteRoomNo;
                    location.ServiceLocation.Status = (byte)Status.Active;
                    location.ServiceLocation.Country = "USA";
                    location.Status = (byte)Status.Active;
                    medicalProvider.MedicalProviderLocation.Add(location);
                    _context.Add(serviceLocation);
                }
                entity = medicalProvider;
                _context.Update(entity);
            }
            else
            {

                entity.ProviderName = model.ProviderName;
                entity.DoctorName = model.DoctorName;
                entity.Phone = model.Phone;
                entity.MedicalProviderLocation = new List<MedicalProviderLocation>();
                entity.Status = (byte)Status.Active;

                var location = new MedicalProviderLocation();
                var serviceLocation = model.MedicalProviderLocation[0].ServiceLocation.ToType<ServiceLocation>();
                serviceLocation.Country = "USA";
                serviceLocation.Id = 0;
                location.LocationType = ServiceLocationType.Physical;

                location.ServiceLocation = serviceLocation;
                location.ServiceLocation.Status = (byte)Status.Active;
                location.SuiteRoomNo = model.MedicalProviderLocation[0].SuiteRoomNo;
                location.Status = (byte)Status.Active;

                _context.Add(serviceLocation);
                entity.MedicalProviderLocation.Add(location);
                _context.Add(entity);
            }
            _context.SaveChanges();

            var medicalProviderLocation = entity.MedicalProviderLocation.First(x => x.LocationType == ServiceLocationType.Physical && x.Status != (byte)Status.Deleted);
            var serviceLocationModel = medicalProviderLocation?.ServiceLocation;

            var result = new TripFacilityViewModel()
            {
                DoctorName = entity.DoctorName,
                Name = entity.ProviderName,
                MedicalProviderId = entity.Id,
                IsFacility = false,
                Phone = entity.Phone,
                SuiteRoomNo = model.MedicalProviderLocation[0].SuiteRoomNo,
                ServiceLocation = serviceLocationModel.ToType<ServiceLocationModel>(),
            };

            return result;
        }
    }

}

