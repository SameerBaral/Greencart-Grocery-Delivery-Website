import jwt from 'jsonwebtoken';

const authSeller = async (req, res, next) =>{
    let sellerToken = req.cookies?.sellerToken || req.headers.sellertoken || req.headers['sellertoken'] || req.headers.token || req.headers['token'];

    if (!sellerToken && req.headers.authorization) {
        if (req.headers.authorization.startsWith('Bearer ')) {
            sellerToken = req.headers.authorization.split(' ')[1];
        } else {
            sellerToken = req.headers.authorization;
        }
    }

    if(!sellerToken) {
        return res.json({ success: false, message: 'Not Authorized' });
    }

    try {
        const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET)
        if(tokenDecode.email === process.env.SELLER_EMAIL){
            next();
        }else{
            return res.json({ success: false, message: 'Not Authorized' });
        }
        
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export default authSeller;