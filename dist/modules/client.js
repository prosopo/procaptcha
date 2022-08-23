"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.captchaStatusReducer = exports.captchaStateReducer = exports.captchaContextReducer = void 0;
const captchaContextReducer = (state, action) => {
    return { ...state, ...action };
};
exports.captchaContextReducer = captchaContextReducer;
const captchaStateReducer = (state, action) => {
    return { ...state, ...action };
};
exports.captchaStateReducer = captchaStateReducer;
const captchaStatusReducer = (state, action) => {
    const logger = { info: console.log, error: console.error };
    for (const key in action) {
        logger[key](action[key]);
        let status = Array.isArray(action[key]) ? action[key][1] : action[key];
        if (status instanceof Error) {
            status = status.message;
        }
        return { [key]: String(status) };
    }
    return state;
};
exports.captchaStatusReducer = captchaStatusReducer;
//# sourceMappingURL=client.js.map