 const formatDate = (dateStr) => {
      const [day, month, year] = dateStr.split("/").map(Number);
  const dateObj = new Date(year, month - 1, day);

  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return dateObj.toLocaleDateString("en-US", options);
  };
  
const formatTime = (timeStr=null) => {
  // Split the time and AM/PM part
  const [time, period] = timeStr.split(" ");
  // Capitalize the period (AM/PM)
  const capitalizedPeriod = period?.toUpperCase();

  return `${time} ${capitalizedPeriod}`;
};
  
  module.exports = {
    formatDate,
    formatTime
  };