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
  bitRate: number;
  penetrationRate: number;
  tools: GeneratorConfigTool[];
  framesets: {
    fsl: FSL[];
    utility: UtilityFrameset;
  };
}

export interface GeneratorConfig extends CreateGeneratorConfig {
  id: string;
}
