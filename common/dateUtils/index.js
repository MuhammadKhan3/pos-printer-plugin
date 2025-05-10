 const formatDate = (dateStr) => {
    const [day, month, year] = dateStr.split("/").map(Number);
    const dateObj = new Date(year, month - 1, day);
  
    const monthName = dateObj.toLocaleString("default", { month: "short" });
    const dayNum = dateObj.getDate();
  
    const getDaySuffix = (day) => {
      if (day >= 11 && day <= 13) return "th";
      switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };
  
    return `${monthName} ${dayNum}${getDaySuffix(dayNum)}`;
  };
  
  const formatTime = (timeStr) => {
    const [hourStr, minute] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "p.m" : "a.m";
    hour = hour % 12 || 12;
    return `${hour}:${minute}${ampm}`;
  };
  
  module.exports = {
    formatDate,
    formatTime
  };