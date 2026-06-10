export const DB_NAME = 'exambrain-db'
export const DB_VERSION = 1

export const MAX_CHARS = 30000
export const MIN_CHARS = 50
export const WARN_THRESHOLD = 0.85

// 50 MB
export const MAX_FILE_SIZE = 50 * 1024 * 1024

export const DIFFICULTY = {
  easy: {
    label: 'Easy',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)'
  },
  medium: {
    label: 'Medium',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)'
  },
  hard: {
    label: 'Hard',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)'
  }
}

export const SCORE_LABELS = [
  { min: 90, label: 'Excellent!', emoji: '🏆', color: '#22c55e' },
  { min: 70, label: 'Good Job', emoji: '👍', color: '#4f6ef7' },
  { min: 50, label: 'Keep Studying', emoji: '📚', color: '#f59e0b' },
  { min: 0, label: 'Needs Work', emoji: '💪', color: '#ef4444' }
]

export const SAMPLE_NOTES = `Cell Biology — Lecture Notes

Cell Theory:
All living organisms are made of cells. The cell is the basic structural and functional unit of life. All cells come from pre-existing cells (Virchow, 1855).

Types of Cells:

Prokaryotic Cells:
- No membrane-bound nucleus; DNA is in the nucleoid region
- Smaller (1–10 μm), simpler structure
- Examples: Bacteria, Archaea
- Has cell wall (peptidoglycan in bacteria), ribosomes (70S), plasma membrane
- No membrane-bound organelles

Eukaryotic Cells:
- Has membrane-bound nucleus containing DNA
- Larger (10–100 μm), complex structure
- Examples: Animals, Plants, Fungi, Protists
- Contains membrane-bound organelles

Key Organelles:
- Nucleus: Contains DNA, site of transcription; has nuclear envelope with pores
- Mitochondria: ATP production via cellular respiration; has double membrane; own DNA
- Ribosome: Protein synthesis; 80S in eukaryotes, 70S in prokaryotes
- Endoplasmic Reticulum: Rough ER has ribosomes, makes proteins; Smooth ER makes lipids
- Golgi Apparatus: Modifies, packages and ships proteins; cis face receives, trans face ships
- Lysosome: Contains digestive enzymes; breaks down waste
- Vacuole: Storage; large central vacuole in plant cells for turgor pressure
- Chloroplast: Photosynthesis in plants; has thylakoids and stroma; own DNA
- Cell Wall: Rigid structure outside plasma membrane; cellulose in plants, chitin in fungi

Cell Membrane:
- Phospholipid bilayer (fluid mosaic model — Singer & Nicolson, 1972)
- Selectively permeable
- Contains proteins (integral and peripheral), cholesterol, glycoproteins

Transport:
- Passive (no ATP): Diffusion, osmosis, facilitated diffusion
- Active (requires ATP): Sodium-potassium pump, endocytosis, exocytosis

Cell Division:
- Mitosis: PMAT — Prophase, Metaphase, Anaphase, Telophase → 2 identical daughter cells
- Meiosis: Two divisions → 4 haploid gametes; increases genetic diversity
- Interphase: G1 (growth), S (DNA synthesis), G2 (prep for division)

Plant vs Animal Cells:
Plant cells have: cell wall, chloroplasts, large central vacuole, plasmodesmata
Animal cells have: centrioles, lysosomes, smaller or no vacuole`
