import "babel-polyfill";
import 'normalize.css'
import "@blueprintjs/core/lib/css/blueprint.css"
import "@blueprintjs/icons/lib/css/blueprint-icons.css"
import { render } from 'react-dom'
import App from './client/App'
import * as React from 'react'

render(<App />, document.getElementById('appRoot'));