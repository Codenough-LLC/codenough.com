import React from 'react';
import { Form, FormGroup, Input, Label, Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';
import moment from 'moment';
import netlifyIdentity from 'netlify-identity-widget';

import * as clockifyApi from '../services/clockify-api';
import * as waveApi from '../services/wave-api';

class CreateInvoicePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            clockify: {
                workspaces: [],
                clients: [],
                tags: []
            },
            wave: {
                businesses: [],
                customers: [],
                products: []
            },
            isModalOpen: false,
            modalTitle: '',
            modalContent: [],
            isFormProcessing: false
        };
    }

    async componentDidMount() {
        this.setApiKeys();

        await this.loadClockifyCurrentUser();
        await this.loadClockifyWorkspaces();
        await this.loadWaveBusinesses();
    }

    setStateAsync = (newState) => new Promise((resolve) => this.setState(newState, resolve));

    setApiKeys() {
        const user = netlifyIdentity.currentUser();
        const userRoles = user['app_metadata'].roles;

        const clockifyApiKey = userRoles.find((role) => role.includes('clockify-api-key-')).replace('clockify-api-key-', '');
        const waveApiKey = userRoles.find((role) => role.includes('wave-api-key-')).replace('wave-api-key-', '');

        clockifyApi.setApiKey(clockifyApiKey);
        waveApi.setApiKey(waveApiKey);
    }

    async setClockifyState(state) {
        await this.setStateAsync({
            clockify: {
                ...this.state.clockify,
                ...state
            }
        });
    }

    async setWaveState(state) {
        await this.setStateAsync({
            wave: {
                ...this.state.wave,
                ...state
            }
        });
    }

    async loadClockifyCurrentUser() {
        const { id: currentUserId } = await clockifyApi.getCurrentUser();

        await this.setClockifyState({ currentUserId });
    }

    async loadClockifyWorkspaces() {
        const workspaces = await clockifyApi.getWorkspaces();

        await this.setClockifyState({ workspaces });
    }

    async loadClockifyClients() {
        const clients = await clockifyApi.getClients(this.state.clockify.workspaceId);

        await this.setClockifyState({ clients });
    }

    async loadClockifyTags() {
        const tags = await clockifyApi.getTags(this.state.clockify.workspaceId);

        await this.setClockifyState({ tags });
    }

    async loadWaveBusinesses() {
        const businesses = await waveApi.getBusinesses();

        await this.setWaveState({ businesses });
    }

    async loadWaveCustomers() {
        const customers = await waveApi.getCustomers(this.state.wave.businessId);

        await this.setWaveState({ customers });
    }

    async loadWaveProducts() {
        const products = await waveApi.getProducts(this.state.wave.businessId);

        await this.setWaveState({ products });
    }

    async clockifyWorkspaceChanged(workspaceId) {
        await this.setClockifyState({
            workspaceId,
            clients: [],
            tags: []
        });

        if (workspaceId) {
            this.loadClockifyClients();
            this.loadClockifyTags();
        }
    }

    async clockifyClientChanged(clientId) {
        await this.setClockifyState({ clientId });
    }

    async clockifyStartDateChanged(startDate) {
        await this.setClockifyState({ startDate });
    }

    async clockifyEndDateChanged(endDate) {
        await this.setClockifyState({ endDate });
    }

    async waveBusinessChanged(businessId) {
        await this.setWaveState({
            businessId,
            customers: [],
            products: []
        });

        if (businessId) {
            this.loadWaveCustomers();
            this.loadWaveProducts();
        }
    }

    async waveCustomerChanged(customerId) {
        await this.setWaveState({ customerId });
    }

    async waveProductChanged(productId) {
        await this.setWaveState({ productId });
    }

    addTotalHours(timeEntries) {
        return timeEntries.map((entry) => ({
            ...entry,
            totalHours: Number(moment(entry.timeInterval.end).diff(moment(entry.timeInterval.start), 'hours', true).toFixed(3))
        }));
    }

    filterToSelectedClient(timeEntries) {
        return timeEntries.filter((entry) => entry.project?.clientId === this.state.clockify.clientId);
    }

    filterToBillableAndNotBilled(timeEntries) {
        const billedTag = this.getBilledTag();

        return timeEntries.filter((entry) => entry.billable && !entry.tags.some((tag) => tag.id === billedTag.id));
    }

    getBilledTag() {
        return this.state.clockify.tags.find((tag) => tag.name.toLowerCase() === 'billed');
    }

    async markTimeEntriesAsBilled(timeEntries) {
        await Promise.all(
            timeEntries.map((entry) => clockifyApi.addTagToTimeEntry(this.state.clockify.workspaceId, entry.id, this.getBilledTag().id))
        );
    }

    validateForm() {
        if (!this.state.clockify.workspaceId) {
            return 'Please select a Clockify workspace';
        } else if (!this.state.clockify.clientId) {
            return 'Please select a Clockify client';
        } else if (!this.state.clockify.startDate) {
            return 'Please select a Clockify start date';
        } else if (!this.state.clockify.endDate) {
            return 'Please select an Clockify end date';
        } else if (!this.state.wave.businessId) {
            return 'Please select a Wave business';
        } else if (!this.state.wave.customerId) {
            return 'Please select a Wave customer';
        } else if (!this.state.wave.productId) {
            return 'Please select a Wave product';
        }

        return null;
    }

    async processForm() {
        const { workspaceId, currentUserId, startDate, endDate } = this.state.clockify;

        this.appendModalContent('Looking up time entries...');
        let timeEntries = await clockifyApi.getTimeEntries(workspaceId, currentUserId, startDate, endDate, true);

        this.appendModalContent('Filtering entries to selected client...');
        timeEntries = this.filterToSelectedClient(timeEntries);

        this.appendModalContent('Filtering entries to billable and not billed...');
        timeEntries = this.filterToBillableAndNotBilled(timeEntries);

        if (!timeEntries.length) {
            this.appendModalContent('No time entries were found!');

            return;
        }

        this.appendModalContent(`Found ${timeEntries.length} time entries`);

        this.appendModalContent('Calculating total hours from timestamps...');
        timeEntries = this.addTotalHours(timeEntries);

        const { businessId, customerId, productId } = this.state.wave;

        this.appendModalContent('Mapping entries to Wave format...');
        const invoiceItems = timeEntries.map((entry) => ({
            description: `${entry.description} - ${moment(entry.timeInterval.start).format('M/D/YY')} (${moment(entry.timeInterval.start).format('h:mm a')} - ${moment(entry.timeInterval.end).format('h:mm a')})`,
            quantity: entry.totalHours,
            productId
        }));

        this.appendModalContent('Creating invoice in Wave...');
        await waveApi.createInvoice(businessId, customerId, invoiceItems);
        this.appendModalContent('Invoice created');

        this.appendModalContent('Marking entries as billed in Clockify...');
        await this.markTimeEntriesAsBilled(timeEntries);
        this.appendModalContent('Entries marked as billed');

        this.appendModalContent('Done!');
    }

    async submitForm(event) {
        event.preventDefault();
        event.stopPropagation();

        const error = this.validateForm();

        if (error) {
            this.setState({
                modalTitle: 'Error in form',
                modalContent: [<Alert color="danger">{error}</Alert>]
            });
            this.toggleModal();

            return;
        }

        this.setState({
            isFormProcessing: true,
            modalTitle: 'Processing Invoice',
            modalContent: []
        });
        this.toggleModal();

        await this.processForm();

        this.setState({isFormProcessing: false});
    }

    appendModalContent(content) {
        const modalContent = [...this.state.modalContent];

        modalContent.push(<p key={content}>{content}</p>);

        this.setState({modalContent});
    }

    toggleModal() {
        if (this.state.isModalOpen) {
            this.setState({modalContent: []})
        }

        this.setState({isModalOpen: !this.state.isModalOpen});
    }

    render() {
        return (
            <div>
                <Form
                    onSubmit={(event) => this.submitForm(event)}
                >
                    <h4>{'Set Clockify Parameters'}</h4>

                    <FormGroup>
                        <Input
                            type="select"
                            onChange={(event) => this.clockifyWorkspaceChanged(event.target.value)}
                        >
                            <option value="">{'Select a workspace'}</option>
                            {this.state.clockify.workspaces.map((workspace) =>
                                <option
                                    key={workspace.id}
                                    value={workspace.id}
                                >
                                    {workspace.name}
                                </option>
                            )}
                        </Input>
                    </FormGroup>

                    <FormGroup>
                        <Input
                            type="select"
                            onChange={(event) => this.clockifyClientChanged(event.target.value)}
                        >
                            <option>{'Select a client'}</option>
                            {this.state.clockify.clients.map((client) =>
                                <option
                                    key={client.id}
                                    value={client.id}
                                >
                                    {client.name}
                                </option>
                            )}
                        </Input>
                    </FormGroup>

                    <FormGroup>
                        <Label>Start Date</Label>
                        <Input
                            type="date"
                            onChange={(event) => this.clockifyStartDateChanged(event.target.value)}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>End Date</Label>
                        <Input
                            type="date"
                            onChange={(event) => this.clockifyEndDateChanged(event.target.value)}
                        />
                    </FormGroup>

                    <h4>{'Set Wave Parameters'}</h4>

                    <FormGroup>
                        <Input
                            type="select"
                            onChange={(event) => this.waveBusinessChanged(event.target.value)}
                        >
                            <option>{'Select a business'}</option>
                            {this.state.wave.businesses.map((business) =>
                                <option
                                    key={business.id}
                                    value={business.id}
                                >
                                    {business.name}
                                </option>
                            )}
                        </Input>
                    </FormGroup>

                    <FormGroup>
                        <Input
                            type="select"
                            onChange={(event) => this.waveCustomerChanged(event.target.value)}
                        >
                            <option>{'Select a customer'}</option>
                            {this.state.wave.customers.map((customer) =>
                                <option
                                    key={customer.id}
                                    value={customer.id}
                                >
                                    {customer.name}
                                </option>
                            )}
                        </Input>
                    </FormGroup>

                    <FormGroup>
                        <Input
                            type="select"
                            onChange={(event) => this.waveProductChanged(event.target.value)}
                        >
                            <option>{'Select a product'}</option>
                            {this.state.wave.products.map((product) =>
                                <option
                                    key={product.id}
                                    value={product.id}
                                >
                                    {product.name}
                                </option>
                            )}
                        </Input>
                    </FormGroup>

                    <Button color="primary" disabled={this.state.isModalOpen}>Process Invoice</Button>
                </Form>
                <Modal isOpen={this.state.isModalOpen} toggle={() => !this.state.isFormProcessing && this.toggleModal()}>
                    <ModalHeader toggle={() => this.toggleModal()}>{this.state.modalTitle}</ModalHeader>
                    <ModalBody>
                        {this.state.modalContent}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => this.toggleModal()} disabled={this.state.isFormProcessing}>Close</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export default CreateInvoicePage;
