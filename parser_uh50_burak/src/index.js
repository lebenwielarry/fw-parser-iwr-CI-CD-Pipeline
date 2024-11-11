const parseUH50 = require('./parser');

// Exporting the function to be used by other modules
module.exports = function (payload, meta) {
    return parseUH50(payload);
};
