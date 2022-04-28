// https://create-react-app.dev/docs/adding-custom-environment-variables/
export default {
    "providerApi.baseURL": process.env.REACT_APP_API_BASE_URL,
    "providerApi.prefix": process.env.REACT_APP_API_PATH_PREFIX,
    "dappAccount": process.env.REACT_APP_DAPP_CONTRACT_ADDRESS,
}
