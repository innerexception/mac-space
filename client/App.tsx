import * as React from 'react';
import UIStateContainer from './components/uiManager/UIStateContainer';
import './App.css';
import { createStore, applyMiddleware } from 'redux'
import appReducer from '../client/components/uiManager/UIManagerReducer'
import { Provider } from 'react-redux'
const thunkMiddleware = require('redux-thunk')
import WS from './WebsocketClient'
export const server = new WS()

let store = createStore(appReducer, applyMiddleware(
    thunkMiddleware // lets us dispatch() functions
))

export const dispatch = store.dispatch

class App extends React.Component {
    render(){
        return (
            <Provider store={store}>
                <UIStateContainer />
            </Provider>
        );
    }
};

export default App