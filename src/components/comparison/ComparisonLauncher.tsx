import { useSimulatedAsync } from '../../hooks/useSimulatedAsync'
import { getMockComparisonReport } from './mockComparisonData'
import ComparisonReviewModal from './ComparisonReviewModal'
import type { ComparisonReport, DecisionAction } from './comparisonTypes'
import type { TeamMember } from '../team/teamMembers'

interface ComparisonLauncherProps {
    isOpen: boolean
    onClose: () => void
    poNumber: string
    ackId: string
    /** Optional decision callback so the host can fire toasts / persist.
        Reviewer is set only when action === 'REQUEST_REVIEW' and the user
        picked a teammate from the AssignReviewerModal. */
    onDecision?: (report: ComparisonReport, action: DecisionAction, reviewer?: TeamMember) => void
}

/**
 * Glue between the kanban (which triggers a comparison) and the review modal.
 * Simulates the async compare → poll → report flow with a 2.5s setTimeout.
 */
export default function ComparisonLauncher({ isOpen, onClose, poNumber, ackId, onDecision }: ComparisonLauncherProps) {
    const { status, result } = useSimulatedAsync<ComparisonReport>({
        enabled: isOpen,
        resultFactory: () => getMockComparisonReport(poNumber, ackId),
        durationMs: 2500,
    })

    return (
        <ComparisonReviewModal
            isOpen={isOpen}
            onClose={onClose}
            processing={status !== 'completed'}
            report={result}
            onDecision={(action, reviewer) => {
                if (result) onDecision?.(result, action, reviewer)
                onClose()
            }}
        />
    )
}
