import React from 'react';
import AppointmentTimeModal, { AppointmentTimeModalProps } from './AppointmentTimeModal';

/**
 * RebookModal adapter for AppointmentTimeModal.
 */
export default function RebookModal(props: Omit<AppointmentTimeModalProps, 'mode'>) {
  return <AppointmentTimeModal {...props} mode="rebook" />;
}
