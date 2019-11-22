import * as React from 'react';
import { ReactNode } from 'react';
import * as ReactDOM from 'react-dom';
import { AdapterConfiguration, ApiError, RestAdapter } from './index';
import { Entry } from './Tests/App/Entry';
import { EntryView } from './Tests/App/EntryView';
import { Util } from './Util';

interface AppProps {
    endpoint: string;
}

interface AppState {
    entries: Entry[];
    resource: string;
    error?: ApiError;
}

class App extends React.Component<AppProps, AppState> {
    private readonly restAdapter: RestAdapter;

    constructor(props: AppProps) {
        super(props);

        const search = (Util.parseUrl(props.endpoint) as any).search;
        const resource = search ? search.substr(1) : '';
        const requestSettings: RequestInit = {
            credentials: 'include'
        };
        this.restAdapter = new RestAdapter(AdapterConfiguration.fromUrl(props.endpoint, requestSettings));
        this.state = {
            entries: [],
            resource: resource,
        };
    }

    public render(): ReactNode {
        const entries = this.state.entries;

        return (
            <div className="test-app-container">
                {this.renderError()}
                {this.renderList(entries)}
            </div>
        );
    }

    public componentDidMount(): void {
        const promise = this.restAdapter.findAll<Entry>(this.state.resource);

        promise
            .then(instances => {
                this.setState({entries: instances});
            })
            .catch(error => {
                this.setState({error});
            });
    }

    private renderList(entries: Entry[]): ReactNode {
        if (entries.length === 0) {
            return null;
        }

        return <ul>{entries.map(entry => <EntryView key={entry.uid} entry={entry}/>)}</ul>;
    }

    private renderError(): ReactNode {
        const error = this.state.error;
        if (error) {
            return <div className="error-container">{error.message}</div>;
        }

        return null;
    }
}

(function (): void {
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
