#!/usr/bin/env bash
# Bisect helper: finds which commit on `main` (post-merge) hangs the Vercel
# Production build. The build itself completes locally for every commit, so
# `git bisect run` cannot detect it — we have to push each candidate to a
# Vercel-watched test branch and observe the dashboard.
#
# Usage:
#   bash scripts/bisect-deploy.sh next       # push the next candidate
#   bash scripts/bisect-deploy.sh good       # mark current as good (deployed OK)
#   bash scripts/bisect-deploy.sh bad        # mark current as hanging
#   bash scripts/bisect-deploy.sh status     # show progress
#   bash scripts/bisect-deploy.sh reset      # abort and restore main
#
# The candidate commits (oldest → newest) are the 7 commits that diverge
# from smart-comparator-v2 plus the merge and the optimization on top:
#
#   ff2315f  rename Discrepancy → Inconsistency
#   d57070f  Create Record modal with preflight validation
#   54cbada  refactor create-record modal polish
#   bebf403  pipeline expansion — In-progress, Deprecated, assignment
#   9add36e  stepper active step brand lime
#   bd9e8e5  single-column modal with 2-col field grid
#   d926320  OCR refinements — Document Conversion + deprecation modal
#   ea59cc7  merge smart-comparator-v2 into main
#   44242a7  perf(build): split vendors + drop unused deps
#
# We binary-search by pushing one of these to `bisect-test` branch, waiting
# for Vercel, and recording the result.

set -euo pipefail

CANDIDATES=(
    "ff2315f"
    "d57070f"
    "54cbada"
    "bebf403"
    "9add36e"
    "bd9e8e5"
    "d926320"
    "ea59cc7"
    "44242a7"
)
STATE_FILE=".bisect-state"
TEST_BRANCH="bisect-test"

cmd=${1:-status}

load_state() {
    if [[ -f "$STATE_FILE" ]]; then
        # shellcheck disable=SC1090
        source "$STATE_FILE"
    else
        LO=0
        HI=$((${#CANDIDATES[@]} - 1))
        CURRENT=$(( (LO + HI) / 2 ))
    fi
}

save_state() {
    cat > "$STATE_FILE" <<EOF
LO=$LO
HI=$HI
CURRENT=$CURRENT
EOF
}

push_current() {
    local sha=${CANDIDATES[$CURRENT]}
    echo "─────────────────────────────────────────────"
    echo "  Pushing candidate: $sha (idx $CURRENT, range [$LO, $HI])"
    echo "─────────────────────────────────────────────"
    git push origin "+$sha:refs/heads/$TEST_BRANCH"
    echo
    echo "Now watch Vercel for branch '$TEST_BRANCH'."
    echo "Run 'bash $0 good' if it deploys (<2 min)."
    echo "Run 'bash $0 bad' if it hangs (>5 min)."
}

case "$cmd" in
    next)
        load_state
        push_current
        save_state
        ;;
    good)
        load_state
        echo "✓ Marked ${CANDIDATES[$CURRENT]} as GOOD."
        LO=$((CURRENT + 1))
        if [[ $LO -gt $HI ]]; then
            echo "Bisect done. The earliest BAD commit was at index $((CURRENT + 1)) or this commit was the last good one."
            echo "Inspect: git show ${CANDIDATES[$LO]:-HEAD}"
            exit 0
        fi
        CURRENT=$(( (LO + HI) / 2 ))
        save_state
        push_current
        ;;
    bad)
        load_state
        echo "✗ Marked ${CANDIDATES[$CURRENT]} as BAD."
        HI=$((CURRENT - 1))
        if [[ $LO -gt $HI ]]; then
            echo "Bisect done. The first BAD commit is: ${CANDIDATES[$((HI + 1))]}"
            echo "Inspect:  git show ${CANDIDATES[$((HI + 1))]}"
            echo "Files:    git diff-tree --no-commit-id --name-only -r ${CANDIDATES[$((HI + 1))]}"
            exit 0
        fi
        CURRENT=$(( (LO + HI) / 2 ))
        save_state
        push_current
        ;;
    status)
        load_state
        echo "Range: [$LO, $HI]   Current: $CURRENT (${CANDIDATES[$CURRENT]})"
        ;;
    reset)
        rm -f "$STATE_FILE"
        git push origin --delete "$TEST_BRANCH" 2>/dev/null || true
        echo "Reset done."
        ;;
    *)
        echo "Usage: $0 {next|good|bad|status|reset}"
        exit 1
        ;;
esac
