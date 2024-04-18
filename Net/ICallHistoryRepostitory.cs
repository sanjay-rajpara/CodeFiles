using System.Collections.Generic;
using Evince.DataTable;
using LAMT.Data;
using LAMT.Model;

namespace LAMT.Repository.Contract
{
    public interface ICallHistoryRepository
    {
        /// <summary>
        /// Gets the list.
        /// </summary>
        /// <param name="param">The parameter.</param>
        /// <returns></returns>
        IList<CallHistory> GetList(CallHistorySearchModel param);

        /// <summary>
        /// Updates the specified data.
        /// </summary>
        /// <param name="data">The data.</param>
        /// <returns></returns>
        CallHistory Update(CallHistory data);
        CallHistory Update(CallHistory data, IList<long> legIds);
    }
}
