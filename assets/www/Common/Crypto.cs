using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Text;
using System.Security.Cryptography;
using Newtonsoft.Json;

namespace TAMS.SVC.FSA.Mobile.Common
{
    internal class Crypto
    {
        //private const string HMACKey = "1)@98#$76%";
        
        //internal static string GenerateHMAC(SessionInfo si)
        //{
        //    string messageObject = si.ToHMACString();
        //    ASCIIEncoding encoding = new ASCIIEncoding();
        //    byte[] keyByte = encoding.GetBytes(HMACKey);
        //    HMACSHA256 hmacsha256 = new HMACSHA256(keyByte);
        //    byte[] messageBytes = encoding.GetBytes(messageObject);
        //    byte[] hashmessage = hmacsha256.ComputeHash(messageBytes);
        //    return encoding.GetString(hashmessage);            
        //}

        //internal static bool VerifyHMAC(SessionInfo requestObj, SessionInfo cacheObj)
        //{
        //    string strHmac = GenerateHMAC(requestObj);
        //    return strHmac == cacheObj.HMAC;
        //}
    }
}