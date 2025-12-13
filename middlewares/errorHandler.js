
export const notFoundHandler=(req,res,next)=>{
    const error=new Error(`Not found -${req.originalUrl}`);
    error.status=404;
    next(error);
};

export const errorHandler=(err,req,res,next)=>{
    console.error('Error:',err.message);
    const statusCode=err.status || 500;

    if(req.xhr || req.headers.accept?.includes('json')){
        return res.status(statusCode).json({
            success:false,
            message:err.message || 'something went wrong'
        });
    }

    res.status(statusCode).render('error',{
        statusCode,
        message:err.message || 'something went wrong',
        user:req.session?.user || null,
        filter: req.query?.filter || 'weekly' 
    })
}

