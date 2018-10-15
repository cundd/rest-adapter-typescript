import { Type } from '../../TypeDecorator';

export class CalendarEvent {
    public name: string;

    @Type(Date)
    public date: Date;
}
