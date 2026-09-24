import jwt from 'jsonwebtoken';

const authUser = async (req, res, next)=>{
    let token = req.cookies.token || req.headers.token || req.headers['token'];

    if (!token && req.headers.authorization) {
        if (req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        } else {
            token = req.headers.authorization;
        }
    }

    if (!token && req.body && req.body.token) {
        token = req.body.token;
    }

    if(!token){
        return res.json({ success: false, message: 'Not Authorized' });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
        if(tokenDecode.id){
            if (!req.body) {
                req.body = {};
            }
            req.body.userId = tokenDecode.id;
            req.userId = tokenDecode.id;
        }else{
            return res.json({ success: false, message: 'Not Authorized' });
        }
        next();

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export default authUser;