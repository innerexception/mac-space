import * as React from 'react';
import { onLogin } from './uiManager/Thunks'
import AppStyles from '../AppStyles';
import { Button, LightButton, TopBar } from './Shared'
import * as Ships from '../data/Ships'
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
   let shuttle = {...Ships.Shuttle, id:v4()}
   return {
        name,
        id: v4(),
        activeShipId: shuttle.id,
        ships:[shuttle],
        reputation:[],
        notoriety: 0
    }
}