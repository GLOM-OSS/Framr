import { DPoint } from './dpoint';
import { FrameEnum, RuleEnum } from './enums';
import { Tool } from './tool';

export interface CreateStandAloneRule {
  name?: string;
  tool: Tool;
  concernedDpoint: DPoint;
  description:
    | RuleEnum.SHOULD_BE_PRESENT
    | RuleEnum.SHOULD_BE_THE_FIRST
    | RuleEnum.SHOULD_NOT_BE_PRESENT
    | RuleEnum.SHOULD_NOT_BE_THE_FIRST;
  framesets: FrameEnum[];
}

export interface StandAloneRule extends CreateStandAloneRule {
  id: string;
}

export interface CreateRuleWithOtherDPoint extends CreateStandAloneRule {
  otherDpoints: DPoint[];
  description:
    | RuleEnum.SHOULD_BE_FOLLOWED_BY_OTHER
    | RuleEnum.SHOULD_BE_IMMEDIATELY_FOLLOWED_BY_OTHER
    | RuleEnum.SHOULD_BE_IMMEDIATELY_PRECEDED_BY_OTHER
    | RuleEnum.SHOULD_BE_PRECEDED_BY_OTHER
    | RuleEnum.SHOULD_BE_PRESENT_AS_SET_ONLY
    | RuleEnum.SHOULD_NOT_BE_FOLLOWED_BY_OTHER
    | RuleEnum.SHOULD_NOT_BE_IMMEDIATELY_FOLLOWED_BY_OTHER
    | RuleEnum.SHOULD_NOT_BE_IMMEDIATELY_PRECEDED_BY_OTHER
    | RuleEnum.SHOULD_NOT_BE_PRECEDED_BY_OTHER;
}

export interface RuleWithOtherDPoint extends CreateRuleWithOtherDPoint {
  id: string;
}

export interface CreateRuleWithConstraint extends CreateStandAloneRule {
  interval: number;
  type: ConstraintEnum;
  description:
    | RuleEnum.SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT
    | RuleEnum.SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT;
}

export interface RuleWithConstraint extends CreateRuleWithConstraint {
  id: string;
}

// export interface CreateRuleWithOccurenceConstraint
//   extends CreateStandAloneRule {
//   occurences: number;
// }

// export interface RuleWithOccurenceConstraint
//   extends CreateRuleWithOccurenceConstraint {
//   id: string;
// }

export type CreateRule =
  | CreateStandAloneRule
  | CreateRuleWithConstraint
  // | CreateRuleWithOccurenceConstraint
  | CreateRuleWithOtherDPoint;

export type Rule =
  | StandAloneRule
  | RuleWithConstraint
  // | RuleWithOccurenceConstraint
  | RuleWithOtherDPoint;
