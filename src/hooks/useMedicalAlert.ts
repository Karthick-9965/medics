import { useState, useCallback } from 'react';
import { MedicalAlertModalProps } from '../components/modals/MedicalAlertModal';

export type MedicalAlertOptions = Omit<MedicalAlertModalProps, 'visible'>;

/**
 * Reusable hook to manage custom MedicalAlertModal state and presentation.
 * Reduces repeated boilerplate alert state across screens and components.
 */
export function useMedicalAlert() {
  const [alertConfig, setAlertConfig] = useState<MedicalAlertModalProps>({
    visible: false,
    title: '',
    message: '',
  });

  const showAlert = useCallback((options: MedicalAlertOptions) => {
    setAlertConfig({
      visible: true,
      primaryButtonText: options.primaryButtonText || 'OK',
      ...options,
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    alertConfig,
    showAlert,
    closeAlert,
  };
}
