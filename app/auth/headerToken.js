const axios = require('axios');

// add authentication token to headers
function addTokenToHeaders(req, res, next) {
    const token = req.cookies.token;
    if (token) {
        axios.defaults.headers.common['Authorization'] = token;
    }
    next();
}

module.exports = addTokenToHeaders;