import { Dialogues, Definitions, Objects, Properties, Relations, Stores, Streams, Values } from '@pitaman71/omniglot-live-data';
import { AComment } from './Comments';

export const directory = new Definitions.Directory();

export interface AChannel extends Objects.BindingType<string> { channel: Objects.Binding<string> };

function makePath(suffix: string) {
    return `omniglot-live-discussion.Channels.${suffix}`;
}

export function ChatChannel(...participants: Objects.Binding<string>[]) {
    return { channel: Objects.Binding.from_bound([...participants].sort().map(binding => binding.objectId || '').join(':')) };
}

export const HasComment = new Relations.Descriptor<AChannel & AComment>(
    makePath('HasComment'),
    builder => {
        builder.description()
        builder.symbol('channel', 'primary subject or channel in which comments may appear');
        builder.set();
        builder.symbol('comment', 'an entry in the discussion');
    }
);

directory.add(HasComment);
        
