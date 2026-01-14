export class BaseResponseDto<Data> {
    error: boolean;
    errorCode?: string;
    data?: Data;
    message?: string | string[];

    constructor(
        error: boolean,
        data?: Data,
        message?: string | string[],
        errorCode?: string,
    ) {
        this.error = error;
        this.data = data;
        this.message = message;
        this.errorCode = errorCode;
    }
}
