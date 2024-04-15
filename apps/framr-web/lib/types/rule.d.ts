import { DPoint } from './dpoint';
import { FrameEnum } from './frame';
import { Tool } from './tool';

export enum RuleEnum {
  SHOULD_NOT_BE_PRESENT = 'DPoint should not be present',
  SHOULD_BE_PRESENT = 'DPoint should be present',
  SHOULD_BE_IMMEDIATELY_PRECEDED_BY_OTHER = 'Should be immediately preceded by other DPoint',
  SHOULD_NOT_BE_IMMEDIATELY_PRECEDED_BY_OTHER = 'Should not be immediately preceded by other DPoint',
  SHOULD_BE_IMMEDIATELY_FOLLOWED_BY_OTHER = 'Should be immediately followed by other DPoint',
  SHOULD_NOT_BE_IMMEDIATELY_FOLLOWED_BY_OTHER = 'Should not be immediately followed by other DPoint',
  SHOULD_BE_FOLLOWED_BY_OTHER = 'Should be followed by other DPoint',
  SHOULD_BE_PRECEDED_BY_OTHER = 'Should be preceded by other DPoint',
  SHOULD_NOT_BE_PRECEDED_BY_OTHER = 'Should not be preceded by other DPoint',
  SHOULD_NOT_BE_FOLLOWED_BY_OTHER = 'Should not be followed by other DPoint',
  SHOULD_BE_THE_FIRST = 'Should be the first DPoint',
  SHOULD_NOT_BE_THE_FIRST = 'Should not be the first DPoint',
  SHOULD_BE_PRESENT_AS_SET_ONLY = 'Should be present as DPoint set only',
  SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT = 'Should be present with density constraint',
  SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT = 'Should be present with update rate constraint',
}

export interface CreateStandAloneRule {
  name?: string;
  tool: Tool;
  concernedDpoint: DPoint;
  description: RuleEnum;
  framesets: FrameEnum[];
}

export interface StandAloneRule extends CreateStandAloneRule {
  id: string;
}

export interface CreateRuleWithOtherDPoint extends CreateStandAloneRule {
  otherDpoints: DPoint[];
}

export interface RuleWithOtherDPoint extends CreateRuleWithOtherDPoint {
  id: string;
}

export enum ConstraintEnum {
  TIME = 'Time',
  DISTANCE = 'Distance',
}

export interface CreateRuleWithConstraint extends CreateStandAloneRule {
  interval: number;
  type: ConstraintEnum;
}

export interface RuleWithConstraint extends CreateRuleWithConstraint {
  id: string;
}

export interface CreateRuleWithOccurenceConstraint
  extends CreateStandAloneRule {
  occurences: number;
}

export interface RuleWithOccurenceConstraint
  extends CreateRuleWithOccurenceConstraint {
  id: string;
}

export type Rule =
  | StandAloneRule
  | RuleWithConstraint
  | RuleWithOccurenceConstraint
  | RuleWithOtherDPoint;
