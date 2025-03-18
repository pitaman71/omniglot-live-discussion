import { Dialogues, Definitions, Objects, Properties, Relations, Stores, Streams, Values } from '@pitaman71/omniglot-live-data';
import * as Domains from '@pitaman71/omniglot-live-domains';
import * as Introspection from 'typescript-introspection';

export const directory = new Definitions.Directory();

export interface ToChannel extends Objects.BindingType<string> { participant: Objects.Binding<string>, channel: Objects.Binding<string> };
export interface ToComment extends Objects.BindingType<string> { participant: Objects.Binding<string>, comment: Objects.Binding<string> };

function makePath(suffix: string) {
    return `omniglot-live-discussion.Authorization.${suffix}`;
}
