//script para redirecionar user sempre que tentar aceder a páginas e não tiver token, ou não for válido
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies?.token
    if (!token) {
        console.error('Token inexistent');
        return res.redirect('/login');
    }
    try {
        const decoded = jwt.verify(token, 'Proj_ruas');
        req.user = decoded.userId;
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        return res.redirect('/login');
    }
};

module.exports = authMiddleware;