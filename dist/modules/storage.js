"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const CURRENT_ACCOUNT_KEY = "@prosopo/current_account";
/**
 * Sets default `account`
 */
function setAccount(account) {
    localStorage.setItem(CURRENT_ACCOUNT_KEY, account);
}
/**
 * Gets default `account`
 */
function getAccount() {
    return localStorage.getItem(CURRENT_ACCOUNT_KEY);
}
exports.default = {
    setAccount,
    getAccount
};
//# sourceMappingURL=storage.js.map