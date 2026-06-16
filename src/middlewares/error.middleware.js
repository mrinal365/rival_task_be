// centralised error handling
const errorHandling = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";

    res.status(statusCode).json({
        status: statusCode,
        message,
        ...(process.env.NODE_ENV === 'development' && { error: err.stack })
    });
};

export default errorHandling;