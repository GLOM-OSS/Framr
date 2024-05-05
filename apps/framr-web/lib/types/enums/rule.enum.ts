export enum StandAloneRuleEnum {
  SHOULD_NOT_BE_PRESENT = 'DPoint should not be present', //✔️
  SHOULD_BE_PRESENT = 'DPoint should be present', //✔️
  SHOULD_BE_THE_FIRST = 'Should be the first DPoint', //✔️
  SHOULD_NOT_BE_THE_FIRST = 'Should not be the first DPoint', //✔️
}

export enum WithConstraintRuleEnum {
  SHOULD_BE_PRESENT_WITH_DENSITY_CONSTRAINT = 'Should be present with density constraint',
  SHOULD_BE_PRESENT_WITH_UPDATE_RATE_CONSTRAINT = 'Should be present with update rate constraint',
}

export enum WithOtherDPointRuleEnum {
  SHOULD_BE_IMMEDIATELY_PRECEDED_BY_OTHER = 'Should be immediately preceded by other DPoint', //✔️
  SHOULD_NOT_BE_IMMEDIATELY_PRECEDED_BY_OTHER = 'Should not be immediately preceded by other DPoint', //✔️
  SHOULD_BE_IMMEDIATELY_FOLLOWED_BY_OTHER = 'Should be immediately followed by other DPoint', //✔️
  SHOULD_NOT_BE_IMMEDIATELY_FOLLOWED_BY_OTHER = 'Should not be immediately followed by other DPoint', //✔️
  SHOULD_BE_FOLLOWED_BY_OTHER = 'Should be followed by other DPoint', //✔️
  SHOULD_BE_PRECEDED_BY_OTHER = 'Should be preceded by other DPoint', //✔️
  SHOULD_NOT_BE_PRECEDED_BY_OTHER = 'Should not be preceded by other DPoint', //✔️
  SHOULD_NOT_BE_FOLLOWED_BY_OTHER = 'Should not be followed by other DPoint', //✔️
  SHOULD_BE_PRESENT_AS_SET_ONLY = 'Should be present as DPoint set only', //✔️
}

export type RuleEnumType =
  | StandAloneRuleEnum
  | WithConstraintRuleEnum
  | WithOtherDPointRuleEnum;

export enum ConstraintEnum {
  TIME = 'Time',
  DISTANCE = 'Distance',
}
