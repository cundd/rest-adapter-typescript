import { ClassTypeOptions, ra, ra_property } from '../../TypeDecorator';

@ra(ClassTypeOptions.DenyUnknownFields)
export class CalendarEvent {
    @ra_property()
    public name: string;

    @ra_property(Date)
    public date: Date;
}
