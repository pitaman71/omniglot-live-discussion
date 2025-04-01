import { Clients, Objects, Properties, Relations, Stores, Streams } from '@pitaman71/omniglot-live-data';

import { Descriptor as ConnectionDescriptor, Descriptors as ConnectionDescriptors, ToStreams, ToClients, toStream } from './Connections';

type Spec<
    Symbols extends string = never
> = {
    symbols: Symbols[];
}

export class Descriptor<
    BindingType extends Objects.BindingType<string>,
    ConnectionDescriptorTypes extends ConnectionDescriptors<BindingType> = ConnectionDescriptors<BindingType>,
    StreamTypes extends ToStreams<BindingType, ConnectionDescriptorTypes> = ToStreams<BindingType, ConnectionDescriptorTypes>,
    ClientTypes extends ToClients<BindingType, ConnectionDescriptorTypes> = ToClients<BindingType, ConnectionDescriptorTypes>
> {
    canonicalName: string;
    private connectionDescriptors: ConnectionDescriptorTypes;
    constructor(canonicalName: string, connectionDescriptors: ConnectionDescriptorTypes) {
        this.canonicalName = canonicalName;
        this.connectionDescriptors = connectionDescriptors;
    }

    streams(zone: Stores.Zone, binding: BindingType): StreamTypes {
        return Object.keys(this.connectionDescriptors).reduce<Partial<StreamTypes>>((streams, key) => ({
            ...streams, [key]: toStream(zone, binding, this.connectionDescriptors[key as keyof ConnectionDescriptorTypes])
        }), {}) as StreamTypes;
    };

    toClient(stream: StreamTypes[keyof ConnectionDescriptorTypes]) { return {
        scalar: 'scalar' in stream ? stream.scalar?.stateful() : undefined,
        set: 'set' in stream ? stream.set?.stateful() : undefined,
        sequence: 'sequence' in stream ? stream.sequence?.stateful() : undefined,
        relation: 'relation' in stream ? stream.relation?.stateful() : undefined
    } }

    clients(zone: Stores.Zone, binding: BindingType): ClientTypes {
        const streams = this.streams(zone, binding);
        return Object.keys(streams).reduce<Partial<ClientTypes>>((clients, key) => ({
            ...clients, [key]: this.toClient(streams[key as keyof ConnectionDescriptorTypes])
        }), {}) as ClientTypes;
    }
}

export interface Instance<
    BindingType extends Objects.BindingType<string>,
    ConnectionDescriptorTypes extends ConnectionDescriptors<BindingType>,
> {
    descriptor: Descriptor<BindingType, ConnectionDescriptorTypes>;
    binding: BindingType;
}