export function generateDoctorReply(
  userMessage: string,
  senderName: string,
  specialization: string
): string {
  const msg = userMessage.toLowerCase();
  const isClinic = senderName.toLowerCase().includes('clinic') ||
                   senderName.toLowerCase().includes('hospital') ||
                   senderName.toLowerCase().includes('helpdesk') ||
                   senderName.toLowerCase().includes('diagnostics');

  if (isClinic) {
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return `Hello! Welcome to ${senderName}. How can our clinical support team assist you today?`;
    }
    if (msg.includes('invoice') || msg.includes('bill') || msg.includes('receipt') || msg.includes('insurance')) {
      return `Your digital bill and insurance claim summaries are generated instantly. You can download them under Profile > Medical Records.`;
    }
    if (msg.includes('appointment') || msg.includes('book') || msg.includes('doctor') || msg.includes('slot')) {
      return `Our OPD and specialist consultation schedules are updated live. Please navigate to the Schedule tab or select a specialist from Top Doctors.`;
    }
    if (msg.includes('report') || msg.includes('test') || msg.includes('lab') || msg.includes('scan') || msg.includes('results')) {
      return `Your diagnostic lab test reports are verified by our chief pathologist and available in your health records.`;
    }
    if (msg.includes('emergency') || msg.includes('ambulance') || msg.includes('108') || msg.includes('sos')) {
      return `For immediate emergency dispatch, tap the 24/7 SOS Ambulance hotline button or dial 108 immediately.`;
    }
    if (msg.includes('thank') || msg.includes('ok') || msg.includes('okay')) {
      return `You're welcome! ${senderName} is dedicated to your health and well-being. Feel free to message us anytime.`;
    }
    return `Thank you for reaching out to ${senderName}. Our clinical desk will follow up shortly. For immediate emergency care, call 108.`;
  }

  // Doctor replies
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Hello! I'm ${senderName} (${specialization}). How can I assist you with your health today?`;
  }
  if (msg.includes('pain') || msg.includes('ache') || msg.includes('hurts')) {
    return 'I understand you are experiencing discomfort. Please describe the exact location, intensity (1-10), and whether it radiates to other areas.';
  }
  if (msg.includes('fever') || msg.includes('temperature') || msg.includes('hot')) {
    return 'For fever management, stay hydrated and monitor your temperature every 4 hours. If it exceeds 102°F, please take prescribed antipyretics and schedule a video consultation.';
  }
  if (msg.includes('prescription sheet') || msg.includes('prescription photo') || msg.includes('upload prescription') || msg.includes('attached prescription')) {
    return 'Thank you for uploading your prescription sheet. I have checked the medication details and dosage timings. Everything looks verified. Please follow the instructions and feel free to reach out if you have any questions.';
  }
  if (msg.includes('medicine') || msg.includes('tablet') || msg.includes('prescription') || msg.includes('dosage')) {
    return 'Please take your medications exactly as prescribed with food. Avoid skipping doses, and let me know if you experience any side effects.';
  }
  if (msg.includes('appointment') || msg.includes('visit') || msg.includes('book')) {
    return 'You can easily book or reschedule an appointment directly from the Schedule tab or doctor profile card.';
  }
  if (msg.includes('report') || msg.includes('test') || msg.includes('results')) {
    return 'Your diagnostic records look satisfactory. Please continue your recommended lifestyle routine and let me know if any new symptoms arise.';
  }
  if (msg.includes('thank') || msg.includes('ok') || msg.includes('okay')) {
    return "You're most welcome! Take good care of your health, and feel free to reach out anytime.";
  }

  return `Thank you for sharing. As your ${specialization}, I recommend monitoring your symptoms closely. If you need a comprehensive diagnosis, please launch a video call or book a follow-up.`;
}
