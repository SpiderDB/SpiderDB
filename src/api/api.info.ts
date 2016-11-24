var packageExports = require('../../package.json');

/**
 * InfoApi
 */
export class InfoApi {
    static getVersion() : string {
        return packageExports.version;
    }
}