export enum PayloadType {
    ActivateAccount = "ACTIVATE_ACCOUNT",
    LoginAccount = "LOGIN_ACCOUNT",
}

export interface Payload {
    type: PayloadType;
    data: any;
}