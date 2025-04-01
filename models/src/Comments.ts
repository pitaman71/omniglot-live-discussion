import { Dialogues, Definitions, Objects, Properties, Relations, Stores, Streams, Values } from '@pitaman71/omniglot-live-data';
import { Temporal } from '@pitaman71/omniglot-live-domains';

import * as Connections from './Connections';
import * as Interfaces from './Interfaces';

export const directory = new Definitions.Directory();

export interface AComment extends Objects.BindingType<string> { comment: Objects.Binding<string> };

function makePath(suffix: string) {
    return `omniglot-live-discussion.Comments.${suffix}`;
}

export const AtTime = new Properties.Descriptor<AComment, Temporal._DateTime>(
    makePath('AtTime'),
    builder => {
        builder.description("given an entry (comment) in a conversation, return the time at which the comment was posted")
        builder.symbol('comment', 'an entry posted by a participant in a discussion channel');
        builder.scalar(Temporal.DateTimeDomain);
    }
);

export const HasAuthor = new Relations.Descriptor<AComment & { author: Objects.Binding<string> }>(
    makePath('HasAuthor'),
    builder => {
        builder.description()
        builder.symbol('comment', 'a post in a dicussion channel');
        builder.set();
        builder.symbol('author', 'the account which made and owns this post');
    }
);

export const HasBody = new Properties.Descriptor<AComment, string>(
    makePath('HasBody'),
    builder => {
        builder.description("given an entry (comment) in a conversation, return the text content (body)")
        builder.symbol('comment', 'an entry posted by a participant in a discussion channel');
        builder.scalar(Values.TheStringDomain);
    }
);

export const ReadAccess: Connections.Descriptors<AComment> = {
    atTime: Connections.Read(AtTime),
    hasAuthor: Connections.Read(HasAuthor),
    hasBody: Connections.Read(HasBody)
};

export const WriteAccess: Connections.Descriptors<AComment> = {
    atTime: Connections.Write(AtTime),
    hasAuthor: Connections.Write(HasAuthor),
    hasBody: Connections.Write(HasBody)
};

export const Direct = new Interfaces.Descriptor<AComment, typeof WriteAccess>(makePath('Descriptors'), WriteAccess);

export const modify = (zone: Stores.Zone, binding: AComment) => {
    const atTime = AtTime.stream(zone, binding).scalar?.stateful();
    const hasAuthor = HasAuthor.stream(zone, binding)?.stateful();
    const hasBody = HasBody.stream(zone, binding).scalar?.stateful();
    return { atTime, hasAuthor, hasBody };
}

directory.add(AtTime, HasAuthor, HasBody);
