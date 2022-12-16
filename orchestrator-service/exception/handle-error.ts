export const enum HttpStatusCodes {
    BadRequest = 400,
    Unauthorized = 401,
    NotFound = 404,
    MethodNotAllowed = 405,
}

export class HttpError extends Error {
    constructor(message: string, private __httpStatusCode: number) {
        super(message);
    }

    HttpStatusCode() {
        return this.__httpStatusCode;
    }
}

export function HttpErrorHandler(err, req, res, next) {
    res.status(404).send({
        error: err.message,
    });
}