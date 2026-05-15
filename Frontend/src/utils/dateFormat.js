export const formatDateDDMMYYYY = (dateInput) => {
  if (!dateInput) return "";
  const dateObj = new Date(dateInput);
  if (Number.isNaN(dateObj.getTime())) return "";
  const dd = String(dateObj.getDate()).padStart(2, "0");
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const yyyy = dateObj.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const formatDateTimeDDMMYYYY = (dateInput) => {
  if (!dateInput) return "";
  const dateObj = new Date(dateInput);
  if (Number.isNaN(dateObj.getTime())) return "";
  const datePart = formatDateDDMMYYYY(dateObj);
  const timePart = dateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart} ${timePart}`;
};
