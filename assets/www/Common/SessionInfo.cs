using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;
using System.Security.Cryptography;

namespace TAMS.SVC.FSA.Mobile.Common
{
    public class SessionInfo
    {
        private const string Seperator = "##";
        public string User = "";
        public string CeID = "";
        public string Key = "";

        //Default constructor for JSON de-serialization to work
        public SessionInfo()
        {
        }

        //Create a new SessionInfo object.
        public SessionInfo(string userId, string ceId)
        {
            User = userId;
            CeID = ceId;
            //Combination of GUID + userid + ceid is expected to be unique all the time.
            Key = Guid.NewGuid().ToString();
            Key = Key + Seperator + User + Seperator + CeID;
        }

        //returns concatenated value of userid and ceid.
        public string GetUserKey()
        {
            return User + Seperator + CeID;
        }

        public override string ToString()
        {
            return Key;
        }      
    }
}