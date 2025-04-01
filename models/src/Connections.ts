import * as Introspection from 'typescript-introspection';
import { Clients, Objects, Properties, Relations, Stores, Streams } from '@pitaman71/omniglot-live-data';

export interface Sense {
    input: boolean,
    output: boolean
}

type IsEqual<T, U> = 
  [T] extends [U] ? 
    [U] extends [T] ? 
      true : 
      false : 
    false;

type Spec<
    InputType extends boolean = boolean,
    OutputType extends boolean = boolean,
    ActualSymbols extends string = never,
    FormalSymbols extends string = never,
    ValueType = undefined,
    PropertyType extends undefined | Properties.Descriptor<Record<FormalSymbols, Objects.Binding<string>>, ValueType> = undefined,
    RelationType extends undefined | Relations.Descriptor<Record<FormalSymbols, Objects.Binding<string> & (ValueType extends Objects.BindingType<string> ? ValueType : {} )>> = undefined
> = {
    input: InputType,
    output: OutputType,
    actuals: ActualSymbols[];
    formals: FormalSymbols[];
    valueDomain: ValueType;
    property: PropertyType;
    relation: RelationType;
}

export class Build<
    InputType extends boolean = boolean,
    OutputType extends boolean = boolean,
    ActualSymbols extends string = never,
    FormalSymbols extends string = never,
    ValueType = undefined,
    PropertyType extends undefined | Properties.Descriptor<Record<FormalSymbols, Objects.Binding<string>>, ValueType> = undefined,
    RelationType extends undefined | Relations.Descriptor<Record<FormalSymbols, Objects.Binding<string> & (ValueType extends Objects.BindingType<string> ? ValueType : {} )>> = undefined
> {
    private spec: Partial<Spec<InputType, OutputType, ActualSymbols, FormalSymbols, ValueType, PropertyType, RelationType>>;
    constructor(init?: Partial<Spec<InputType, OutputType, ActualSymbols, FormalSymbols, ValueType, PropertyType, RelationType>>) {
        this.spec = init || {}
    }
    input<InputType_ extends InputType>(allow: InputType_) {
        return new Build<InputType_, OutputType, ActualSymbols, FormalSymbols, ValueType, PropertyType, RelationType>({
            ...this.spec,
            input: allow
        });
    }
    output<OutputType_ extends OutputType>(allow: OutputType_) {
        return new Build<InputType, OutputType_, ActualSymbols, FormalSymbols, ValueType, PropertyType, RelationType>({
            ...this.spec,
            output: allow
        });
    }
    actuals<Symbol extends Exclude<string, ActualSymbols>>(...actuals_: Symbol[]) {
        return new Build<InputType, OutputType, ActualSymbols | Symbol, FormalSymbols, ValueType, PropertyType, RelationType>({
            ...this.spec,
            actuals: [ ...this.spec.actuals || [], ...actuals_ ]
        });
    }
    formals<Symbol extends Exclude<string, FormalSymbols>>(...formals_: Symbol[]) {
        return new Build<InputType, OutputType, ActualSymbols, FormalSymbols | Symbol, ValueType, undefined, undefined>({
            ...this.spec,
            formals: [ ...this.spec.formals || [], ...formals_ ],
            property: undefined,
            relation: undefined
        });
    }
    property<PropertyType_ extends Properties.Descriptor<Record<FormalSymbols, Objects.Binding<string>>, ValueType>>(descriptor: PropertyType_) {
        return new Build<InputType, OutputType, ActualSymbols, FormalSymbols, ValueType, PropertyType_, RelationType>({
            ...this.spec,
            property: descriptor
        })
    }
    relation<RelationType_ extends Relations.Descriptor<Record<FormalSymbols, Objects.Binding<string> & (ValueType extends Objects.BindingType<string> ? ValueType : {} )>>>(descriptor: RelationType_) {
        return new Build<InputType, OutputType, ActualSymbols, FormalSymbols, ValueType, PropertyType, RelationType_>({
            ...this.spec,
            relation: descriptor
        })
    }
}

export type Descriptor<
    Actuals extends Objects.BindingType<string>,
    Formals extends Objects.BindingType<string>,
    ValueType
> = Sense & ({
    property: Properties.Descriptor<Formals, ValueType>,
})|( ValueType extends Objects.BindingType<string> ? {
    relation: Relations.Descriptor<Formals & ValueType>,
} : never) & (
    IsEqual<Actuals, Formals> extends true ? {} : {
        map: (binding: Actuals) => Formals
    }
);

export type Descriptors<
    BindingType extends Objects.BindingType<string>
> = Record<string, Descriptor<BindingType, any, any>>;

export type ToStream<
    BindingType extends Objects.BindingType<string>,
    ValueType,
    EntityDescriptorType extends Descriptor<BindingType, any, ValueType>
> = EntityDescriptorType extends Properties.Descriptor<BindingType, ValueType> ? { 
    scalar?: Streams.ScalarStream<ValueType>;
    set?: Streams.SetStream<ValueType>;
    sequence?: Streams.SequenceStream<ValueType>
} : EntityDescriptorType extends Relations.Descriptor<BindingType> ? {
    relation?: Streams.RelationStream<BindingType>
} : never;

export type ToStreams<
    BindingType extends Objects.BindingType<string>,
    EntityDescriptorTypes extends Descriptors<BindingType>
> = { [ key in keyof EntityDescriptorTypes]: ToStream<BindingType, any, EntityDescriptorTypes[key]>}

export type ToClient<
    BindingType extends Objects.BindingType<string>,
    ValueType,
    EntityDescriptorType extends Descriptor<BindingType, any, ValueType>
> = EntityDescriptorType extends Properties.Descriptor<BindingType, ValueType> ? { 
    scalar?: Clients.ScalarClient<ValueType>;
    set?: Clients.SetClient<ValueType>;
    sequence?: Clients.SequenceClient<ValueType>
} : EntityDescriptorType extends Relations.Descriptor<BindingType> ? {
    relation?: Clients.RelationClient<BindingType>
} : never;

export type ToClients<
    BindingType extends Objects.BindingType<string>,
    EntityDescriptorTypes extends Descriptors<BindingType>
> = { [ key in keyof EntityDescriptorTypes]: ToClient<BindingType, any, EntityDescriptorTypes[key]>}

export function toStream<
    Actuals extends Objects.BindingType<string>,
    Formals extends Objects.BindingType<string>,
    ValueType
>(
    zone: Stores.Zone,
    binding: Actuals,
    descriptor: Descriptor<Formals, any, ValueType>
) {
    if('property' in descriptor) {
        return descriptor.property.stream(zone, binding) 
    } else if('relation' in descriptor) {
        return descriptor.relation.stream(zone, binding) 
    } 
    throw new Error(`Malformed Connection Descriptor`);
}

export function Read<
    BindingType extends Objects.BindingType<string>,
    ValueType
>(
    descriptor: Properties.Descriptor<BindingType, ValueType> | 
    (ValueType extends Objects.BindingType<string> ? Relations.Descriptor<BindingType & ValueType> : never)
) {
    const sense = {
        input: true, output: false
    };
    if(descriptor instanceof Properties.Descriptor) {
        return { 
            ...sense,
            property: descriptor,
            binder: (binding: BindingType) => descriptor.bind(binding) 
        };
    } else if(descriptor instanceof Relations.Descriptor) {
        return {
            ...sense,
            relation: descriptor,
            binder: (binding: BindingType) => descriptor.bindAnchor(binding as any) 
        }
    } 
    throw new Error(`Malformed Connection Descriptor`);
}

export function Write<
    BindingType extends Objects.BindingType<string>,
    ValueType
>(
    descriptor: Properties.Descriptor<BindingType, ValueType> | 
    (ValueType extends Objects.BindingType<string> ? Relations.Descriptor<BindingType & ValueType> : never)
) {
    const sense = {
        input: true, output: true
    };
    if(descriptor instanceof Properties.Descriptor) {
        return { 
            ...sense,
            property: descriptor,
            binder: (binding: BindingType) => descriptor.bind(binding) 
        };
    } else if(descriptor instanceof Relations.Descriptor) {
        return {
            ...sense,
            relation: descriptor,
            binder: (binding: BindingType) => descriptor.bindAnchor(binding as any) 
        }
    } 
    throw new Error(`Malformed Connection Descriptor`);
}

export function Var<
    BindingType extends Objects.BindingType<string>,
    ValueType
>(
    descriptor: Properties.Descriptor<BindingType, ValueType> | 
    (ValueType extends Objects.BindingType<string> ? Relations.Descriptor<BindingType & ValueType> : never)
) {
    const sense = {
        descriptor, 
        input: false, output: false
    };
    if(descriptor instanceof Properties.Descriptor) {
        return { 
            ...sense,
            property: descriptor,
            binder: (binding: BindingType) => descriptor.bind(binding) 
        };
    } else if(descriptor instanceof Relations.Descriptor) {
        return {
            ...sense,
            relation: descriptor,
            binder: (binding: BindingType) => descriptor.bindAnchor(binding as any) 
        }
    } 
    throw new Error(`Malformed Connection Descriptor`);
}

export function Rebind<
    Actuals extends Objects.BindingType<string>,
    Formals extends Objects.BindingType<string>,
    ValueType
>(
    descriptor: Descriptor<Formals, any, ValueType>,
    map: (binding: Actuals) => Formals
) {
    return {
        ...descriptor,
        map: (binding: Actuals) => 'map' in descriptor ? descriptor.map(map(binding)) : map(binding)
    }
}
