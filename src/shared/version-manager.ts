import * as semver from 'semver';
import { SicsVersion, SicsTeamConfig, SicsAction } from '../infrastructure/types';

export class VersionManager {
  private teamConfigs: Map<string, SicsTeamConfig> = new Map();

  constructor(teams: SicsTeamConfig[]) {
    teams.forEach(team => {
      this.teamConfigs.set(team.teamId, team);
    });
  }

  parseVersion(versionString: string): SicsVersion {
    const parsed = semver.parse(versionString);
    if (!parsed) {
      throw new Error(`Invalid version format: ${versionString}`);
    }

    return {
      major: parsed.major,
      minor: parsed.minor,
      patch: parsed.patch,
      prerelease: parsed.prerelease.length > 0 ? parsed.prerelease.join('.') : undefined,
      build: parsed.build.length > 0 ? parsed.build.join('.') : undefined
    };
  }

  formatVersion(version: SicsVersion): string {
    let versionString = `${version.major}.${version.minor}.${version.patch}`;
    
    if (version.prerelease) {
      versionString += `-${version.prerelease}`;
    }
    
    if (version.build) {
      versionString += `+${version.build}`;
    }
    
    return versionString;
  }

  isVersionSupported(teamId: string, version: string): boolean {
    const teamConfig = this.teamConfigs.get(teamId);
    if (!teamConfig) {
      return false;
    }

    return teamConfig.supportedVersions.some(supportedVersion => {
      return semver.satisfies(version, supportedVersion);
    });
  }

  getDefaultVersion(teamId: string): string | null {
    const teamConfig = this.teamConfigs.get(teamId);
    return teamConfig?.defaultVersion || null;
  }

  getLatestSupportedVersion(teamId: string): string | null {
    const teamConfig = this.teamConfigs.get(teamId);
    if (!teamConfig || teamConfig.supportedVersions.length === 0) {
      return null;
    }

    const versions = teamConfig.supportedVersions
      .filter(v => semver.valid(v))
      .sort((a, b) => semver.compare(b, a));

    return versions[0] || null;
  }

  filterActionsByVersion(actions: SicsAction[], teamId: string, version: string): SicsAction[] {
    return actions.filter(action => {
      if (action.deprecated) {
        return false;
      }

      if (action.team && action.team !== teamId) {
        return false;
      }

      if (action.minVersion && semver.lt(version, action.minVersion)) {
        return false;
      }

      if (action.maxVersion && semver.gt(version, action.maxVersion)) {
        return false;
      }

      return true;
    });
  }

  getTeamConfig(teamId: string): SicsTeamConfig | null {
    return this.teamConfigs.get(teamId) || null;
  }

  getAllTeams(): SicsTeamConfig[] {
    return Array.from(this.teamConfigs.values());
  }

  addTeam(teamConfig: SicsTeamConfig): void {
    this.teamConfigs.set(teamConfig.teamId, teamConfig);
  }

  updateTeam(teamId: string, updates: Partial<SicsTeamConfig>): boolean {
    const existingConfig = this.teamConfigs.get(teamId);
    if (!existingConfig) {
      return false;
    }

    const updatedConfig = { ...existingConfig, ...updates };
    this.teamConfigs.set(teamId, updatedConfig);
    return true;
  }

  removeTeam(teamId: string): boolean {
    return this.teamConfigs.delete(teamId);
  }
}
