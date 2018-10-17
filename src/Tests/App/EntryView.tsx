import * as React from 'react';
import { Entry } from './Entry';

interface EntryProps<T> {
    entry: T;
}

interface EntryState {
    expanded: boolean
}

export class EntryView<T extends Entry> extends React.Component<EntryProps<T>, EntryState> {
    constructor(props: EntryProps<T>) {
        super(props);
        this.state = {expanded: false};
        this.handleClick = this.handleClick.bind(this);
    }

    public handleClick() {
        this.setState(state => ({
            expanded: !state.expanded
        }));
    }

    public render() {
        const headerProperties = [
            'title',
            'name',
            'firstName',
            'lastName',
        ];
        const contentProperties = [
            'content',
            'description',
            'teaser',
        ];

        const entry = this.props.entry;

        const title = this.collectData(entry, headerProperties);
        const content = this.collectData(entry, contentProperties);

        return <li key={entry.uid}>
            <header aria-expanded={this.state.expanded} aria-controls={'entry-' + entry.uid} onClick={this.handleClick}>
                #{entry.uid} {title.join(' ')}
            </header>
            <section id={'entry-' + entry.uid} aria-hidden={!this.state.expanded}>
                {content.join(' ')}
            </section>
        </li>;
    }

    private collectData(entry: T, properties: string[]): string[] {
        return properties.map(property => {
            if (typeof entry[property] !== 'undefined') {
                return entry[property];
            } else {
                return undefined;
            }
        }).filter((field: string | number | boolean | any) => {
            return typeof field === 'string' || typeof field === 'number' || typeof field === 'boolean';
        }).map(field => {
            return field.replace(/(<([^>]+)>)/ig, '');
        });
    }
}
