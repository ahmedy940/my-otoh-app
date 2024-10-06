import React, { useState } from 'react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { Modal } from '@shopify/app-bridge/actions';
import { TextField, Button, Select } from '@shopify/polaris';

export default function CreateCampaignModal({ active, onClose, onSubmit }) {
  const app = useAppBridge();

  // Initialize modal with App Bridge
  const modal = Modal.create(app, {
    title: 'Create New Campaign',
    message: 'Complete the form below to create a new campaign.',
    primaryAction: {
      content: 'Create',
      onAction: () => handleSubmit(),
    },
    secondaryActions: [
      {
        content: 'Cancel',
        onAction: () => onClose(),
      },
    ],
  });

  // Manage form state
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal submission handler
  const handleSubmit = () => {
    if (name && objective && budget && startDate && endDate) {
      onSubmit({ name, objective, budget, startDate, endDate });
      modal.close();  // Close modal on submit
    }
  };

  // Open the App Bridge Modal when the component mounts
  if (active) {
    modal.dispatch(Modal.Action.OPEN);
  }

  return (
    <div>
      <TextField label="Campaign Name" value={name} onChange={setName} />
      <Select
        label="Objective"
        options={['Awareness', 'Traffic', 'Conversions']}
        value={objective}
        onChange={setObjective}
      />
      <TextField label="Budget" type="number" value={budget} onChange={setBudget} />
      <TextField label="Start Date" type="date" value={startDate} onChange={setStartDate} />
      <TextField label="End Date" type="date" value={endDate} onChange={setEndDate} />

      {/* Action Buttons */}
      <Button primary onClick={handleSubmit}>
        Create
      </Button>
      <Button onClick={() => modal.dispatch(Modal.Action.CLOSE)}>
        Cancel
      </Button>
    </div>
  );
}
