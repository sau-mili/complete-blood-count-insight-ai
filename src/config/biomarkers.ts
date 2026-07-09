export interface BiomarkerMetadata {
  key: string;
  standardName: string;
  aliases: string[];
  unit: string;
  defaultRange: {
    male: [number, number];
    female: [number, number];
    general: [number, number];
  };
  description: string;
}

export const CBC_BIOMARKERS: Record<string, BiomarkerMetadata> = {
  HGB: {
    key: "HGB",
    standardName: "Hemoglobin",
    aliases: ["Hb", "Hgb", "Haemoglobin", "Hemoglobin (Hb)"],
    unit: "g/dL",
    defaultRange: { male: [13.2, 16.6], female: [11.6, 15.0], general: [12.0, 16.0] },
    description: "The iron-containing protein in red blood cells that carries oxygen to tissues."
  },
  RBC: {
    key: "RBC",
    standardName: "Red Blood Cell Count",
    aliases: ["RBC Count", "Erythrocyte Count", "Red Cell Count"],
    unit: "million/uL",
    defaultRange: { male: [4.35, 5.65], female: [3.92, 5.13], general: [4.00, 5.50] },
    description: "The total number of red blood cells in a given volume of blood."
  },
  WBC: {
    key: "WBC",
    standardName: "White Blood Cell Count",
    aliases: ["WBC Count", "Leukocyte Count", "Total Leukocyte Count", "TLC"],
    unit: "thousand/uL",
    defaultRange: { male: [3.4, 9.6], female: [3.4, 9.6], general: [4.0, 11.0] },
    description: "Cells of the immune system involved in defending the body against infectious disease."
  },
  PLT: {
    key: "PLT",
    standardName: "Platelets",
    aliases: ["Platelet Count", "Thrombocytes", "PLT Count"],
    unit: "thousand/uL",
    defaultRange: { male: [135, 317], female: [157, 371], general: [150, 450] },
    description: "Cell fragments vital for blood clotting and wound healing."
  },
  HCT: {
    key: "HCT",
    standardName: "Hematocrit",
    aliases: ["Packed Cell Volume", "PCV", "Hct"],
    unit: "%",
    defaultRange: { male: [38.3, 48.6], female: [35.5, 44.9], general: [36.0, 48.0] },
    description: "The volume percentage of red blood cells in blood."
  },
  MCV: {
    key: "MCV",
    standardName: "Mean Corpuscular Volume",
    aliases: ["Mean Cell Volume"],
    unit: "fL",
    defaultRange: { male: [80, 100], female: [80, 100], general: [80, 100] },
    description: "The average size of your red blood cells."
  },
  MCH: {
    key: "MCH",
    standardName: "Mean Corpuscular Hemoglobin",
    aliases: ["Mean Cell Hemoglobin"],
    unit: "pg",
    defaultRange: { male: [27, 33], female: [27, 33], general: [27, 33] },
    description: "The average amount of hemoglobin inside a single red blood cell."
  },
  MCHC: {
    key: "MCHC",
    standardName: "Mean Corpuscular Hemoglobin Concentration",
    aliases: ["Mean Cell Hemoglobin Concentration"],
    unit: "g/dL",
    defaultRange: { male: [32, 36], female: [32, 36], general: [32, 36] },
    description: "The average concentration of hemoglobin inside a single red blood cell."
  },
  RDW: {
    key: "RDW",
    standardName: "Red Cell Distribution Width",
    aliases: ["RDW-CV", "RDW-SD"],
    unit: "%",
    defaultRange: { male: [11.8, 14.5], female: [12.2, 16.1], general: [11.5, 15.0] },
    description: "A measure of the variation in volume and size of your red blood cells."
  }
};