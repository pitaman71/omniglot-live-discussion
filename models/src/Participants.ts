import { Dialogues, Definitions, Objects, Properties, Relations, Stores, Streams, Values } from '@pitaman71/omniglot-live-data';
import * as Domains from '@pitaman71/omniglot-live-domains';
import * as Introspection from 'typescript-introspection';

import { AChannel } from './Channels';

export const directory = new Definitions.Directory();

export interface AParticipant extends Objects.BindingType<string> { participant: Objects.Binding<string> };
export type ToChannel =  AChannel & AParticipant;

function makePath(suffix: string) {
    return `omniglot-live-discussion.Authorization.${suffix}`;
}

export const HasAuthorizedChannels = new Relations.Descriptor<ToChannel>(
    makePath('HasAuthorizedChannels'),
    builder => {
        builder.description()
        builder.symbol('participant', 'person or account who has access');
        builder.set();
        builder.symbol('channel', 'primary subject or channel');
    }
);

directory.add(HasAuthorizedChannels);
        

export const HasAuthorizedParticipants = new Relations.Descriptor<ToChannel>(
    makePath('HasAuthorizedParticipants'),
    builder => {
        builder.description()
        builder.symbol('channel', 'primary subject or channel');
        builder.set();
        builder.symbol('participant', 'person or account who has access');
    }
);

export const authorize: (zone: Stores.Zone, binding: ToChannel) => undefined|(() => void) = (zone, binding) => {
    const hasAuthorizedChannels = HasAuthorizedChannels.stream(zone, { participant: binding.participant });
    const hasAuthorizedChannels_ = hasAuthorizedChannels.stateful();
    const hasAuthorizedParticipants = HasAuthorizedParticipants.stream(zone, { channel: binding.channel });
    const hasAuthorizedParticipants_ = hasAuthorizedParticipants.stateful();
    if(!hasAuthorizedChannels_ || !hasAuthorizedParticipants_) return undefined;
    return () => {
        hasAuthorizedChannels_.insert(binding);
        hasAuthorizedParticipants_.insert(binding);
    }
}

export const deauthorize: (zone: Stores.Zone, binding: ToChannel) => undefined|(() => void) = (zone, binding) => {
    const hasAuthorizedChannels = HasAuthorizedChannels.stream(zone, { participant: binding.participant });
    const hasAuthorizedChannels_ = hasAuthorizedChannels.stateful();
    const hasAuthorizedParticipants = HasAuthorizedParticipants.stream(zone, { channel: binding.channel });
    const hasAuthorizedParticipants_ = hasAuthorizedParticipants.stateful();
    if(!hasAuthorizedChannels_ || !hasAuthorizedParticipants_) return undefined;
    return () => {
        hasAuthorizedChannels_.remove(binding);
        hasAuthorizedParticipants_.remove(binding);
    }
}

directory.add(HasAuthorizedParticipants);
        
