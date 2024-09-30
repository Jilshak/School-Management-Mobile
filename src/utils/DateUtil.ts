export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateToYear = (dateString: string) => {
  const date = new Date(dateString);
  return date.getFullYear().toString();
};
