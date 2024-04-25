import { UtilityFrameset } from './frame';
import { FSL } from './fsl';
import { Rule } from './rule';
import { LWDTool, MWDTool } from './tool';

interface GeneratorConfigRule extends Rule {
  /**
   * Used to distinguish db rules from added constraints in generator instance
   */
  isGeneric: boolean;
  isActive: boolean;
}

interface GeneratorConfigTool extends LWDTool {
  rules: GeneratorConfigRule[];
}

export interface CreateGeneratorConfig {
  jobName?: string;
  wellName?: string;
  MWDTool: MWDTool;
  /** in bit per seconds */
  bitRate: number;
  /** in meter per seconds */
  penetrationRate: number;
  tools: LWDTool[];
}

export interface GeneratorConfig extends CreateGeneratorConfig {
  tools: GeneratorConfigTool[];
  framesets: {
    fsl: FSL[];
    utility: UtilityFrameset;
  };
  id: string;
}
