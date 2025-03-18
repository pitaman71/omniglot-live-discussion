import _ from 'lodash';
import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown'
import { Dot } from 'react-animated-dots';
import { Objects } from '@pitaman71/omniglot-live-data';
import { Temporal } from '@pitaman71/omniglot-live-domains';
import { Apropos, Database, Debug, Proposals } from '@pitaman71/omniglot-live-reactjs';
import { useAuth } from '@pitaman71/auth-reactjs';
import * as Models from 'omniglot-live-discussion-models';

export function Card(props: { me: string, binding: Models.Comments.AComment}) {
    const zone = Database.useZone();
    const comment = props.binding.comment;
    const atTime = Proposals.useScalarProperty(Models.Comments.AtTime.stream(zone, { comment }).scalar);
    const hasAuthor = Proposals.useRelation(Models.Comments.HasAuthor.stream(zone, { comment }));
    const hasBody = Proposals.useScalarProperty(Models.Comments.HasBody.stream(zone, { comment }).scalar);
    const hasComment = Proposals.useRelation(Models.Channels.HasComment.stream(zone, props.binding));

    const isMe = hasAuthor.entries.filter(entry => entry.author.objectId === props.me).length > 0;
    return <div 
        key={comment.objectId} 
        className={`message ${isMe ? 'user-message' : 'assistant-message'}`}
    >
        <Markdown>{ hasBody.value }</Markdown>
    </div>;
}

