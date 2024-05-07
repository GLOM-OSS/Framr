import { UtilityFrameset } from './frame';
import { FSL } from './fsl';
import { Rule } from './rule';
import { LWDTool, MWDTool } from './tool';

type GeneratorConfigRule = Rule & {
  /**
   * Used to distinguish db rules from added constraints in generator instance
   */
  isGeneric: boolean;
  isActive: boolean;
};

interface GeneratorConfigTool extends LWDTool {
  rules: GeneratorConfigRule[];
}

export interface CreateGeneratorConfig {
  jobName?: string;
  wellName?: string;
  MWDTool: MWDGeneratorConfigTool;
  /** in bit per seconds */
  bitRate: number;
  /** in meter per seconds */
  penetrationRate: number;
  tools: GeneratorConfigTool[];
}

interface MWDGeneratorConfigTool extends MWDTool {
  rules: GeneratorConfigRule[];
}

export interface GeneratorConfig extends CreateGeneratorConfig {
  framesets: {
    fsl: FSL[];
    utility: UtilityFrameset;
  };
  id: string;
}
