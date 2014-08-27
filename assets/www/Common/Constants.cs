using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TAMS.SVC.FSA.Mobile.Common
{
    public class Constants
    {
        // be sure to replace OTNSRVR with your host's name
        public static string OraDB = System.Configuration.ConfigurationManager.AppSettings["OracleConnection"];
        public static string OraDBReadOnly = System.Configuration.ConfigurationManager.AppSettings["OracleConnectionReadOnly"];
        public static string sqlDB = System.Configuration.ConfigurationManager.AppSettings["SQLConnection"];

        public const string AUTHTOKEN_KEY = "FSA-AuthenticationToken";
    }
    
}