// @flow
import { List } from 'immutable';
import type { SelectOptionProp, SelectOptionValueProp } from '../select-field/props';

export type Option = SelectOptionProp;
export type OptionValue = SelectOptionValueProp;
export type SelectedOptions = Array<Option> | List<Option>;

export type SuggestedPill = {
    email: string,
    id: number,
    name: string,
    text?: string,
    type?: string,
    value?: string,
};

export type SuggestedPills = Array<SuggestedPill>;

export type SuggestedPillsFilter = $Keys<SuggestedPill>;
