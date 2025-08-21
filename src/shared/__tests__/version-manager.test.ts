import { VersionManager } from '../version-manager';
import { SicsTeamConfig, SicsAction } from '../../infrastructure/types';

describe('Testing VersionManager: ', () => {
  let versionManager: VersionManager;
  let mockTeams: SicsTeamConfig[];

  beforeEach(() => {
    mockTeams = [
      {
        teamId: 'team-a',
        teamName: 'Team A',
        supportedVersions: ['>=1.0.0 <2.0.0', '>=2.0.0'],
        defaultVersion: '1.5.0',
        featureFlags: {}
      },
      {
        teamId: 'team-b',
        teamName: 'Team B',
        supportedVersions: ['>=2.0.0'],
        defaultVersion: '2.1.0',
        featureFlags: {}
      }
    ];
    
    versionManager = new VersionManager(mockTeams);
  });

  describe('parseVersion', () => {
    it('should parse valid version string', () => {
      const version = versionManager.parseVersion('1.2.3');
      
      expect(version.major).toBe(1);
      expect(version.minor).toBe(2);
      expect(version.patch).toBe(3);
      expect(version.prerelease).toBeUndefined();
      expect(version.build).toBeUndefined();
    });

    it('should parse version with prerelease', () => {
      const version = versionManager.parseVersion('1.2.3-alpha.1');
      
      expect(version.major).toBe(1);
      expect(version.minor).toBe(2);
      expect(version.patch).toBe(3);
      expect(version.prerelease).toBe('alpha.1');
    });

    it('should throw error for invalid version', () => {
      expect(() => {
        versionManager.parseVersion('invalid');
      }).toThrow('Invalid version format: invalid');
    });
  });

  describe('formatVersion', () => {
    it('should format basic version', () => {
      const formatted = versionManager.formatVersion({
        major: 1,
        minor: 2,
        patch: 3
      });
      
      expect(formatted).toBe('1.2.3');
    });

    it('should format version with prerelease and build', () => {
      const formatted = versionManager.formatVersion({
        major: 1,
        minor: 2,
        patch: 3,
        prerelease: 'alpha.1',
        build: 'build.123'
      });
      
      expect(formatted).toBe('1.2.3-alpha.1+build.123');
    });
  });

  describe('isVersionSupported', () => {
    it('should return true for supported version', () => {
      expect(versionManager.isVersionSupported('team-a', '1.5.0')).toBe(true);
      expect(versionManager.isVersionSupported('team-a', '2.0.0')).toBe(true);
      expect(versionManager.isVersionSupported('team-b', '2.1.0')).toBe(true);
    });

    it('should return false for unsupported version', () => {
      expect(versionManager.isVersionSupported('team-a', '0.9.0')).toBe(false);
      expect(versionManager.isVersionSupported('team-b', '1.0.0')).toBe(false);
    });

    it('should return false for non-existent team', () => {
      expect(versionManager.isVersionSupported('non-existent', '1.0.0')).toBe(false);
    });
  });

  describe('getDefaultVersion', () => {
    it('should return default version for existing team', () => {
      expect(versionManager.getDefaultVersion('team-a')).toBe('1.5.0');
      expect(versionManager.getDefaultVersion('team-b')).toBe('2.1.0');
    });

    it('should return null for non-existent team', () => {
      expect(versionManager.getDefaultVersion('non-existent')).toBeNull();
    });
  });

  describe('filterActionsByVersion', () => {
    let mockActions: SicsAction[];

    beforeEach(() => {
      mockActions = [
        {
          id: 'action-1',
          name: 'Action 1',
          description: 'Test action 1',
          version: '1.0.0',
          team: 'team-a',
          category: 'data_processing' as any,
          parameters: [],
          flowAdapterEndpoint: '/test1',
          minVersion: '1.0.0',
          maxVersion: '1.9.9'
        },
        {
          id: 'action-2',
          name: 'Action 2',
          description: 'Test action 2',
          version: '2.0.0',
          team: 'team-a',
          category: 'integration' as any,
          parameters: [],
          flowAdapterEndpoint: '/test2',
          minVersion: '2.0.0'
        },
        {
          id: 'action-3',
          name: 'Action 3',
          description: 'Test action 3',
          version: '1.0.0',
          team: 'team-b',
          category: 'validation' as any,
          parameters: [],
          flowAdapterEndpoint: '/test3',
          deprecated: true
        }
      ];
    });

    it('should filter actions by version constraints', () => {
      const filtered = versionManager.filterActionsByVersion(mockActions, 'team-a', '1.5.0');
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('action-1');
    });

    it('should exclude deprecated actions', () => {
      const filtered = versionManager.filterActionsByVersion(mockActions, 'team-b', '2.0.0');
      
      expect(filtered).toHaveLength(0);
    });

    it('should filter by team', () => {
      const filtered = versionManager.filterActionsByVersion(mockActions, 'team-a', '2.0.0');
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('action-2');
    });
  });

  describe('team management', () => {
    it('should add new team', () => {
      const newTeam: SicsTeamConfig = {
        teamId: 'team-c',
        teamName: 'Team C',
        supportedVersions: ['>=1.0.0'],
        defaultVersion: '1.0.0',
        featureFlags: {}
      };

      versionManager.addTeam(newTeam);
      
      expect(versionManager.getTeamConfig('team-c')).toEqual(newTeam);
    });

    it('should update existing team', () => {
      const success = versionManager.updateTeam('team-a', {
        defaultVersion: '1.6.0'
      });
      
      expect(success).toBe(true);
      expect(versionManager.getDefaultVersion('team-a')).toBe('1.6.0');
    });

    it('should remove team', () => {
      const success = versionManager.removeTeam('team-a');
      
      expect(success).toBe(true);
      expect(versionManager.getTeamConfig('team-a')).toBeNull();
    });

    it('should return all teams', () => {
      const allTeams = versionManager.getAllTeams();
      
      expect(allTeams).toHaveLength(2);
      expect(allTeams.map(t => t.teamId)).toContain('team-a');
      expect(allTeams.map(t => t.teamId)).toContain('team-b');
    });
  });
});
