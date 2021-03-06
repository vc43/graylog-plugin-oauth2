/*
 * This file is part of Graylog Plugin Oauth.
 *
 * Graylog Plugin Oauth is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * Graylog Plugin Oauth is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Foobar. If not, see <https://www.gnu.org/licenses/>
 */

import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from "reflux";
import {Row, Col, Button, Alert} from "react-bootstrap";
import {Input} from "components/bootstrap";

import {DocumentTitle, PageHeader, Spinner} from "components/common";
import OAuth2Actions from "OAuth2Actions";
import OAuth2Store from "OAuth2Store";
import OAuth2GroupMapping from "OAuth2GroupMapping";


import StoreProvider from "injection/StoreProvider";

const RolesStore = StoreProvider.getStore("Roles");

import ObjectUtils from "util/ObjectUtils";

const OAuth2Configuration = createReactClass({
    displayName: 'OAuth2Configuration',
    mixins: [
        Reflux.connect(OAuth2Store),
    ],
    getInitialState() {
        return {
            showSettings: true,
        };
    },

    componentDidMount() {
        this.showSettings = true;
        OAuth2Actions.config();
        RolesStore.loadRoles().done((roles) => {
            this.setState({roles: roles.map((role) => role.name)});
        });
    },

    _toggleButton() {
        this.setState({showSettings: !this.state.showSettings});
    },

    _saveSettings(ev) {
        ev.preventDefault();
        OAuth2Actions.saveConfig(this.state.config);
    },

    _setSetting(attribute, value) {
        const newState = {};

        const settings = ObjectUtils.clone(this.state.config);
        settings[attribute] = value;
        newState.config = settings;
        this.setState(newState);
    },

    _bindChecked(ev, value) {
        this._setSetting(ev.target.name, typeof value === "undefined" ? ev.target.checked : value);
    },

    _bindValue(ev) {
        this._setSetting(ev.target.name, ev.target.value);
    },

    render() {
        const toggleButtonText = this.state.showSettings ? "Group Mapping" : "OAuth2 Settings";
        let content;
        if (!this.state.config) {
            content = <Spinner/>;
        } else {
            const roles = this.state.roles.map((role) => <option key={"default-group-" + role}
                                                                 value={role}>{role}</option>);
            content = (
                <Row>
                    <Col lg={8}>
                        <form id="oauth-config-form" className="form-horizontal" onSubmit={this._saveSettings}>
                            <fieldset>
                                <legend className="col-sm-12">1. Basic Configuration</legend>
                                <Input type="text" id="token_server_url" name="token_server_url"
                                       labelClassName="col-sm-3"
                                       wrapperClassName="col-sm-9" label="Token Server URL"
                                       value={this.state.config.token_server_url}
                                       help="Full application URL to get token authorization"
                                       onChange={this._bindValue} required/>

                                <Input type="text" id="data_server_url" name="data_server_url" labelClassName="col-sm-3"
                                       wrapperClassName="col-sm-9" label="User Data Server URL"
                                       value={this.state.config.data_server_url}
                                       help="Full application URL to get user data"
                                       onChange={this._bindValue} required/>

                                <Input type="text" id="redirect_url" name="redirect_url" labelClassName="col-sm-3"
                                       wrapperClassName="col-sm-9" label="Redirect URL"
                                       value={this.state.config.redirect_url}
                                       help="Redirect url to get token authorization"
                                       onChange={this._bindValue} required/>

                                <Input type="text" id="client_id" name="client_id" labelClassName="col-sm-3"
                                       wrapperClassName="col-sm-9" label="Client Id"
                                       value={this.state.config.client_id}
                                       onChange={this._bindValue} required/>

                                <Input type="text" id="client_secret" name="client_secret" labelClassName="col-sm-3"
                                       wrapperClassName="col-sm-9" label="Client Secret"
                                       value={this.state.config.client_secret}
                                       onChange={this._bindValue} required/>

                                <Input type="checkbox" label="Authorization in header"
                                       help="If you want to use Authorization in header."
                                       wrapperClassName="col-sm-offset-3 col-sm-9"
                                       checked={this.state.config.use_authorization}
                                       name="use_authorization"
                                       onChange={this._bindChecked}/>


                                <Input type="checkbox" label="Automatically create users"
                                       help="If checked, new users are automatically create in graylog if OAuth2 authentication ocurred successfuly. If unchecked, an administrator need to create user in graylog first."
                                       wrapperClassName="col-sm-offset-3 col-sm-9"
                                       checked={this.state.config.auto_create_user}
                                       name="auto_create_user"
                                       onChange={this._bindChecked}/>

                                <Input id="default_group" labelClassName="col-sm-3" wrapperClassName="col-sm-9"
                                       label="Default User Role"
                                       help="The default Graylog role determines whether a user created can access the entire system, or has limited access.">
                                    <Row>
                                        <Col sm={6}>
                                            <select id="default_group" name="default_group" className="form-control"
                                                    required
                                                    value={this.state.config.default_group || "Reader"}
                                                    onChange={this._bindValue}
                                                    disabled={!this.state.config.auto_create_user}>
                                                {roles}
                                            </select>
                                        </Col>
                                    </Row>
                                </Input>

                                <div className="form-group">
                                    <Col sm={9} smOffset={3}>
                                        <Button type="submit" bsStyle="success">Save</Button>
                                    </Col>
                                </div>
                            </fieldset>
                        </form>
                    </Col>
                </Row>
            );
        }
        const activeComponent = (this.state.showSettings ? content : <OAuth2GroupMapping/>);

        return (
            <DocumentTitle title="Oauth2">
        <span>
            <PageHeader title="Oauth2" subpage>
                <span>
                    This page is the only resource you need to set up the Graylog OAuth2 integration.
                </span>
                {null}
                <span>
                    <Button bsStyle="success" onClick={this._toggleButton}>{toggleButtonText}</Button>
                </span>
            </PageHeader>
            {activeComponent}
        </span>
            </DocumentTitle>
        );
    }

});

export default OAuth2Configuration;