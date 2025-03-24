import { Dialogues, Definitions, Objects, Properties, Relations, Stores, Streams, Values } from '@pitaman71/omniglot-live-data';
import * as Domains from '@pitaman71/omniglot-live-domains';
import * as Introspection from 'typescript-introspection';

import { AChannel } from './Channels';

export const directory = new Definitions.Directory();

export type ToChannel =  AChannel & { participant: Objects.Binding<string> };

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

directory.add(HasAuthorizedParticipants);
        
