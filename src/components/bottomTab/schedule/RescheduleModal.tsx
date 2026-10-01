import React from 'react';
import AppointmentTimeModal, { AppointmentTimeModalProps } from './AppointmentTimeModal';

/**
 * RescheduleModal adapter for AppointmentTimeModal.
 */
export default function RescheduleModal(props: Omit<AppointmentTimeModalProps, 'mode'>) {
  return <AppointmentTimeModal {...props} mode="reschedule" />;
}
