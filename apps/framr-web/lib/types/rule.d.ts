import { DPoint } from './dpoint';
import {
  ConstraintEnum,
  FrameEnum,
  WithOtherDPointRuleEnum,
  StandAloneRuleEnum,
  WithConstraintRuleEnum,
} from './enums';
import { Tool } from './tool';

export interface CreateStandAloneRule {
  name?: string;
  tool: Tool;
  concernedDpoint: DPoint;
  description: StandAloneRuleEnum;
  framesets: FrameEnum[];
}

export interface StandAloneRule extends CreateStandAloneRule {
  id: string;
}

export interface CreateRuleWithOtherDPoint extends CreateStandAloneRule {
  description: WithOtherDPointRuleEnum;
  otherDpoints: DPoint[];
}

export interface RuleWithOtherDPoint extends CreateRuleWithOtherDPoint {
  id: string;
}

export interface CreateRuleWithConstraint extends CreateStandAloneRule {
  interval: number;
  type: ConstraintEnum;
  description: WithConstraintRuleEnum;
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

export type CreateRule =
  | CreateStandAloneRule
  | CreateRuleWithConstraint
  | CreateRuleWithOccurenceConstraint
  | CreateRuleWithOtherDPoint;

export type Rule =
  | StandAloneRule
  | RuleWithConstraint
  | RuleWithOccurenceConstraint
  | RuleWithOtherDPoint;
