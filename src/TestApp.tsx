import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {AdapterConfiguration, RestAdapter} from './index';
import {Util} from './Util';
import {ApiError} from './ApiError';

class Person {
    uid: string;
    firstName: string;
    lastName: string;
}

interface AppProps {
    endpoint: string;
}

interface AppState {
    persons: Person[];
    resource: string;
    error?: ApiError;
}

class App extends React.Component<AppProps, AppState> {
    private readonly restAdapter: RestAdapter;

    constructor(props: AppProps) {
        super(props);

        /* tslint:disable */
        const search = (Util.parseUrl(props.endpoint) as any).search;
        const resource = search ? search.substr(1) : '';
        const requestSettings: RequestInit = {
            credentials: 'include'
        };
        this.restAdapter = new RestAdapter(AdapterConfiguration.fromUrl(props.endpoint, requestSettings));
        this.state = {
            persons: [],
            resource: resource,
        };
    }

    render() {
        const persons = this.state.persons;

        return (
            <div className="test-app-container">
                {this.getError()}
                {this.getPersonsList(persons)}
            </div>
        );
    }

    componentDidMount() {
        const promise = this.restAdapter.findAll<Person>(this.state.resource);

        promise
            .then(instances => {
                this.setState({persons: instances});
            })
            .catch(error => {
                console.warn(error);
                this.setState({error})
            });
    }

    private getPersonsList(persons: Person[]) {
        if (persons.length === 0) {
            return undefined;
        }

        return (
            <ul>
                {persons.map((person => <li key={person.uid}>#{person.uid} {person.firstName} {person.lastName}</li>))}
            </ul>
        );
    }

    private getError() {
        const error = this.state.error;
        if (error) {
            return <div className="error-container">{error.message}</div>;
        }

        return undefined;
    }
}

(function () {
    const location = window.location;
    const endpoint = location.hash ? location.hash.substr(1) : '';

    if (endpoint) {
        ReactDOM.render(
            <App endpoint={endpoint}/>,
            document.getElementById('root') as HTMLElement
        );
    } else {
        const bo = '{';
        const bc = '}';
        ReactDOM.render(
            <div>
                <p>Please add the REST URL and resource type to your URL</p>
                <pre>{location.toString()}#{bo}server{bc}/rest/?{bo}Resource-Type{bc}</pre>
                <pre>{location.toString()}#protocol://rest-server/rest/?Resource-Type</pre>
            </div>,
            document.getElementById('root') as HTMLElement
        );
    }
})();
