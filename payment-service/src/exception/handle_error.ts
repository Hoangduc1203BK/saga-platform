export function HttpErrorHandler(err, req, res, next) {
    if (err && typeof err.HttpStatusCode === "function") {
        const message = err.message;
        res.status(err.HttpStatusCode() || 500).json({
            error: message,
        });
        return;
    }
    res.status(500).send({
        error: "internal server error",
    });
}