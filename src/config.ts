import ProviderApi from "./api/ProviderApi";

export default {
    providerApi: new ProviderApi("http://localhost:3000", "/v1/prosopo"),
}
