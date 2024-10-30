const notFound =(req, res, next)=>{
    const error = new Error(`Not: ${req.originalUrl}`);
    res.status(404);
    next(error)
}

const errorhandler =(err, req, res, next)=>{
    const statuscode = res.statuscode == 200 ? 500 : res.statusCode;
    res.status(statuscode);
    res.json({
        message:err?.message,
        stack: err?.stack
    })
}


module.exports ={
    notFound, 
    errorhandler
}