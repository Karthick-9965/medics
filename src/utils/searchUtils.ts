import { DoctorItem } from '../constants/doctorsData';
import { HOSPITALS_DATA, HospitalItem } from '../constants/hospitalsData';

/**
 * Normalizes text by removing punctuation and extra spaces.
 */
function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Common generic words associated with medical facilities.
 */
const FACILITY_GENERIC_WORDS = new Set([
  'hospital',
  'hospitals',
  'clinic',
  'clinics',
  'medical',
  'center',
  'centre',
  'care',
  'health',
  'healthcare',
  'specialty',
  'speciality',
  'super',
  'memorial',
  'community',
]);

/**
 * Intelligent matcher for doctor search queries on Home screen and SeeAll.
 * Supports:
 * - Doctor name
 * - Doctor specialization
 * - Doctor hospital name (partial, full, or with "hospital" keyword, e.g. "apollo hospital", "city care hospital")
 * - Doctor about description
 * - Generic search terms like "hospital" or "clinic"
 * - Matching hospital names, departments, or locations from HOSPITALS_DATA
 */
export function matchesDoctorSearch(doctor: DoctorItem, query: string): boolean {
  if (!query || !query.trim()) return true;

  const rawQ = query.trim().toLowerCase();
  const normQ = normalize(query);
  const qWords = normQ.split(' ').filter(Boolean);

  if (qWords.length === 0) return true;

  const docName = (doctor.name || '').toLowerCase();
  const spec = (doctor.specialization || '').toLowerCase();
  const hosp = (doctor.hospital || '').toLowerCase();
  const about = (doctor.about || '').toLowerCase();

  const normDocName = normalize(doctor.name || '');
  const normSpec = normalize(doctor.specialization || '');
  const normHosp = normalize(doctor.hospital || '');
  const normAbout = normalize(doctor.about || '');

  // 1. Direct contains check
  if (
    docName.includes(rawQ) ||
    spec.includes(rawQ) ||
    hosp.includes(rawQ) ||
    about.includes(rawQ) ||
    normDocName.includes(normQ) ||
    normSpec.includes(normQ) ||
    normHosp.includes(normQ) ||
    normAbout.includes(normQ)
  ) {
    return true;
  }

  // 2. Generic terms check: "hospital", "clinic", "doctor", "specialist"
  if (
    ['hospital', 'hospitals', 'clinic', 'clinics', 'medical center', 'doctor', 'doctors'].includes(normQ)
  ) {
    return true;
  }

  // 3. Hospital name matching with multi-word terms (e.g. user typing "apollo hospital", "city care hospital", "grace hospital")
  if (doctor.hospital) {
    // Filter out purely generic words from user search query
    const specificQueryWords = qWords.filter((w) => !FACILITY_GENERIC_WORDS.has(w));

    // If query was e.g. "apollo hospital" -> specificQueryWords is ["apollo"]
    if (specificQueryWords.length > 0) {
      const allSpecificWordsInHospital = specificQueryWords.every((word) =>
        normHosp.includes(word)
      );
      if (allSpecificWordsInHospital) {
        return true;
      }

      // Check if specific words match doctor name or specialization
      const allSpecificWordsInDoctor = specificQueryWords.every(
        (word) => normDocName.includes(word) || normSpec.includes(word)
      );
      if (allSpecificWordsInDoctor) {
        return true;
      }
    }
  }

  // 4. Cross-reference with HOSPITALS_DATA
  // If the search query matches any hospital in the system, check if this doctor works there
  const matchingHospitals = HOSPITALS_DATA.filter((h) => matchesHospitalSearch(h, query));
  for (const h of matchingHospitals) {
    const normHName = normalize(h.name);
    if (normHosp.includes(normHName) || normHName.includes(normHosp)) {
      return true;
    }
    // Also match first prominent keyword of hospital (e.g. "apollo", "grace", "sunrise")
    const hFirstWord = normHName.split(' ')[0];
    if (hFirstWord && hFirstWord.length >= 3 && normHosp.includes(hFirstWord)) {
      return true;
    }
  }

  return false;
}

/**
 * Intelligent matcher for hospital search queries.
 */
export function matchesHospitalSearch(hospital: HospitalItem, query: string): boolean {
  if (!query || !query.trim()) return true;

  const rawQ = query.trim().toLowerCase();
  const normQ = normalize(query);
  const qWords = normQ.split(' ').filter(Boolean);

  if (qWords.length === 0) return true;

  const hName = (hospital.name || '').toLowerCase();
  const hAddr = (hospital.address || '').toLowerCase();
  const hType = (hospital.hospitalType || '').toLowerCase();
  const hDeps = (hospital.departments || []).map((d) => d.toLowerCase());

  const normHName = normalize(hospital.name || '');
  const normHAddr = normalize(hospital.address || '');

  // 1. Direct contains check
  if (
    hName.includes(rawQ) ||
    hAddr.includes(rawQ) ||
    hType.includes(rawQ) ||
    hDeps.some((dep) => dep.includes(rawQ)) ||
    normHName.includes(normQ) ||
    normHAddr.includes(normQ)
  ) {
    return true;
  }

  // 2. Generic keyword search
  const isGeneric = [
    'hospital',
    'hospitals',
    'clinic',
    'clinics',
    'emergency',
    'icu',
    'bed',
    'beds',
    'opd',
  ].includes(normQ);

  if (isGeneric) {
    return true;
  }

  // 3. Token-based matching: strip generic keywords
  const specificWords = qWords.filter((w) => !FACILITY_GENERIC_WORDS.has(w));
  if (specificWords.length > 0) {
    const allMatch = specificWords.every(
      (w) =>
        normHName.includes(w) ||
        normHAddr.includes(w) ||
        hType.includes(w) ||
        hDeps.some((dep) => dep.includes(w))
    );
    if (allMatch) {
      return true;
    }
  }

  return false;
}
