export class WithPostConstruct {
    public value: string;

    public postConstruct(): void {
        this.value = 'initialized';
    }
}
