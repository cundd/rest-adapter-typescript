export interface LoggerInterface {
    log: (message: string, ...args: any[]) => void;
    debug: (message: string, ...args: any[]) => void;
}
