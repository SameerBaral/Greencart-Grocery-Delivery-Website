import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    const tokensToTry = [];

    // 1. Check header 'token'
    if (req.headers.token) tokensToTry.push(req.headers.token);
    if (req.headers['token'] && !tokensToTry.includes(req.headers['token'])) {
        tokensToTry.push(req.headers['token']);
    }

    // 2. Check header 'authorization' (Bearer token)
    if (req.headers.authorization) {
        let authHeader = req.headers.authorization;
        let bearerToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        if (bearerToken && !tokensToTry.includes(bearerToken)) {
            tokensToTry.push(bearerToken);
        }
    }

    // 3. Check body 'token'
    if (req.body && req.body.token && !tokensToTry.includes(req.body.token)) {
        tokensToTry.push(req.body.token);
    }

    // 4. Check cookie 'token'
    if (req.cookies?.token && !tokensToTry.includes(req.cookies.token)) {
        tokensToTry.push(req.cookies.token);
    }

    if (tokensToTry.length === 0) {
        return res.json({ success: false, message: 'Not Authorized' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'greencart_jwt_secret_key_2026';
    let verifiedUserId = null;
    let lastError = null;

    for (const token of tokensToTry) {
        try {
            const tokenDecode = jwt.verify(token, jwtSecret);
            if (tokenDecode && tokenDecode.id) {
                verifiedUserId = tokenDecode.id;
                break;
            }
        } catch (err) {
            lastError = err;
        }
    }

    if (verifiedUserId) {
        if (!req.body) req.body = {};
        req.body.userId = verifiedUserId;
        req.userId = verifiedUserId;
        return next();
    }

    return res.json({ success: false, message: lastError ? lastError.message : 'Not Authorized' });
};

export default authUser;