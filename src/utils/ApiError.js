class ApiError extends Error {
    constructor(
        statucCode,
        message="something went wrong!!!",
        errors=[],
        stack=""
    ){
        super(message)
        this.statucCode = statucCode
        this.data=null  
        this.message = message
        this.success = false
        this.errors = errors


        if (stack){
            this.stack = stack
        } else{
            Error.captureStackTrace(this , this.constructor)
        }
    }
}

export {ApiError}