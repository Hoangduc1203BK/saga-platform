export const parseReqMiddleware = (req,res,next) => {
    const id = req.query.id;

    if(!id) {
        res.status(500).json('Invalid Request')
    }

    req.id = parseInt(id)
    next();
}