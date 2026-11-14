import type { Block, Reference } from '../src/lib/validation';
type SeedLesson = {
  title: string;
  slug: string;
  description: string;
  category: string;
  subtopic: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  readingMinutes: number;
  objectives: string[];
  blocks: Block[];
  takeaways: string[];
  references: Reference[];
};
const sodiumRef = {
  citation: 'NCBI Bookshelf. Hyponatremia (background reading; verify before publication).',
  url: 'https://www.ncbi.nlm.nih.gov/books/NBK470386/',
};
const qcRef = {
  citation: 'Westgard QC. Westgard rules (background reading; verify before publication).',
  url: 'https://www.westgard.com/westgard-rules',
};
const topics = [
  {
    title: 'Sodium: the story outside the cell',
    slug: 'sodium-homeostasis',
    category: 'electrolytes',
    subtopic: 'Sodium physiology',
    description:
      'Connect sodium, extracellular fluid and water balance before interpreting a number.',
    heading: 'Concentration tells a story about water',
    text: 'Sodium is the principal cation in extracellular fluid. A serum sodium concentration describes the relationship between exchangeable body solute and water; it does not, on its own, measure total body sodium or extracellular volume. Interpretation requires the clinical context and an assessment of tonicity.',
    takeaway: 'Interpret sodium alongside water balance, tonicity and clinical context.',
    ref: [sodiumRef],
  },
  {
    title: 'The sodium–potassium pump, explained',
    slug: 'sodium-potassium-atpase',
    category: 'electrolytes',
    subtopic: 'Membrane transport',
    description: 'See how active transport maintains the gradients that cells depend on.',
    heading: 'Moving against the gradient',
    text: 'The Na⁺/K⁺-ATPase uses energy from ATP hydrolysis to move three Na⁺ out of a cell and two K⁺ into it per transport cycle. This maintains transmembrane ion gradients. The pump is electrogenic because a net positive charge moves out of the cell.',
    takeaway: 'Each transport cycle moves 3 Na⁺ out and 2 K⁺ in, using one ATP.',
    ref: [],
  },
  {
    title: 'Direct vs indirect ion-selective electrodes',
    slug: 'direct-indirect-ise',
    category: 'analytical-techniques',
    subtopic: 'Ion-selective electrodes',
    description: 'Understand why the same specimen can produce different sodium results.',
    heading: 'The dilution step matters',
    text: 'Direct ion-selective electrodes analyse an undiluted sample; indirect systems include a dilution step. Markedly increased lipid or protein can reduce the plasma water fraction and produce an artefactually low sodium result with an indirect method. Interpret a discrepancy using the analytical method and the clinical context.',
    takeaway: 'Know whether the sodium method includes sample dilution.',
    ref: [sodiumRef],
  },
  {
    title: 'When low sodium is a measurement artefact',
    slug: 'pseudohyponatraemia',
    category: 'electrolytes',
    subtopic: 'Sodium interpretation',
    description: 'Separate an analytical artefact from a true disturbance of tonicity.',
    heading: 'A result is inseparable from its method',
    text: 'Pseudohyponatraemia is an artefact associated with some sodium measurement methods when the nonaqueous fraction of plasma is unusually large. Marked hyperlipidaemia or hyperproteinaemia can cause it with indirect ISE. Measured osmolality and a direct ISE measurement can help investigate a suspected artefact. Hyperglycaemic hyponatraemia is a distinct physiological process.',
    takeaway: 'Do not equate every low sodium result with hypotonicity.',
    ref: [sodiumRef],
  },
  {
    title: 'Haemolysis: more than a red specimen',
    slug: 'haemolysis-interference',
    category: 'preanalytical',
    subtopic: 'Specimen integrity',
    description: 'Explore cellular release and analytical interference as separate mechanisms.',
    heading: 'Two mechanisms to consider',
    text: 'Haemolysis may release intracellular constituents and may also interfere with an analytical reaction or optical measurement. Potassium can increase after in-vitro red-cell disruption. The direction and magnitude of an interference depend on the analyte, method and degree of haemolysis. Follow the laboratory’s validated interference policy and investigate the specimen context.',
    takeaway: 'Use analyte-specific and method-specific haemolysis limits.',
    ref: [],
  },
  {
    title: 'Spectrophotometry: from light to concentration',
    slug: 'spectrophotometry-fundamentals',
    category: 'analytical-techniques',
    subtopic: 'Optical methods',
    description: 'Build an intuitive picture of absorbance and the Beer–Lambert relationship.',
    heading: 'Measure the light that does not pass through',
    text: 'Absorbance expresses a logarithmic relationship between incident and transmitted light. In an appropriate linear range, absorbance is proportional to concentration and optical path length. Stray light, chemical effects and excessive concentration can cause departures from linearity. A blank helps account for background contributions.',
    takeaway: 'Proportionality between absorbance and concentration has conditions and limits.',
    ref: [],
  },
  {
    title: 'Sandwich and competitive immunoassays',
    slug: 'immunoassay-formats',
    category: 'analytical-techniques',
    subtopic: 'Immunoassays',
    description: 'Follow the binding steps to understand what the measured signal means.',
    heading: 'Start with the assay design',
    text: 'In a typical sandwich immunoassay, analyte is bound by capture and detection antibodies, and signal increases with analyte concentration within the working range. In a typical competitive assay, sample analyte competes for limited binding sites and the measured bound-label signal decreases as analyte increases. Actual signal processing and interference behaviour depend on the assay design.',
    takeaway: 'The binding format determines how to interpret the raw signal.',
    ref: [],
  },
  {
    title: 'Reading a Levey–Jennings chart',
    slug: 'levey-jennings-charts',
    category: 'quality-control',
    subtopic: 'Internal quality control',
    description: 'Turn control measurements into a picture of analytical performance.',
    heading: 'A view across analytical runs',
    text: 'A Levey–Jennings chart plots control measurements over time with a centre line and limits based on the established control mean and standard deviation. Look for random excursions, sustained shifts and other patterns. Use a validated QC plan rather than treating every point outside two standard deviations as an automatic rejection.',
    takeaway: 'Control charts describe the behaviour of control material over time.',
    ref: [qcRef],
  },
  {
    title: 'Westgard multirules: read the pattern',
    slug: 'westgard-multirules',
    category: 'quality-control',
    subtopic: 'QC interpretation',
    description: 'Recognise the distinction between a warning and a rejection rule.',
    heading: 'Combine rules within a defined plan',
    text: 'In the classic multirule approach, 1₂s is a warning to inspect other rules. A 1₃s rule detects one control result beyond a three-standard-deviation limit. The choice and combination of rules must suit the method, control design and quality requirement. Distinguish within-run comparisons from across-run comparisons.',
    takeaway: 'Apply the laboratory’s defined QC plan and investigate failures before reporting.',
    ref: [qcRef],
  },
  {
    title: 'Troponin I and T: understand the assay',
    slug: 'troponin-i-and-t',
    category: 'cardiac-biomarkers',
    subtopic: 'Cardiac troponins',
    description: 'Understand why cardiac troponin results need assay-specific interpretation.',
    heading: 'A biomarker result needs context',
    text: 'Cardiac troponin I and cardiac troponin T assays measure different proteins and are not numerically interchangeable. Interpret results with the assay-specific decision limit and clinical presentation. An elevated troponin indicates myocardial injury; diagnosing myocardial infarction requires additional evidence. Serial changes must be assessed using the validated pathway for the assay.',
    takeaway: 'Use the correct assay-specific pathway and clinical context.',
    ref: [],
  },
];
export const lessonSeeds: SeedLesson[] = topics.map((t, i) => ({
  title: t.title,
  slug: t.slug,
  description: t.description,
  category: t.category,
  subtopic: t.subtopic,
  difficulty: i % 3 === 0 ? 'INTERMEDIATE' : 'BEGINNER',
  readingMinutes: 4 + (i % 4),
  objectives: [
    `Explain the core principle of ${t.subtopic.toLowerCase()}.`,
    'Identify an analytical or interpretive limitation.',
  ],
  blocks: [
    { id: 'principle', type: 'text', heading: t.heading, text: t.text },
    {
      id: 'in-the-lab',
      type: 'callout',
      heading: 'Think like a laboratory scientist',
      text: 'Which details about the specimen, analytical method and clinical context would you need before interpreting this result? This AI-generated draft requires scientific review before publication.',
    },
    ...(t.slug === 'spectrophotometry-fundamentals'
      ? [
          {
            id: 'equation',
            type: 'equation' as const,
            latex: 'A = \\log_{10}(I_0/I) = \\varepsilon \\ell c',
          },
        ]
      : []),
  ],
  takeaways: [
    t.takeaway,
    'Reference intervals and decision limits depend on the method and intended use.',
  ],
  references: t.ref,
}));
type SeedQuestion = {
  text: string;
  options: string[];
  correct: number;
  explanation: string;
  category: string;
  lesson: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  subtopic?: string;
};
export const questionSeeds: SeedQuestion[] = [
  {
    text: 'Which ion is the principal cation of extracellular fluid?',
    options: ['Sodium (Na⁺)', 'Potassium (K⁺)', 'Magnesium (Mg²⁺)', 'Calcium (Ca²⁺)'],
    correct: 0,
    explanation:
      'Sodium is the principal extracellular cation. Potassium predominates inside cells. This distribution helps explain the relationship between sodium, water balance and extracellular fluid.',
    category: 'electrolytes',
    lesson: 'sodium-homeostasis',
    difficulty: 'BEGINNER',
  },
  {
    text: 'What is the net transport per cycle of the Na⁺/K⁺-ATPase?',
    options: [
      '3 Na⁺ out and 2 K⁺ in',
      '2 Na⁺ out and 3 K⁺ in',
      '3 Na⁺ in and 2 K⁺ out',
      'Equal numbers of Na⁺ and K⁺ move out',
    ],
    correct: 0,
    explanation:
      'One ATP-powered cycle exports three sodium ions and imports two potassium ions. The unequal movement of positive charges makes the pump electrogenic.',
    category: 'electrolytes',
    lesson: 'sodium-potassium-atpase',
    difficulty: 'BEGINNER',
  },
  {
    text: 'Which sodium method measures an undiluted specimen?',
    options: [
      'Direct ion-selective electrode',
      'Indirect ion-selective electrode',
      'A method defined by a dilution step',
      'All sodium methods require dilution',
    ],
    correct: 0,
    explanation:
      'Direct ISE measures an undiluted specimen. Indirect ISE includes dilution, which makes its reported result susceptible to changes in the nonaqueous fraction of plasma.',
    category: 'analytical-techniques',
    lesson: 'direct-indirect-ise',
    difficulty: 'BEGINNER',
  },
  {
    text: 'Which intracellular constituent may increase after in-vitro haemolysis?',
    options: [
      'Potassium',
      'Sodium always decreases to zero',
      'All analytes decrease equally',
      'Only plasma water changes',
    ],
    correct: 0,
    explanation:
      'Red cells contain a higher potassium concentration than plasma. Their disruption can increase the potassium measured in a specimen. Interpret the haemolysis index and follow the laboratory policy.',
    category: 'preanalytical',
    lesson: 'haemolysis-interference',
    difficulty: 'BEGINNER',
  },
  {
    text: 'Within the valid linear range, absorbance is proportional to which quantity?',
    options: [
      'Analyte concentration at fixed path length',
      'The inverse of concentration in every method',
      'Specimen volume regardless of method',
      'The square of incident light intensity',
    ],
    correct: 0,
    explanation:
      'The Beer–Lambert relationship is A = εℓc. At fixed wavelength and path length, absorbance is proportional to concentration, subject to the chemical and instrumental limitations of the method.',
    category: 'analytical-techniques',
    lesson: 'spectrophotometry-fundamentals',
    difficulty: 'BEGINNER',
  },
  {
    text: 'In a typical sandwich immunoassay, how does signal change as analyte increases within the working range?',
    options: [
      'Signal increases',
      'Signal always decreases',
      'Signal is independent of binding',
      'Signal must remain exactly zero',
    ],
    correct: 0,
    explanation:
      'In a typical sandwich design, more analyte allows more capture–analyte–detection complexes to form, increasing signal within the working range. Interferences and high-dose effects depend on assay design.',
    category: 'analytical-techniques',
    lesson: 'immunoassay-formats',
    difficulty: 'BEGINNER',
  },
  {
    text: 'What is plotted on a Levey–Jennings chart?',
    options: [
      'Control measurements across runs or time',
      'Only patient diagnoses',
      'A universal reference interval for all patients',
      'Only instrument maintenance dates',
    ],
    correct: 0,
    explanation:
      'The chart displays control results against a mean and standard-deviation limits over time. It helps reveal changes in analytical performance and supports interpretation within a defined QC plan.',
    category: 'quality-control',
    lesson: 'levey-jennings-charts',
    difficulty: 'BEGINNER',
  },
  {
    text: 'In the classic Westgard multirule approach, which rule is primarily a warning?',
    options: ['1₂s', '1₃s', '2₂s', 'R₄s'],
    correct: 0,
    explanation:
      'The classic 1₂s rule warns that one control exceeds a two-standard-deviation limit and prompts inspection for other rules. QC plans differ; use the defined procedure for the method.',
    category: 'quality-control',
    lesson: 'westgard-multirules',
    difficulty: 'BEGINNER',
  },
  {
    text: 'Which circumstance can cause pseudohyponatraemia with an indirect ISE method?',
    options: [
      'Markedly increased plasma lipids',
      'A direct ISE measurement by definition',
      'An isolated low potassium result',
      'Every decrease in extracellular fluid volume',
    ],
    correct: 0,
    explanation:
      'Marked lipid or protein elevation can reduce the water fraction of plasma. Indirect ISE methods assume a normal fraction during dilution and reporting, allowing an artefactually low sodium result.',
    category: 'electrolytes',
    lesson: 'pseudohyponatraemia',
    difficulty: 'INTERMEDIATE',
  },
  {
    text: 'Why is a sodium concentration alone insufficient to determine extracellular volume?',
    options: [
      'It reflects solute relative to water rather than total sodium stores alone',
      'It directly measures the whole extracellular volume',
      'It measures potassium stores instead',
      'It is independent of water balance',
    ],
    correct: 0,
    explanation:
      'Concentration is a ratio. A sodium concentration must be interpreted with water balance, tonicity and clinical volume assessment rather than being treated as a direct measure of total body sodium.',
    category: 'electrolytes',
    lesson: 'sodium-homeostasis',
    difficulty: 'INTERMEDIATE',
  },
  {
    text: 'Why is the Na⁺/K⁺-ATPase described as electrogenic?',
    options: [
      'Each cycle exports one net positive charge',
      'Each cycle moves no net charge',
      'It exchanges only neutral molecules',
      'It hydrolyses no ATP',
    ],
    correct: 0,
    explanation:
      'Three positive sodium ions move out while two positive potassium ions move in. The net transfer is one positive charge outward per cycle.',
    category: 'electrolytes',
    lesson: 'sodium-potassium-atpase',
    difficulty: 'INTERMEDIATE',
  },
  {
    text: 'A lipaemic sample has low sodium by indirect ISE. What analytical comparison can help investigate an artefact?',
    options: [
      'Sodium measured by direct ISE',
      'An unrelated enzyme result alone',
      'Repeating only the same dilution without further investigation',
      'Replacing the result with a guessed value',
    ],
    correct: 0,
    explanation:
      'A direct ISE does not use the dilution step associated with the electrolyte exclusion artefact. Compare methods alongside measured osmolality and clinical context; do not substitute an unverified result.',
    category: 'analytical-techniques',
    lesson: 'direct-indirect-ise',
    difficulty: 'INTERMEDIATE',
  },
  {
    text: 'Which statement about haemolysis interference is most appropriate?',
    options: [
      'Its magnitude and direction depend on the analyte and method',
      'It affects every assay identically',
      'A visual assessment replaces validated limits',
      'It can only cause falsely low values',
    ],
    correct: 0,
    explanation:
      'Haemolysis can release cellular constituents and interfere with reactions or optical measurements. Effects differ by analyte and method, so validated assay-specific limits are needed.',
    category: 'preanalytical',
    lesson: 'haemolysis-interference',
    difficulty: 'INTERMEDIATE',
  },
  {
    text: 'What is a key purpose of an appropriate blank in a spectrophotometric method?',
    options: [
      'Account for background contributions',
      'Remove every possible interference',
      'Guarantee linearity at any concentration',
      'Eliminate the need for calibration',
    ],
    correct: 0,
    explanation:
      'A blank helps account for background absorbance from relevant components. It does not guarantee specificity, remove all interferences or replace appropriate calibration and method verification.',
    category: 'analytical-techniques',
    lesson: 'spectrophotometry-fundamentals',
    difficulty: 'INTERMEDIATE',
  },
  {
    text: 'In a typical competitive immunoassay, increasing sample analyte has what effect on bound-label signal?',
    options: [
      'It decreases the signal',
      'It always doubles the signal',
      'It creates a sandwich complex in every design',
      'It has no relation to competition',
    ],
    correct: 0,
    explanation:
      'Sample analyte competes with labelled material for limited binding sites. More sample analyte typically means less bound label and a lower bound-label signal. Consult the specific assay design.',
    category: 'analytical-techniques',
    lesson: 'immunoassay-formats',
    difficulty: 'INTERMEDIATE',
  },
  {
    text: 'A cardiac troponin result exceeds its assay-specific decision limit. What does this alone establish?',
    options: [
      'Myocardial injury, requiring clinical assessment of the cause',
      'Myocardial infarction in every patient',
      'Interchangeability with every other troponin assay',
      'The exact time of symptom onset',
    ],
    correct: 0,
    explanation:
      'An elevated cardiac troponin indicates myocardial injury. Myocardial infarction requires additional evidence of ischaemia and appropriate assessment of change and clinical context.',
    category: 'cardiac-biomarkers',
    lesson: 'troponin-i-and-t',
    difficulty: 'INTERMEDIATE',
  },
  {
    text: 'Which interpretation best distinguishes hyperglycaemic hyponatraemia from pseudohyponatraemia?',
    options: [
      'Hyperglycaemia can redistribute water; pseudohyponatraemia is an analytical artefact',
      'Both are always caused by the same dilution artefact',
      'Hyperglycaemia affects sodium only by increasing plasma lipids',
      'Neither requires assessment of tonicity',
    ],
    correct: 0,
    explanation:
      'Hyperglycaemia can cause translocational hyponatraemia through osmotic water movement. Pseudohyponatraemia arises from an analytical effect related to plasma water fraction in susceptible methods.',
    category: 'electrolytes',
    lesson: 'pseudohyponatraemia',
    difficulty: 'ADVANCED',
  },
  {
    text: 'A control result exceeds the mean plus 3 SD. Which rule describes this finding?',
    options: [
      '1₃s',
      '1₂s alone as the final interpretation',
      '10x',
      'A patient reference-interval rule',
    ],
    correct: 0,
    explanation:
      'The 1₃s rule refers to a single control result beyond either three-standard-deviation limit. Follow the laboratory QC plan to reject, investigate and resolve the failure before affected reporting.',
    category: 'quality-control',
    lesson: 'westgard-multirules',
    difficulty: 'ADVANCED',
  },
  {
    text: 'Why should cardiac troponin I and T results not be treated as numerically interchangeable?',
    options: [
      'They measure different proteins using assay-specific calibration and limits',
      'Their units can never be the same',
      'Only one can be a cardiac biomarker',
      'Every assay uses an identical decision limit',
    ],
    correct: 0,
    explanation:
      'Troponin I and T are distinct proteins, and assays differ in calibration and analytical characteristics. Use assay-specific limits and validated serial assessment pathways.',
    category: 'cardiac-biomarkers',
    lesson: 'troponin-i-and-t',
    difficulty: 'ADVANCED',
  },
  {
    text: 'A sustained change in control values appears on a Levey–Jennings chart. What is the best next step?',
    options: [
      'Evaluate the pattern using the defined QC plan and investigate analytical causes',
      'Assume the patient population changed',
      'Ignore the pattern if one patient result looks plausible',
      'Change the mean immediately without investigation',
    ],
    correct: 0,
    explanation:
      'Control material monitors the analytical process. A sustained change may reflect a shift in that process and requires investigation under the laboratory QC procedure before resetting limits or releasing affected results.',
    category: 'quality-control',
    lesson: 'levey-jennings-charts',
    difficulty: 'ADVANCED',
  },
];
