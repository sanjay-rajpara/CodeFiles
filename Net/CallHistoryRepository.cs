using LAMT.Data;
using LAMT.Model;
using LAMT.Repository.Contract;
using LAMT.Utility.Helper;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

namespace LAMT.Repository.Implementation
{
    public class CallHistoryRepository : BaseRepository<CallHistory>, ICallHistoryRepository
    {
        private readonly LAMTContext _context;

        public CallHistoryRepository(LAMTContext context):base(context)
        {
            _context = context;
        }
        public IList<CallHistory> GetList(CallHistorySearchModel model)
        {
            var query = _context.CallHistoryDispatchOrderLeg
                .Include(x => x.CallHistory)
                    .ThenInclude(x=>x.Provider)
                .Include(x=>x.DispatchOrderLeg)
                .AsQueryable();


            query = query.Where(x => model.DispatchOrderLegId.Contains(x.DispatchOrderLegId));

            var list = query.ToList();

            var afterG = list.GroupBy(x => x.CallHistory);
            var l = afterG.Select(x => x.Key).ToList();
            return l;
        }

        /// <summary>
        /// Function to upsert Dispatch Order.
        /// </summary>
        /// <param name="model"><see cref="{CallHistory}"/></param>
        /// <returns>Returns <see cref="{CallHistory}" /> type response.</returns>
        public CallHistory Update(CallHistory data)
        {
            if (data != null)
            {
                if (data.Id > 0)
                    _context.Update(data);
                else
                    _context.Add(data);
                _context.SaveChanges();
            }
            return data;
        }

        public CallHistory Update(CallHistory data, IList<long> dispatchOrderLegIds)
        {
            var newData = data.ToType<CallHistory>();
            if (data.Id > 0)
                _context.Update(data);
            else
            {


                foreach (var legId in dispatchOrderLegIds)
                {
                    newData.CallHistoryDispatchOrderLeg.Add(new CallHistoryDispatchOrderLeg { CallHistory = newData, DispatchOrderLegId = legId });
                }
                _context.Add(newData);
            }
            _context.SaveChanges();
            return newData;
        }

    }

    public class BidHistoryRepository : BaseRepository<CallHistory>, IBidHistoryRepository
    {
        private readonly LAMTContext _context;

        public BidHistoryRepository(LAMTContext context) : base(context)
        {
            _context = context;
        }
        public IList<BidHistory> GetList(BidHistorySearchModel model)
        {
            var query = _context.BidHistory
                .Include(x => x.Provider)
                //.Include(x => x.DispatchOrderLeg)
                .AsQueryable();


           // query = query.Where(x => model.DispatchOrderLegId.Contains(x.DispatchOrderLegId));

            return query.ToList();
        }

        /// <summary>
        /// Function to upsert Dispatch Order.
        /// </summary>
        /// <param name="model"><see cref="{BidlHistory}"/></param>
        /// <returns>Returns <see cref="{BidlHistory}" /> type response.</returns>
        public BidHistory Update(BidHistory data)
        {
            if (data != null)
            {
                if (data.Id > 0)
                    _context.Update(data);
                else
                    _context.Add(data);
                _context.SaveChanges();
            }
            return data;
        }

        /// <summary>
        /// Function to upsert Dispatch Order.
        /// </summary>
        /// <param name="model"><see cref="{BidlHistory}"/></param>
        /// <returns>Returns <see cref="{BidlHistory}" /> type response.</returns>
        public IList<BidHistory> Update(BidHistory data, IList<long> dispatchOrderLegIds)
        {
            var list = new List<BidHistory>();

            if (data != null)
            {
                if (data.Id > 0)
                    _context.Update(data);
                else
                {
                    
                    foreach (var legId in dispatchOrderLegIds)
                    {
                        var newData = data.ToType<BidHistory>();
                        //newData.DispatchOrderLegId = legId;

                        list.Add(newData);
                    }

                    _context.AddRange(list);
                }
                _context.SaveChanges();
            }
            return list;
        }
    }
}
