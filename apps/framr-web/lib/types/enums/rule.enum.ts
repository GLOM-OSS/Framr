export enum StandAloneRuleEnum {
  SHOULD_BE_PRESENT = 'should be present', //✔️
  SHOULD_NOT_BE_PRESENT = 'should not be present', //✔️
  SHOULD_BE_THE_FIRST = 'should be first', //✔️
  SHOULD_NOT_BE_THE_FIRST = 'should not be first', //✔️
}

export enum WithConstraintRuleEnum {
  SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT = 'should be present with density constraint',
  SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT = 'should be present with update rate constraint',
}

export enum WithOtherDPointRuleEnum {
  SHOULD_BE_IMMEDIATELY_PRECEDED_BY_OTHER = 'should be immediately preceded by', //✔️
  SHOULD_NOT_BE_IMMEDIATELY_PRECEDED_BY_OTHER = 'should not be immediately preceded by', //✔️
  SHOULD_BE_IMMEDIATELY_FOLLOWED_BY_OTHER = 'should be immediately followed by', //✔️
  SHOULD_NOT_BE_IMMEDIATELY_FOLLOWED_BY_OTHER = 'should not be immediately followed by', //✔️
  SHOULD_BE_FOLLOWED_BY_OTHER = 'should be followed by', //✔️
  SHOULD_BE_PRECEDED_BY_OTHER = 'should be preceded by', //✔️
  SHOULD_NOT_BE_PRECEDED_BY_OTHER = 'should not be preceded by', //✔️
  SHOULD_NOT_BE_FOLLOWED_BY_OTHER = 'should not be followed by', //✔️
  SHOULD_BE_PRESENT_AS_SET_ONLY = 'should be present as set only', //✔️
  SHOULD_BE_PRESENT_AS_ORDERED_SET_ONLY = 'should be present as ordered set only', //✔️
}

export type RuleEnumType =
  | StandAloneRuleEnum
  | WithConstraintRuleEnum
  | WithOtherDPointRuleEnum;

export enum ConstraintEnum {
  TIME = 'time',
  DISTANCE = 'distance',
}
