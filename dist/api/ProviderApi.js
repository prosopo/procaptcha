"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderApi = void 0;
const tslib_1 = require("tslib");
// Copyright (C) 2021-2022 Prosopo (UK) Ltd.
// This file is part of procaptcha <https://github.com/prosopo-io/procaptcha>.
//
// procaptcha is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// procaptcha is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with procaptcha.  If not, see <http://www.gnu.org/licenses/>.
const HttpClientBase_1 = tslib_1.__importDefault(require("./HttpClientBase"));
const storage_1 = tslib_1.__importDefault(require("../modules/storage"));
class ProviderApi extends HttpClientBase_1.default {
    config;
    constructor(config) {
        super(config['providerApi.baseURL'], config['providerApi.prefix']);
        this.config = config;
    }
    /**
   *
   * @deprecated use ProsopoContract$getRandomProvider instead.
   */
    getRandomProvider() {
        const userAccount = storage_1.default.getAccount();
        return this.axios.get(`/random_provider/${userAccount}/${this.config['dappAccount']}`);
    }
    getProviders() {
        return this.axios.get(`/providers`);
    }
    getContractAddress() {
        return this.axios.get(`/contract_address`);
    }
    getCaptchaChallenge(randomProvider) {
        const { provider } = randomProvider;
        let { blockNumber } = randomProvider;
        blockNumber = blockNumber.replace(/,/g, '');
        const userAccount = storage_1.default.getAccount();
        return this.axios.get(`/provider/captcha/${provider.captchaDatasetId}/${userAccount}/${this.config['dappAccount']}/${blockNumber}`);
    }
    submitCaptchaSolution(blockHash, captchas, requestHash, txHash, userAccount) {
        return this.axios.post(`/provider/solution`, { blockHash, captchas, requestHash, txHash, userAccount, dappAccount: this.config['dappAccount'] });
    }
}
exports.ProviderApi = ProviderApi;
exports.default = ProviderApi;
//# sourceMappingURL=ProviderApi.js.map