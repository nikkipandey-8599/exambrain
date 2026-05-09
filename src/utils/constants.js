export const DB_NAME = 'exambrain-db'
export const DB_VERSION = 1
export const MAX_CHARS = 15000
export const MIN_CHARS = 50
export const WARN_THRESHOLD = 0.9
export const MAX_FILE_SIZE = 1024 * 1024

export const DIFFICULTY = {
  easy: { label: 'Easy', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  hard: { label: 'Hard', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
}

export const SCORE_LABELS = [
  { min: 90, label: 'Excellent!', emoji: '🏆', color: '#22c55e' },
  { min: 70, label: 'Good Job', emoji: '👍', color: '#4f6ef7' },
  { min: 50, label: 'Keep Studying', emoji: '📚', color: '#f59e0b' },
  { min: 0,  label: 'Needs Work', emoji: '💪', color: '#ef4444' }
]

export const SAMPLE_NOTES = `The French Revolution (1789-1799)

The French Revolution was a period of radical political and societal transformation in France. It began with the Estates General of 1789 and ended with Napoleon Bonaparte's coup in November 1799.

Key Causes:
- Financial crisis: France was nearly bankrupt after supporting the American Revolution
- Social inequality: The Third Estate (98% of population) bore the tax burden while nobility were exempt
- Enlightenment ideas: Philosophers like Rousseau and Voltaire spread ideas of liberty and equality
- Food shortages: Bad harvests in 1788 caused bread prices to soar

Major Events:
1. Storming of the Bastille (July 14, 1789) - Symbol of royal tyranny, now French National Day
2. Declaration of the Rights of Man (August 1789) - Established liberty, equality, fraternity
3. Women's March on Versailles (October 1789) - Forced royal family to Paris
4. Execution of Louis XVI (January 21, 1793) - King guillotined at Place de la Revolution
5. Reign of Terror (1793-1794) - Robespierre led Committee of Public Safety; 17,000 executed
6. Thermidorian Reaction (1794) - Robespierre overthrown and executed

Key Figures:
- Maximilien Robespierre: Leader of Committee of Public Safety, architect of the Terror
- Jean-Paul Marat: Radical journalist, assassinated by Charlotte Corday
- Marie Antoinette: Queen, executed October 1793, symbol of royal excess
- Napoleon Bonaparte: Rose to power in aftermath, ended the Revolution with his coup

Legacy:
The Revolution abolished feudalism, established popular sovereignty, and spread nationalist and democratic ideals across Europe. The metric system was introduced. The Napoleonic Code influenced legal systems worldwide.`
