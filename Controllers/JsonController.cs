using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;
using System.Data;

namespace PSKEJSE.Controllers
{
    [Produces("application/json")]
    [Route("api/")]
    public class JsonController : Controller
    {

        private readonly IConfiguration configuration;

        public JsonController(IConfiguration config) => configuration = config;

        private JsonDataSummary CreateNewJson(DataRow row)
        {
            JsonDataSummary json = new JsonDataSummary
            {
                CallID = !row.IsNull("CallID") ? (int)row["CallID"] : -1,
                CallPhaseID = !row.IsNull("CallPhaseID") ? (int)row["CallPhaseID"] : -1,
                DataKey = !row.IsNull("DataKey") ? (string)row["DataKey"] : "NULL",
                ID = !row.IsNull("ID") ? (int)row["ID"] : -1,
                Qualifier = !row.IsNull("Qualifier") ? (string)row["Qualifier"] : "NULL",
                TableName = !row.IsNull("TableName") ? (string)row["TableName"] : "NULL"
            };
            return json;
        }

        [HttpGet("[action]")]
        public JsonResult GetAllJsons()
        {
            SqlConnection con = new SqlConnection(configuration.GetConnectionString("DEVDB"));
            SqlDataAdapter sda = new SqlDataAdapter("SELECT CallID, CallPhaseID, Data, DataKey, ID, Qualifier, TableName FROM JsonData", con);
            DataSet ds = new DataSet();

            try
            {
                con.Open();
                sda.Fill(ds);
                List<JsonDataSummary> results = new List<JsonDataSummary>();
                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    results.Add(CreateNewJson(row));
                }
                return Json(results);
            }
            catch (Exception e)
            {
                string errormsg = $"Error while retrieving data from database in api/GetAllJsons:\r\n {e.Message} ";
                throw new Exception(errormsg);
            }
            finally
            {
                ds?.Dispose();
                sda?.Dispose();
                if (con != null)
                {
                    if (con.State == ConnectionState.Open) con.Close();
                    con.Dispose();
                }
            }
        }

        [HttpGet("[action]")]
        public IEnumerable<JsonDataSummary> GetJsons()
        {
            List<JsonDataSummary> result = new List<JsonDataSummary>();
            SqlConnection con = new SqlConnection(configuration.GetConnectionString("DEVDB"));
            int criterion = -1;
            int.TryParse(Request.Query.Where(r => r.Key == "criterion").Select(r => r.Value).SingleOrDefault(), out criterion);
            string filter = Request.Query.Where(r => r.Key == "filter").Select(r => r.Value).SingleOrDefault();
            string sql = BuildSQLStatement(criterion, filter);
            SqlDataAdapter sda = new SqlDataAdapter(sql, con);
            DataSet ds = new DataSet();
            try
            {
                con.Open();
                sda.Fill(ds);
                foreach (DataRow row in ds.Tables[0].Rows)
                    result.Add(CreateNewJson(row));

                return result;
            }
            catch (Exception e)
            {
                string errormsg = $"Error while retrieving data from database in api/GetJson:\r\n {e.Message} ";
                throw new Exception(errormsg);
            }
            finally
            {
                ds?.Dispose();
                sda?.Dispose();
                if (con != null)
                {
                    if (con.State == ConnectionState.Open) con.Close();
                    con.Dispose();
                }
            }
        }

        private string BuildSQLStatement(int criterio, string filter)
        {
            string statement = "SELECT CallID, CallPhaseID, DataKey, ID, Qualifier, TableName FROM JsonData WHERE ";
            string finalStatement = String.Empty;
            switch (criterio)
            {
                case 1:
                    finalStatement = String.Concat(statement, $"CallID = {filter}");
                    break;
                case 2:
                    finalStatement = String.Concat(statement, $"CallPhaseID = {filter}");
                    break;
                case 3:
                    finalStatement = String.Concat(statement, $"DataKey = '{filter}'");
                    break;
                case 4:
                    finalStatement = String.Concat(statement, $"Table = '{filter}'");
                    break;

                default:
                    break;
            }
            return finalStatement;
        }

    }

    public class JsonDataSummary
    {
        public int CallID { get; set; }
        public string DataKey { get; set; }
        public int CallPhaseID { get; set; }
        public string Qualifier { get; set; }
        public int ID { get; set; }
        public string TableName { get; set; }

    }
}


