﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;
using System.Data;
using System.Net.Http;

namespace PSKEJSE.Controllers
{
    [Produces("application/json")]
    [Route("api/Json")]
    public class JsonController : Controller
    {

        private readonly IConfiguration configuration;
        private SqlConnection con = null;
        private SqlCommand cmd = null;
        private SqlTransaction tran = null;

        public JsonController(IConfiguration config) => configuration = config;

        private JsonDataSummary CreateNewJson(DataRow row)
        {
            JsonDataSummary json = new JsonDataSummary
            {
                CallID = !row.IsNull("CallID") ? (int)row["CallID"] : -1,
                CallPhaseID = !row.IsNull("CallPhaseID") ? (int)row["CallPhaseID"] : -1,
                DataKey = !row.IsNull("DataKey") ? (string)row["DataKey"] : "NULL",
                Qualifier = !row.IsNull("Qualifier") ? (string)row["Qualifier"] : "NULL",
            };
            return json;
        }

        private void CloseConnection(SqlConnection con)
        {
            if (con != null)
            {
                if (con.State == ConnectionState.Open) con.Close();
                con.Dispose();
            }
        }

        private SqlConnection GetConnection()
        {
            return new SqlConnection(configuration.GetConnectionString("DEVDB"));

        }

        [HttpGet("[action]")]
        public JsonResult GetAllJsons()
        {
            con = GetConnection();
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
                CloseConnection(con);
            }
        }

        [HttpGet("[action]")]
        public JsonResult GetJsons()
        {
            List<JsonDataSummary> result = new List<JsonDataSummary>();
            con = GetConnection();
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

                return Json(result);
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
                CloseConnection(con);
            }
        }

        [HttpGet("[action]")]
        public string GetJsonData()
        {
            string key = Request.Query.Where(q => q.Key == "dataKey").Select(q => q.Value).SingleOrDefault();
            if (key==null || key==String.Empty)
                throw new Exception("Error while retrieving data from database in api/GetJsonData: DataKey parameter was not specified");
            var con = GetConnection();
            var cmd = new SqlCommand($"SELECT Data FROM JsonData WHERE DataKey='{key}'", con);
            try
            {
                con.Open();
                var result = cmd.ExecuteScalar();
                if (result != null)
                    return result.ToString();
                else
                    return String.Empty;
            }
            finally
            {
                cmd?.Dispose();
                CloseConnection(con);
            }

        }

        [HttpPut("{dataKey}")]
        public IActionResult Put(string dataKey, [FromBody] object jsonData)
        {
            if (jsonData == null) return BadRequest();
            string finalData = jsonData.ToString().Replace("'", "''");
            string sqlStatement = $"UPDATE JsonData SET Data='{finalData}' WHERE DataKey='{dataKey}'";
            try
            {
                con = GetConnection();
                con.Open();
                tran = con.BeginTransaction("PSKEJSE");
                cmd = new SqlCommand(sqlStatement, con, tran);

                int rows = cmd.ExecuteNonQuery();
                if (rows > 1)
                {
                    tran.Rollback();
                    throw new Exception($"{dataKey} was found more than once in table JsonData");
                }
                else if (rows < 1)
                {
                    tran.Rollback();
                    return NotFound();
                }
                else
                {
                    tran.Commit();
                    return NoContent();
                }
            }
            finally
            {
                cmd?.Dispose();
                tran?.Dispose();
                CloseConnection(con);
            }
        }


        private string BuildSQLStatement(int criterio, string filter)
        {
            string statement = "SELECT CallID, CallPhaseID, DataKey, Qualifier FROM JsonData WHERE ";
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
                    finalStatement = String.Concat(statement, $"DataKey LIKE '{filter}%'");
                    break;
                case 4:
                    finalStatement = String.Concat(statement, $"Qualifier LIKE '{filter}%'");
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
    }
}


