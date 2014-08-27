using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Net.Http;
using System.Web.Http;
using TAMS.SVC.FSA.Mobile.Managers;
using System.Text;
using System.Data;
using System.Data.SqlClient;
using log4net;

namespace TAMS.SVC.FSA.Mobile.Common
{
    public class Utility
    {
        private static readonly ILog log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public static string RemoveSpecialCharacters(string str)
        {
            StringBuilder sb = new StringBuilder();
            foreach (char c in str)
            {
                if ((c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') ||
                    c == '.' || c == '_' || c == '\'' || c == '(' || c == ',' || c == ')' ||
                    c == ' ' || c == '=' || c == '/' || c == ':' || c == '*' || c == '<' || c == '>' || c == '+')
                {
                    sb.Append(c);
                }
            }
            return sb.ToString();
        }

        public static string convertTo24HrFormat(string time)
        {
            if (time.Substring(time.IndexOf(" ") + 1) == "AM")
            {
                if (Convert.ToInt32(time.Substring(0, time.IndexOf(":"))) == 12)
                {
                    time = time.Replace("12:", "00:");
                }
            }
            else
            {
                if (Convert.ToInt32(time.Substring(0, time.IndexOf(":"))) != 12)
                {
                    if (Convert.ToInt32(time.Substring(0, time.IndexOf(":"))) == 0)
                    {
                        time = time.Replace(time.Substring(0, time.IndexOf(":")), "12");
                    }
                    else
                    {
                        time = time.Replace(time.Substring(0, time.IndexOf(":")), (Convert.ToInt32(time.Substring(0, time.IndexOf(":"))) + 12) + "");
                    }
                }
            }
            return time.Split(' ')[0];
        }

        public static string ConvertToDateTimeString(string date, string time)//date long/short both and only digits no month names, time hh:mm AM/PM
        {
            string properDate;
            if (date.IndexOf("T") > 0)
            {
                if (time.Substring(time.IndexOf(" ") + 1) == "PM")
                {
                    if (Convert.ToInt32(time.Substring(0, time.IndexOf(":"))) != 12)
                    {
                        time = Convert.ToInt32(time.Substring(0, time.IndexOf(":"))) + 12 + time.Substring(time.IndexOf(":"), time.IndexOf(" ") - 1);
                    }
                    else
                    {
                        time = time.Substring(0, time.IndexOf(" "));
                    }
                }
                else
                {
                    if (Convert.ToInt32(time.Substring(0, time.IndexOf(":"))) == 12)
                    {
                        time = time.Replace("12:", "00:");
                    }
                }
                if (time.IndexOf(" ") > 0)
                {
                    time = time.Substring(0, time.IndexOf(" "));
                }
                properDate = date.Replace(date.Substring(date.IndexOf("T"), 6), "T" + time);
            }
            else
            {
                properDate = date + " " + time;
            }

            return properDate;
        }

        public static void AddSTARSUpdateLog(string sessionID, string userName, string action, string taskID, string taskNumber, string srID, string srNumber)
        {
            using (SqlConnection sqlConn = new SqlConnection(Constants.sqlDB))
            {
                using (SqlCommand sqlComm = new SqlCommand())
                {
                    sqlComm.Connection = sqlConn;
                    sqlComm.CommandText = "dbo.sp_addSTARSUpdateLog";
                    sqlComm.CommandType = CommandType.StoredProcedure;

                    SqlParameter paramSessionID = sqlComm.CreateParameter();
                    paramSessionID.ParameterName = "sessionID";
                    paramSessionID.DbType = DbType.String;
                    paramSessionID.Value = DBNull.Value;
                    if (sessionID != null)
                    {
                        paramSessionID.Value = sessionID;
                    }
                    sqlComm.Parameters.Add(paramSessionID);

                    SqlParameter paramUserName = sqlComm.CreateParameter();
                    paramUserName.ParameterName = "userName";
                    paramUserName.DbType = DbType.String;
                    paramUserName.Value = DBNull.Value;
                    if (userName != null)
                    {
                        paramUserName.Value = userName;
                    }
                    sqlComm.Parameters.Add(paramUserName);

                    SqlParameter paramAction = sqlComm.CreateParameter();
                    paramAction.ParameterName = "action";
                    paramAction.DbType = DbType.String;
                    paramAction.Value = DBNull.Value;
                    if (action != null)
                    {
                        paramAction.Value = action;
                    }
                    sqlComm.Parameters.Add(paramAction);

                    SqlParameter paramTaskID = sqlComm.CreateParameter();
                    paramTaskID.ParameterName = "taskID";
                    paramTaskID.DbType = DbType.String;
                    paramTaskID.Value = DBNull.Value;
                    if (taskID != null)
                    {
                        paramTaskID.Value = taskID;
                    }
                    sqlComm.Parameters.Add(paramTaskID);

                    SqlParameter paramTaskNumber = sqlComm.CreateParameter();
                    paramTaskNumber.ParameterName = "taskNumber";
                    paramTaskNumber.DbType = DbType.String;
                    paramTaskNumber.Value = DBNull.Value;
                    if (taskNumber != null)
                    {
                        paramTaskNumber.Value = taskNumber;
                    }
                    sqlComm.Parameters.Add(paramTaskNumber);

                    SqlParameter paramSrNumber = sqlComm.CreateParameter();
                    paramSrNumber.ParameterName = "sRNumber";
                    paramSrNumber.DbType = DbType.String;
                    paramSrNumber.Value = DBNull.Value;
                    if (srNumber != null)
                    {
                        paramSrNumber.Value = srNumber;
                    }
                    sqlComm.Parameters.Add(paramSrNumber);

                    SqlParameter paramSrID = sqlComm.CreateParameter();
                    paramSrID.ParameterName = "sRId";
                    paramSrID.DbType = DbType.String;
                    paramSrID.Value = DBNull.Value;
                    if (srID != null)
                    {
                        paramSrID.Value = srID;
                    }
                    sqlComm.Parameters.Add(paramSrID);
                          
                    try
                    {
                        sqlConn.Open();
                        sqlComm.ExecuteReader();
                    }
                    catch (Exception ex)
                    {
                        //throw ex;
                        log.Error("Updates Log Exception", ex);
                    }

                }
            }

        }
    }
}