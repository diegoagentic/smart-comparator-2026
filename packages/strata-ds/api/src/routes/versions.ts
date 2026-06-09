import { Router, Request, Response } from 'express';

const router = Router();

interface Version {
  version: string; // semver: MAJOR.MINOR.PATCH
  releaseDate: string;
  status: 'draft' | 'published' | 'deprecated';
  changelog: ChangelogEntry[];
  breakingChanges: BreakingChange[];
  deprecations: Deprecation[];
  components: ComponentVersion[];
  downloadUrl?: string;
}

interface ChangelogEntry {
  id: string;
  type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
  componentId?: string;
  componentName?: string;
  description: string;
  impact: 'major' | 'minor' | 'patch';
  author?: string;
  timestamp: string;
}

interface BreakingChange {
  componentId: string;
  componentName: string;
  description: string;
  migrationGuide: string;
  before: string; // Code example before
  after: string; // Code example after
}

interface Deprecation {
  componentId: string;
  componentName: string;
  deprecatedIn: string; // version
  removedIn: string; // version
  reason: string;
  alternative: string;
}

interface ComponentVersion {
  id: string;
  name: string;
  version: string;
  hash: string; // Content hash for cache invalidation
}

// In-memory version store (in production, use database)
const versions: Version[] = [
  {
    version: '1.0.0',
    releaseDate: '2024-01-01T00:00:00Z',
    status: 'published',
    changelog: [
      {
        id: 'cl_001',
        type: 'added',
        componentName: 'Button',
        description: 'Initial button component with all variants',
        impact: 'minor',
        timestamp: '2024-01-01T00:00:00Z',
      },
    ],
    breakingChanges: [],
    deprecations: [],
    components: [],
  },
];

/**
 * GET ALL VERSIONS
 * Returns list of all versions with metadata
 */
router.get('/', (req: Request, res: Response) => {
  const { status, limit = 20 } = req.query;

  let filtered = [...versions];

  if (status) {
    filtered = filtered.filter(v => v.status === status);
  }

  // Sort by version descending
  filtered.sort((a, b) => compareVersions(b.version, a.version));

  // Limit results
  filtered = filtered.slice(0, Number(limit));

  return res.json({
    versions: filtered,
    total: filtered.length,
    latest: filtered.find(v => v.status === 'published'),
  });
});

/**
 * GET SPECIFIC VERSION
 * Returns detailed information about a specific version
 */
router.get('/:version', (req: Request, res: Response) => {
  const { version } = req.params;

  const versionData = versions.find(v => v.version === version);

  if (!versionData) {
    return res.status(404).json({
      error: 'Version not found',
      version,
    });
  }

  return res.json(versionData);
});

/**
 * GET LATEST VERSION
 * Returns the latest published version
 */
router.get('/latest/info', (req: Request, res: Response) => {
  const latestVersion = versions
    .filter(v => v.status === 'published')
    .sort((a, b) => compareVersions(b.version, a.version))[0];

  if (!latestVersion) {
    return res.status(404).json({
      error: 'No published version found',
    });
  }

  return res.json(latestVersion);
});

/**
 * COMPARE VERSIONS
 * Returns diff between two versions
 */
router.get('/compare/:from/:to', (req: Request, res: Response) => {
  const { from, to } = req.params;

  const fromVersion = versions.find(v => v.version === from);
  const toVersion = versions.find(v => v.version === to);

  if (!fromVersion || !toVersion) {
    return res.status(404).json({
      error: 'One or both versions not found',
    });
  }

  // Calculate differences
  const diff = {
    from: from,
    to: to,
    changeType: getChangeType(from, to),
    changelog: toVersion.changelog.filter(entry => {
      // Only include changes after 'from' version
      return true; // Simplified - in production, filter by timestamp
    }),
    breakingChanges: toVersion.breakingChanges,
    deprecations: toVersion.deprecations,
    componentsAdded: [],
    componentsModified: [],
    componentsRemoved: [],
  };

  return res.json(diff);
});

/**
 * GET MIGRATION GUIDE
 * Returns migration guide from one version to another
 */
router.get('/migrate/:from/:to', (req: Request, res: Response) => {
  const { from, to } = req.params;

  const fromVersion = versions.find(v => v.version === from);
  const toVersion = versions.find(v => v.version === to);

  if (!fromVersion || !toVersion) {
    return res.status(404).json({
      error: 'One or both versions not found',
    });
  }

  const migrationGuide = {
    from,
    to,
    difficulty: getMigrationDifficulty(fromVersion, toVersion),
    estimatedTime: getEstimatedMigrationTime(fromVersion, toVersion),
    steps: generateMigrationSteps(fromVersion, toVersion),
    breakingChanges: toVersion.breakingChanges,
    deprecations: toVersion.deprecations,
    codemods: [], // Automated code transformation scripts
    testingChecklist: generateTestingChecklist(fromVersion, toVersion),
  };

  return res.json(migrationGuide);
});

/**
 * CREATE NEW VERSION
 * Creates a new version (admin only)
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { version, changelog, breakingChanges, deprecations } = req.body;

    if (!version) {
      return res.status(400).json({ error: 'Version is required' });
    }

    // Validate semver format
    if (!isValidSemver(version)) {
      return res.status(400).json({ error: 'Invalid semver format' });
    }

    // Check if version already exists
    if (versions.find(v => v.version === version)) {
      return res.status(409).json({ error: 'Version already exists' });
    }

    const newVersion: Version = {
      version,
      releaseDate: new Date().toISOString(),
      status: 'draft',
      changelog: changelog || [],
      breakingChanges: breakingChanges || [],
      deprecations: deprecations || [],
      components: [],
    };

    versions.push(newVersion);

    return res.status(201).json({
      success: true,
      version: newVersion,
    });

  } catch (error) {
    console.error('[Create Version] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUBLISH VERSION
 * Publishes a draft version (admin only)
 */
router.post('/:version/publish', (req: Request, res: Response) => {
  const { version } = req.params;

  const versionData = versions.find(v => v.version === version);

  if (!versionData) {
    return res.status(404).json({ error: 'Version not found' });
  }

  if (versionData.status === 'published') {
    return res.status(400).json({ error: 'Version already published' });
  }

  versionData.status = 'published';
  versionData.releaseDate = new Date().toISOString();

  // Trigger notifications to subscribers
  notifySubscribers(versionData);

  return res.json({
    success: true,
    version: versionData,
    message: 'Version published successfully',
  });
});

/**
 * DEPRECATE VERSION
 * Marks a version as deprecated (admin only)
 */
router.post('/:version/deprecate', (req: Request, res: Response) => {
  const { version } = req.params;
  const { reason, alternative } = req.body;

  const versionData = versions.find(v => v.version === version);

  if (!versionData) {
    return res.status(404).json({ error: 'Version not found' });
  }

  versionData.status = 'deprecated';

  // Add deprecation notice
  console.log(`Version ${version} deprecated. Reason: ${reason}, Alternative: ${alternative}`);

  return res.json({
    success: true,
    version: versionData,
    message: 'Version deprecated successfully',
  });
});

/**
 * CHECK FOR UPDATES
 * Checks if there are updates available for a given version
 */
router.post('/check-updates', (req: Request, res: Response) => {
  const { currentVersion, components } = req.body;

  if (!currentVersion) {
    return res.status(400).json({ error: 'Current version is required' });
  }

  const latestVersion = versions
    .filter(v => v.status === 'published')
    .sort((a, b) => compareVersions(b.version, a.version))[0];

  if (!latestVersion) {
    return res.status(404).json({ error: 'No published version found' });
  }

  const hasUpdate = compareVersions(latestVersion.version, currentVersion) > 0;

  if (!hasUpdate) {
    return res.json({
      hasUpdate: false,
      currentVersion,
      latestVersion: latestVersion.version,
      message: 'You are using the latest version',
    });
  }

  const updateInfo = {
    hasUpdate: true,
    currentVersion,
    latestVersion: latestVersion.version,
    changeType: getChangeType(currentVersion, latestVersion.version),
    breakingChanges: latestVersion.breakingChanges.length > 0,
    affectedComponents: getAffectedComponents(components, latestVersion),
    migrationGuideUrl: `/api/versions/migrate/${currentVersion}/${latestVersion.version}`,
    changelog: latestVersion.changelog,
  };

  return res.json(updateInfo);
});

// Helper Functions

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (parts1[i] > parts2[i]) return 1;
    if (parts1[i] < parts2[i]) return -1;
  }

  return 0;
}

function isValidSemver(version: string): boolean {
  const semverRegex = /^(\d+)\.(\d+)\.(\d+)$/;
  return semverRegex.test(version);
}

function getChangeType(from: string, to: string): 'major' | 'minor' | 'patch' {
  const fromParts = from.split('.').map(Number);
  const toParts = to.split('.').map(Number);

  if (toParts[0] > fromParts[0]) return 'major';
  if (toParts[1] > fromParts[1]) return 'minor';
  return 'patch';
}

function getMigrationDifficulty(from: Version, to: Version): 'easy' | 'medium' | 'hard' {
  const hasBreakingChanges = to.breakingChanges.length > 0;
  const changeType = getChangeType(from.version, to.version);

  if (hasBreakingChanges && changeType === 'major') return 'hard';
  if (hasBreakingChanges) return 'medium';
  return 'easy';
}

function getEstimatedMigrationTime(from: Version, to: Version): string {
  const breakingChangesCount = to.breakingChanges.length;
  
  if (breakingChangesCount === 0) return '< 1 hour';
  if (breakingChangesCount <= 3) return '1-4 hours';
  return '1-2 days';
}

function generateMigrationSteps(from: Version, to: Version): any[] {
  const steps = [
    {
      step: 1,
      title: 'Review changelog',
      description: `Review changes from ${from.version} to ${to.version}`,
      required: true,
    },
    {
      step: 2,
      title: 'Update package version',
      description: `Update @strata-ds/components to ${to.version}`,
      command: `npm install @strata-ds/components@${to.version}`,
      required: true,
    },
  ];

  if (to.breakingChanges.length > 0) {
    steps.push({
      step: 3,
      title: 'Apply breaking changes',
      description: 'Update components with breaking changes',
      required: true,
    });
  }

  steps.push({
    step: steps.length + 1,
    title: 'Test application',
    description: 'Run tests and verify functionality',
    required: true,
  });

  return steps;
}

function generateTestingChecklist(from: Version, to: Version): any[] {
  return [
    { item: 'Run unit tests', checked: false },
    { item: 'Run integration tests', checked: false },
    { item: 'Visual regression testing', checked: false },
    { item: 'Accessibility testing', checked: false },
    { item: 'Browser compatibility testing', checked: false },
  ];
}

function getAffectedComponents(components: string[], version: Version): string[] {
  // In production, compare component hashes to determine affected components
  return components.filter(c => 
    version.changelog.some(entry => entry.componentName === c)
  );
}

function notifySubscribers(version: Version): void {
  console.log(`[Notification] Notifying subscribers about version ${version.version}`);
  
  // In production, send notifications via:
  // - WebSocket
  // - Email
  // - Slack
  // - Discord
  // - GitHub releases
}

export default router;
