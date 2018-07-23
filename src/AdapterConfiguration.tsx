export interface Credentials {
    username: string;
    password: string;
}

export default interface AdapterConfiguration {
    endpoint: URL;
    credentials?: Credentials;
}
