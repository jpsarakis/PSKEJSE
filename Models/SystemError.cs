using Newtonsoft.Json;
using System;
using System.Data.SqlClient;

namespace PSKEJSE.Models
{
    /// <summary>
    /// Class for recording exception data 
    /// and throw it at frontend in a more
    /// readable format
    /// </summary>
    public class SystemError

    {
        public string ExceptionMessage { get; set; }

        public string InnerExceptionErrorMessage { get; set; }
        
        /// <summary>
        /// Convert (Serialise) the object to a JSON Object
        /// </summary>
        /// <returns></returns>
        public override string ToString()
        {
            return JsonConvert.SerializeObject(this);
        }

    }
}
