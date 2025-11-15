export interface CharValue {
  id: number;
  value: string;
}

// Bu model, API'den gelen her bir ana karakteristik objesini temsil eder.
// (örn: "Mobil Data Kotası" veya "PTSN No")
export interface Characteristic {
  id: number;
  description: string;
  unitOfMeasure: string;
  charValues: CharValue[];
  required: boolean;
}