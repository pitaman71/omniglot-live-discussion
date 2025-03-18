import { Dialogues, Definitions, Objects, Properties, Relations, Stores, Streams, Values } from '@pitaman71/omniglot-live-data';
import * as Domains from '@pitaman71/omniglot-live-domains';
import * as Introspection from 'typescript-introspection';

export const directory = new Definitions.Directory();

export interface AReaction extends Objects.BindingType<string> { comment: Objects.Binding<string>; participant: Objects.Binding<string> };

function makePath(suffix: string) {
    return `omniglot-live-discussion.Reactions.${suffix}`;
}

export const ReactionCodeDomain = new Values.EnumerationDomain('like', 'dislike', 'lol', 'what', 'wow');

export const SeenAtTime = new Properties.Descriptor<AReaction, Domains.Temporal._DateTime>(
    makePath('SeenAtTime'),
    builder => {
        builder.description("given an entry (comment) in a conversation, return the time at which the comment was seen")
        builder.symbol('comment', 'an entry posted by a participant in a discussion channel');
        builder.symbol('participant', 'any participant which may observe this entry');
        builder.scalar(Domains.Temporal.DateTimeDomain);
    }
);

export const HasReactionCode = new Properties.Descriptor<AReaction, Introspection.getValueType<typeof ReactionCodeDomain>>(
    makePath('HasReactionCode'),
    builder => {
        builder.description("given an entry (comment) in a conversation, return the time at which the comment was seen")
        builder.symbol('comment', 'an entry posted by a participant in a discussion channel');
        builder.symbol('participant', 'any participant which may observe this entry');
        builder.scalar(ReactionCodeDomain);
    }
);

directory.add(ReactionCodeDomain, SeenAtTime, HasReactionCode);
