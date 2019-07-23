import * as React from 'react';
import { onLogin } from './uiManager/Thunks'
import AppStyles from '../AppStyles';
import { Button, LightButton, TopBar } from './Shared'
import { v4 } from 'uuid'

export default class Login extends React.Component {
    state = {}

    render(){
        return (
            <div style={AppStyles.window}>
                {TopBar('MacSpace')}
                <div style={{padding:'0.5em'}}>
                    <div>
                        {Button(true, ()=>onLogin(getUser('Dick Army'), v4()), 'Ok')}
                    </div>
                </div>
            </div>
        )
    }
}

const getUser = (name:string) => {
   return {
        name,
        id: v4(),
        activeShipId: '',
        ships:[],
        reputation:[],
        notoriety: 0
    }
}

const styles = {
    loginInput: {
        boxShadow: 'none',
        border: '1px solid',
        minWidth:'10em'
    }
}