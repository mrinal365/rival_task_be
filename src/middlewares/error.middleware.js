// centralised error handling
const errorHandling = (err, req, res, next) => {
    console.log(err.stack);
    res.error({
        status: 500,
        message: "Something went wrong",
        error: err.message
    })

}

export default errorHandling