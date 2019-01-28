export class WithPostConstruct {
    public value: string;

    public postConstruct() {
        this.value = 'initialized';
    }
}
