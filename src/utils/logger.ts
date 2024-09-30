export const logJSON = (message: string, data?: any) => {
    console.log(message);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  };