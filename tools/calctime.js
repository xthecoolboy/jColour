exports.calcTime = function(date_2, date_1) {

    // https://stackoverflow.com/a/26159550
  
  
    //convert to UTC
    var date2_UTC = new Date(Date.UTC(date_2.getUTCFullYear(), date_2.getUTCMonth(), date_2.getUTCDate()));
    var date1_UTC = new Date(Date.UTC(date_1.getUTCFullYear(), date_1.getUTCMonth(), date_1.getUTCDate()));
  
    //--------------------------------------------------------------
    var days = date2_UTC.getDate() - date1_UTC.getDate();
    if (days < 0) {
  
      date2_UTC.setMonth(date2_UTC.getMonth() - 1);
      days += DaysInMonth(date2_UTC);
    }
    //--------------------------------------------------------------
    var months = date2_UTC.getMonth() - date1_UTC.getMonth();
    if (months < 0) {
      date2_UTC.setFullYear(date2_UTC.getFullYear() - 1);
      months += 12;
    }
    //--------------------------------------------------------------
    var years = date2_UTC.getFullYear() - date1_UTC.getFullYear();
  
    years = years ? years + "y, " : ""
    months = months ? months + "mo, " : ""
    days = days ? days + "d" : (months || years ? "" : days + "d")
  
    return years + months + days;
  };
  
  function DaysInMonth(date2_UTC) {
    var monthStart = new Date(date2_UTC.getFullYear(), date2_UTC.getMonth(), 1);
    var monthEnd = new Date(date2_UTC.getFullYear(), date2_UTC.getMonth() + 1, 1);
    var monthLength = (monthEnd - monthStart) / (1000 * 60 * 60 * 24);
    return monthLength;
  }
  