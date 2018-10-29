﻿using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;
using System.Data;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

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
                ID = (int)row["ID"],
                TableName = !row.IsNull("TableName") ? (string)row["TableName"] : "NULL",
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
            SqlDataAdapter sda = new SqlDataAdapter("SELECT CallID, CallPhaseID, Data, DataKey, ID, Qualifier, TableName FROM JsonData ORDER BY Id", con);
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
            int key = -1;
            int.TryParse(Request.Query.Where(q => q.Key == "id").Select(q => q.Value).SingleOrDefault(),
                         out key);
            if (key <= 0)
                throw new Exception("Error while retrieving data from database in api/GetJsonData: ID parameter was not specified");
            var con = GetConnection();
            var cmd = new SqlCommand($"SELECT Data FROM JsonData WHERE ID={key}", con);
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

        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] Object jsObj)
        {
            if (jsObj == null) return BadRequest();
            var JSONDeserialisationSettings = new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                MissingMemberHandling = MissingMemberHandling.Ignore
            };
            var jItem = JsonConvert.DeserializeObject<JsonDataSummary>(jsObj.ToString(), JSONDeserialisationSettings);

            string dkName = "";
            if (String.IsNullOrWhiteSpace(jItem.DataKey))
                return StatusCode(500, "Error while updating JSON: Field DataKey is mandatory");
            else
                dkName = jItem.DataKey.Replace("'", "''");

            string tblName = "";
            if (String.IsNullOrWhiteSpace(jItem.TableName))
                return StatusCode(500, "Error while updating JSON: Field TableName is mandatory");
            else
                tblName = jItem.TableName.Replace("'", "''");


            string jsonData = String.IsNullOrWhiteSpace(jItem.Data) ? "NULL" : jItem.Data.Replace("'", "''");
            string callphaseid = jItem.CallPhaseID > 0 ? jItem.CallPhaseID.ToString() : "NULL";
            string callid = jItem.CallID > 0 ? jItem.CallID.ToString() : "NULL";
            string qualifier = String.IsNullOrWhiteSpace(jItem.Qualifier) ? "NULL" : jItem.Qualifier.Replace("'", "''");
            try
            {
                string sqlStatement = $"SELECT Count(id) FROM JsonData WHERE id<>{id} and DataKey='{dkName}'";
                con = GetConnection();
                con.Open();
                cmd = new SqlCommand(sqlStatement, con);

                int result = (int)cmd.ExecuteScalar();
                if (result > 0)
                    return StatusCode(500, $"Error while updating JSON to database: DataKey {dkName} already exists!!!");

                sqlStatement = $"UPDATE JsonData SET Data='{jsonData}', DataKey='{dkName}', TableName='{tblName}', CallID={callid}, CallPhaseID={callphaseid}, Qualifier='{qualifier}' WHERE id={jItem.ID}";

                con = GetConnection();
                con.Open();
                tran = con.BeginTransaction($"PSKEJSE - Update JSON ID {jItem.ID}");
                cmd = new SqlCommand(sqlStatement, con, tran);

                int rows = cmd.ExecuteNonQuery();
                if (rows > 2)
                {
                    tran.Rollback();
                    return StatusCode(500, $"Error while updating JSON: Was expecting up to 2 affected rows but the number of affected rows are '{rows}'. Aborted operation!");
                }
                else if (rows < 1)
                {
                    tran?.Rollback();
                    return NotFound($"Error while updating JSON: ID {jItem.ID} was not found");
                }
                else
                {
                    tran?.Commit();
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

        [HttpPost]
        public IActionResult Post([FromBody] Object jsObj)
        {
            if (jsObj == null) return BadRequest("Error while saving new JSON to database: jsObj is null");
            try
            {

                var JSONDeserialisationSettings = new JsonSerializerSettings
                {
                    NullValueHandling = NullValueHandling.Ignore,
                    MissingMemberHandling = MissingMemberHandling.Ignore
                };
                var jItem = JsonConvert.DeserializeObject<JsonDataSummary>(jsObj.ToString(), JSONDeserialisationSettings);
                string dkName = "";
                if (String.IsNullOrWhiteSpace(jItem.DataKey))
                    return StatusCode(500, "Error while saving new JSON to database: Field DataKey is mandatory");
                else
                    dkName = jItem.DataKey.Replace("'", "''");

                string tblName = "";
                if (String.IsNullOrWhiteSpace(jItem.TableName))
                    return StatusCode(500, "Error while saving new JSON to database: Field TableName is mandatory");
                else
                    tblName = jItem.TableName.Replace("'", "''");

                string jsonData = String.IsNullOrWhiteSpace(jItem.Data) ? "NULL" : jItem.Data.Replace("'", "''");
                string callphaseid = jItem.CallPhaseID > 0 ? jItem.CallPhaseID.ToString() : "NULL";
                string callid = jItem.CallID > 0 ? jItem.CallID.ToString() : "NULL";
                string qualifier = String.IsNullOrWhiteSpace(jItem.Qualifier) ? "NULL" : jItem.Qualifier.Replace("'", "''");
                string sqlStatement = $"SELECT Count(id) FROM JsonData WHERE DataKey='{dkName}'";
                con = GetConnection();
                con.Open();
                cmd = new SqlCommand(sqlStatement, con);
                int result = (int)cmd.ExecuteScalar();
                if (result > 0)
                    return StatusCode(500, $"Error while saving new JSON to database: Datakey {dkName} already exists");

                sqlStatement = $"INSERT INTO JsonData (Data,DataKey,TableName,CallID,CallPhaseID,Qualifier) VALUES ('{jsonData}','{dkName}','{tblName}',{callid},{callphaseid},'{qualifier}')";
                tran = con.BeginTransaction("PSKEJSE - Adding new JSON");
                cmd = new SqlCommand(sqlStatement, con, tran);
                cmd.ExecuteNonQuery();
                tran.Commit();
                return NoContent();
            }
            catch (Exception ex)
            {
                tran?.Rollback();
                return StatusCode(500, $"Error while saving new JSON to database: {ex.Message} ");
            }
            finally
            {
                tran?.Dispose();
                cmd?.Dispose();
                CloseConnection(con);
            }

        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            SqlConnection con = GetConnection();
            string sqlCommandText = $"DELETE FROm JsonData WHERE id={id}";
            try
            {
                con.Open();
                tran = con.BeginTransaction();
                SqlCommand sqlCommand = new SqlCommand(sqlCommandText, con, tran);
                sqlCommand.ExecuteNonQuery();
                tran.Commit();
                return Ok();
            }
            catch (Exception ex)
            {
                tran?.Rollback();
                return StatusCode(500, ex.Message);
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
            string statement = "SELECT CallID, CallPhaseID, Data, DataKey, ID, Qualifier, TableName FROM JsonData WHERE ";
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
            string orderby = " ORDER BY Id";
            return string.Concat(finalStatement, orderby);
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
        public string Data { get; set; }
    }
}


