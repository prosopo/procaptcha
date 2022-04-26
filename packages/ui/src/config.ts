import ProviderApi from "./api/providerApi";

export default {
    providerApi: new ProviderApi("http://localhost:3000", "/v1/prosopo"),
    networkConfig: {'endpoint': 'ws://0.0.0.0:9944'}

}
