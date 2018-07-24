import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {AdapterConfiguration, RestAdapter} from './index';
import {Util} from './Util';

class Person {
    uid: string;
    firstName: string;
    lastName: string;
}

interface AppProps {
    endpoint: string;
}

interface AppState {
    nominees: Person[];
    resource: string;
}

class App extends React.Component<AppProps, AppState> {
    private readonly restAdapter: RestAdapter;

    constructor(props: AppProps) {
        super(props);

        /* tslint:disable */
        const search = (Util.parseUrl(props.endpoint) as any).search;
        const resource = search ? search.substr(1) : '';
        console.log(resource);
        this.restAdapter = new RestAdapter(AdapterConfiguration.fromUrl(props.endpoint));
        this.state = {
            nominees: [],
            resource: resource
        };
    }

    render() {
        const nominees = this.state.nominees;

        return (
            <div className="test-app-container">
                <ul>{nominees.map((nominee => <li key={nominee.uid}>{nominee.firstName} {nominee.lastName}</li>))}</ul>
            </div>
        );
    }

    componentDidMount() {
        const promise = this.restAdapter.findAll<Person>(this.state.resource);

        promise.then((instances) => {
            this.setState({nominees: instances});
        });
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
