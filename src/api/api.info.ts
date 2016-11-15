var pkginfo = require("pkginfo")(module);

var exports = require('../../package.json');

/**
 * InfoApi
 */
class InfoApi {
    static getVersion() : string {
        return exports.version;
    }
}