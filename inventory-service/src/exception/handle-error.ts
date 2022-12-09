export function HttpErrorHandler(err, req, res, next) {
    res.status(400).send({
        error: err.message,
    });
}