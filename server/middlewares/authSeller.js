import jwt from 'jsonwebtoken';

const authSeller = async (req, res, next) => {
    const tokensToTry = [];

    if (req.headers.sellertoken) tokensToTry.push(req.headers.sellertoken);
    if (req.headers['sellertoken'] && !tokensToTry.includes(req.headers['sellertoken'])) {
        tokensToTry.push(req.headers['sellertoken']);
    }
    if (req.headers.token && !tokensToTry.includes(req.headers.token)) {
        tokensToTry.push(req.headers.token);
    }
    if (req.headers.authorization) {
        let authHeader = req.headers.authorization;
        let bearerToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        if (bearerToken && !tokensToTry.includes(bearerToken)) {
            tokensToTry.push(bearerToken);
        }
    }
    if (req.cookies?.sellerToken && !tokensToTry.includes(req.cookies.sellerToken)) {
        tokensToTry.push(req.cookies.sellerToken);
    }

    if (tokensToTry.length === 0) {
        return res.json({ success: false, message: 'Not Authorized' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'greencart_jwt_secret_key_2026';
    let isVerified = false;
    let lastError = null;

    for (const token of tokensToTry) {
        try {
            const tokenDecode = jwt.verify(token, jwtSecret);
            if (tokenDecode && tokenDecode.email === process.env.SELLER_EMAIL) {
                isVerified = true;
                break;
            }
        } catch (err) {
            lastError = err;
        }
    }

    if (isVerified) {
        return next();
    }

    return res.json({ success: false, message: lastError ? lastError.message : 'Not Authorized' });
};

export default authSeller;