import api from "../axios";

export const getAccountsReport = async () => {
    const response = await api.get("/accounts/get-stuedent-accounts-details");
    return response.data;
}