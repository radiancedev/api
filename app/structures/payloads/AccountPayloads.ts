import { Payload } from '../Payload';

export interface ActivateAccountPayload extends Payload {
    data: {
        user_id: string;
        activation_code: string;
    };
}
export interface LoginAccountPayload extends Payload {
    data: {
        login: string;
        password: string;
    };
}