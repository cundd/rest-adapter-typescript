import {Credentials} from './Credentials';

export interface EndpointInterface {
    hostname: string;
    protocol: string;
    port: number | undefined;
    path: string;
    credentials: Credentials | undefined;

    toString(): string;
}
