export const SUBJECT_LIBRARY = [
  {
    id: 'french-revolution',
    subject: 'History',
    topic: 'The French Revolution',
    emoji: '⚔️',
    preview: 'Causes, key events, major figures, and legacy of the 1789–1799 revolution.',
    notes: `The French Revolution (1789-1799)\n\nThe French Revolution was a period of radical political and societal transformation in France. It began with the Estates General of 1789 and ended with Napoleon Bonaparte's coup in November 1799.\n\nKey Causes:\n- Financial crisis: France was nearly bankrupt after supporting the American Revolution\n- Social inequality: The Third Estate (98% of population) bore the tax burden while nobility were exempt\n- Enlightenment ideas: Philosophers like Rousseau and Voltaire spread ideas of liberty and equality\n- Food shortages: Bad harvests in 1788 caused bread prices to soar\n\nMajor Events:\n1. Storming of the Bastille (July 14, 1789) - Symbol of royal tyranny, now French National Day\n2. Declaration of the Rights of Man (August 1789) - Established liberty, equality, fraternity\n3. Women's March on Versailles (October 1789) - Forced royal family to Paris\n4. Execution of Louis XVI (January 21, 1793) - King guillotined at Place de la Revolution\n5. Reign of Terror (1793-1794) - Robespierre led Committee of Public Safety; 17,000 executed\n6. Thermidorian Reaction (1794) - Robespierre overthrown and executed\n\nKey Figures:\n- Maximilien Robespierre: Leader of Committee of Public Safety, architect of the Terror\n- Jean-Paul Marat: Radical journalist, assassinated by Charlotte Corday\n- Marie Antoinette: Queen, executed October 1793, symbol of royal excess\n- Napoleon Bonaparte: Rose to power in aftermath, ended the Revolution with his coup\n\nLegacy:\nThe Revolution abolished feudalism, established popular sovereignty, and spread nationalist and democratic ideals across Europe. The metric system was introduced. The Napoleonic Code influenced legal systems worldwide.`
  },
  {
    id: 'photosynthesis',
    subject: 'Biology',
    topic: 'Photosynthesis',
    emoji: '🌿',
    preview: 'Light reactions, Calvin cycle, chloroplasts, and factors affecting rate.',
    notes: `Photosynthesis\n\nPhotosynthesis is the process by which plants convert light energy into chemical energy stored as glucose.\n\nOverall Equation:\n6CO2 + 6H2O + light energy → C6H12O6 + 6O2\n\nLocation:\n- Thylakoid membranes: Light-dependent reactions\n- Stroma: Calvin Cycle (light-independent)\n\nStage 1 - Light-Dependent Reactions:\n- Chlorophyll absorbs light\n- Water molecules split (photolysis): 2H2O → 4H+ + 4e- + O2\n- ATP and NADPH produced\n- Oxygen released as byproduct\n\nStage 2 - Calvin Cycle:\n- CO2 fixed by RuBisCO enzyme\n- Uses ATP and NADPH\n- Produces G3P → glucose\n- Regenerates RuBP\n\nFactors Affecting Rate:\n1. Light intensity\n2. CO2 concentration\n3. Temperature (optimal 25-35°C)\n4. Water availability\n\nChlorophyll Types:\n- Chlorophyll a: Primary pigment, absorbs red (700nm) and blue (430nm)\n- Chlorophyll b: Accessory pigment\n- Carotenoids: Yellow/orange, absorb blue-green light`
  },
  {
    id: 'newtons-laws',
    subject: 'Physics',
    topic: "Newton's Laws of Motion",
    emoji: '⚙️',
    preview: 'All three laws, applications, momentum, friction, and problem-solving.',
    notes: `Newton's Laws of Motion\n\nFirst Law — Law of Inertia:\nAn object at rest stays at rest and an object in motion stays in motion unless acted upon by an unbalanced force.\n\nSecond Law:\nF = ma (Force = mass × acceleration)\n- F in Newtons, m in kg, a in m/s²\n\nThird Law — Action-Reaction:\nFor every action there is an equal and opposite reaction.\nExamples: rocket propulsion, walking, swimming\n\nMomentum:\np = mv\nConservation of momentum: total momentum unchanged in closed system\nImpulse = F × t = change in momentum\n\nFriction:\n- Static friction: prevents motion\n- Kinetic friction: opposes sliding\n- f = μN (μ = coefficient of friction, N = normal force)\n\nWeight vs Mass:\n- Mass: amount of matter (kg), constant\n- Weight: gravitational force W = mg, varies with gravity`
  },
  {
    id: 'python-basics',
    subject: 'Computer Science',
    topic: 'Python Programming Basics',
    emoji: '🐍',
    preview: 'Variables, data types, control flow, functions, OOP, and common libraries.',
    notes: `Python Programming Basics\n\nCore Data Types:\n- int, float, str, bool\n- list: ordered, mutable [1, 2, 3]\n- tuple: ordered, immutable (1, 2, 3)\n- dict: key-value {"name": "Alice"}\n- set: unique values {1, 2, 3}\n\nControl Flow:\nif x > 0:\n    print("positive")\n\nfor i in range(5):\n    print(i)\n\nwhile condition:\n    break / continue\n\nFunctions:\ndef greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"\n\nLambda: square = lambda x: x**2\n\nList Comprehensions:\nsquares = [x**2 for x in range(10)]\n\nOOP:\nclass Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return f"{self.name} speaks"\n\nclass Dog(Animal):\n    def speak(self):\n        return f"{self.name} barks"\n\nOOP Concepts: Encapsulation, Inheritance, Polymorphism, Abstraction\n\nCommon Libraries:\nos, sys, math, random, datetime, json, requests, numpy, pandas`
  },
  {
    id: 'organic-chemistry',
    subject: 'Chemistry',
    topic: 'Organic Chemistry Basics',
    emoji: '⚗️',
    preview: 'Carbon bonding, functional groups, hydrocarbons, isomers, and reactions.',
    notes: `Organic Chemistry Basics\n\nCarbon forms 4 covalent bonds — can make single, double, and triple bonds.\n\nHydrocarbons:\n- Alkanes (CnH2n+2): single bonds, saturated. Methane CH4, Ethane C2H6\n- Alkenes (CnH2n): double bond, unsaturated. Ethene C2H4. Decolourise bromine water.\n- Alkynes (CnH2n-2): triple bond. Ethyne C2H2\n\nFunctional Groups:\n- -OH: alcohols (ethanol C2H5OH)\n- -COOH: carboxylic acids (ethanoic acid)\n- -CHO: aldehydes\n- -CO-: ketones (propanone)\n- -NH2: amines\n- -X: halides\n\nIsomers:\n- Structural: different connectivity\n- Geometric: cis/trans around double bond\n- Optical: mirror images (chiral centres)\n\nKey Reactions:\n- Addition: alkene + reagent → single product\n- Substitution: one group replaced\n- Elimination: atoms removed, double bond forms\n- Condensation: two molecules join, water lost\n- Hydrolysis: water breaks a bond`
  },
  {
    id: 'cell-biology',
    subject: 'Biology',
    topic: 'Cell Structure & Function',
    emoji: '🔬',
    preview: 'Prokaryotes vs eukaryotes, organelles, membrane transport, and cell division.',
    notes: `Cell Structure and Function\n\nProkaryotic Cells:\n- No membrane-bound nucleus, smaller (1-10 μm)\n- Examples: bacteria, archaea\n- DNA in nucleoid region\n\nEukaryotic Cells:\n- Membrane-bound nucleus, larger (10-100 μm)\n- Examples: animals, plants, fungi\n\nKey Organelles:\n- Nucleus: control center, contains DNA\n- Mitochondria: ATP production, site of cellular respiration\n- Rough ER: protein synthesis (has ribosomes)\n- Smooth ER: lipid synthesis, detoxification\n- Golgi Apparatus: modifies, packages, ships proteins\n- Ribosomes: protein synthesis\n\nCell Membrane:\n- Phospholipid bilayer, selectively permeable\n- Fluid mosaic model (Singer & Nicolson, 1972)\n\nTransport:\n- Passive: diffusion, osmosis, facilitated diffusion (no ATP)\n- Active: requires ATP, moves against gradient\n\nCell Division:\n- Mitosis: PMAT — 2 identical daughter cells\n- Meiosis: 4 haploid gametes`
  },
]

export function getLibraryBySubject() {
  const grouped = {}
  SUBJECT_LIBRARY.forEach(item => {
    if (!grouped[item.subject]) grouped[item.subject] = []
    grouped[item.subject].push(item)
  })
  return grouped
}
