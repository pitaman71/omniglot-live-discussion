import { Dialogues, Definitions, Objects, Properties, Relations, Stores, Streams, Values } from '@pitaman71/omniglot-live-data';
import { AComment } from './Comments';
import * as Interfaces from './Interfaces';
import * as Connections from './Connections';

export const directory = new Definitions.Directory();

export interface AChannel extends Objects.BindingType<string> { channel: Objects.Binding<string> };

function makePath(suffix: string) {
    return `omniglot-live-discussion.Channels.${suffix}`;
}

export const asChat = {
    from(...participants: Objects.Binding<string>[]) {
        return { channel: Objects.Binding.from_bound([...participants].sort().map(binding => binding.objectId || '').join(':')) };
    }, to(binding: { channel: Objects.Binding<string> }) {
        return (binding.channel.objectId || "").split(":").map(objectId => Objects.Binding.from_bound(objectId));
    }
};

export const HasComment = new Relations.Descriptor<AChannel & AComment>(
    makePath('HasComment'),
    builder => {
        builder.description()
        builder.symbol('channel', 'primary subject or channel in which comments may appear');
        builder.set();
        builder.symbol('comment', 'an entry in the discussion');
    }
);

export const ReadAccess: Connections.Descriptors<AChannel> = {
    hasComment: Connections.Read(HasComment)
};

export const WriteAccess: Connections.Descriptors<AChannel> = {
    hasComment: Connections.Write(HasComment)
};

export const Direct = new Interfaces.Descriptor<AChannel, typeof WriteAccess>(makePath('Descriptors'), WriteAccess);

directory.add(HasComment);

export const addComment: (zone: Stores.Zone, binding: AChannel) => undefined|((
    comment: AComment
) => void) = (zone, binding) => {
    const hasComment = HasComment.stream(zone, binding);
    const hasComment_ = hasComment.stateful();
    if(!hasComment_) return undefined;
    return (comment) => hasComment_.insert({ ...binding, ...comment });
}

export const removeComment: (zone: Stores.Zone, binding: AChannel) => undefined|((
    comment: AComment
) => void) = (zone, binding) => {
    const hasComment = HasComment.stream(zone, binding);
    const hasComment_ = hasComment.stateful();
    if(!hasComment_) return undefined;
    return (comment) => hasComment_.remove({ ...binding, ...comment });
}
