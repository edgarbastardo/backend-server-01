"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
require('dotenv').config(); //Read the .env file, in the root folder of project
var cluster_1 = require("cluster");
var node_fetch_1 = require("node-fetch");
var CommonConstants_1 = require("../../02_system/common/CommonConstants");
var CommonUtilities_1 = require("../../02_system/common/CommonUtilities");
var SystemUtilities_1 = require("../../02_system/common/SystemUtilities");
var debug = require('debug')('test01_test_api');
var strProtocol = "http://";
var strHost = "127.0.0.1";
var jsonAuthorization = null;
var strAuthorization = null;
var strShortToken = null;
var headers = {
    "Authorization": "",
    "Content-Type": "application/json",
    "FrontendId": "ccc1",
    "TimeZoneId": "America/Los_Angeles",
    "Language": "en_US"
};
function test_login(headers, strUser, strPassword) {
    return __awaiter(this, void 0, void 0, function () {
        var result, body, options, strRequestPath, error_1, sourcePosition, strMark, debugMark;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    result = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    body = {
                        Username: strUser,
                        Password: strPassword
                    };
                    options = {
                        method: 'POST',
                        body: JSON.stringify(body),
                        headers: headers //{ 'Content-Type': 'application/json' },
                    };
                    strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;
                    strRequestPath = strRequestPath + "/system/security/authentication/login";
                    return [4 /*yield*/, node_fetch_1["default"](strRequestPath, options)];
                case 2:
                    result = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    sourcePosition = CommonUtilities_1["default"].getSourceCodePosition(1);
                    sourcePosition.method = "server." + test_login.name;
                    strMark = "40FBD23995AB" + (cluster_1["default"].worker && cluster_1["default"].worker.id ? "-" + cluster_1["default"].worker.id : "");
                    debugMark = debug.extend(strMark);
                    debugMark("Error message: [%s]", error_1.message ? error_1.message : "No error message available");
                    debugMark("Error time: [%s]", SystemUtilities_1["default"].getCurrentDateAndTime().format(CommonConstants_1["default"]._DATE_TIME_LONG_FORMAT_01));
                    debugMark("Catched on: %O", sourcePosition);
                    debugMark("Error: %O", error_1);
                    result = error_1;
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, result];
            }
        });
    });
}
function test_logout(headers) {
    return __awaiter(this, void 0, void 0, function () {
        var result, options, strRequestPath, error_2, sourcePosition, strMark, debugMark;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    result = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    options = {
                        method: 'POST',
                        body: null,
                        headers: headers
                    };
                    strRequestPath = strProtocol + strHost + ":" + process.env.PORT + process.env.SERVER_ROOT_PATH;
                    strRequestPath = strRequestPath + "/system/security/authentication/logout";
                    return [4 /*yield*/, node_fetch_1["default"](strRequestPath, options)];
                case 2:
                    result = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    sourcePosition = CommonUtilities_1["default"].getSourceCodePosition(1);
                    sourcePosition.method = "server." + test_login.name;
                    strMark = "40FBD23995AB" + (cluster_1["default"].worker && cluster_1["default"].worker.id ? "-" + cluster_1["default"].worker.id : "");
                    debugMark = debug.extend(strMark);
                    debugMark("Error message: [%s]", error_2.message ? error_2.message : "No error message available");
                    debugMark("Error time: [%s]", SystemUtilities_1["default"].getCurrentDateAndTime().format(CommonConstants_1["default"]._DATE_TIME_LONG_FORMAT_01));
                    debugMark("Catched on: %O", sourcePosition);
                    debugMark("Error: %O", error_2);
                    result = error_2;
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, result];
            }
        });
    });
}
function test01_main() {
    return __awaiter(this, void 0, void 0, function () {
        var result, _a, _b, error_3, sourcePosition, strMark, debugMark;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, test_login(headers, "admin01@system.net", "admin1.123456.")];
                case 1:
                    result = _c.sent();
                    if (!(result &&
                        result.Code === 'SUCCESS_LOGIN')) return [3 /*break*/, 3];
                    jsonAuthorization = result;
                    strAuthorization = result.Data[0].Autorization;
                    strShortToken = result.Data[0].ShortToken;
                    headers.Authorization = strAuthorization;
                    result = test_logout(headers);
                    if (!(result &&
                        result.code === "SUCESS_LOGOUT")) return [3 /*break*/, 3];
                    _a = debug;
                    _b = ["Success all test"];
                    return [4 /*yield*/, result.json()];
                case 2:
                    _a.apply(void 0, _b.concat([_c.sent()]));
                    _c.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_3 = _c.sent();
                    sourcePosition = CommonUtilities_1["default"].getSourceCodePosition(1);
                    sourcePosition.method = "server." + test01_main.name;
                    strMark = "245186796724" + (cluster_1["default"].worker && cluster_1["default"].worker.id ? "-" + cluster_1["default"].worker.id : "");
                    debugMark = debug.extend(strMark);
                    debugMark("Error message: [%s]", error_3.message ? error_3.message : "No error message available");
                    debugMark("Error time: [%s]", SystemUtilities_1["default"].getCurrentDateAndTime().format(CommonConstants_1["default"]._DATE_TIME_LONG_FORMAT_01));
                    debugMark("Catched on: %O", sourcePosition);
                    debugMark("Error: %O", error_3);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports["default"] = test01_main;
test01_main();
