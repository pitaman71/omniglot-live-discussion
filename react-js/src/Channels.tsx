import _ from 'lodash';
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Objects } from '@pitaman71/omniglot-live-data';
import { Temporal } from '@pitaman71/omniglot-live-domains';
import { Apropos, Database, Debug, Proposals } from '@pitaman71/omniglot-live-reactjs';
import { useAuth } from '@pitaman71/auth-reactjs';

import { Card as CommentCard } from './Comments';
import * as Models from 'omniglot-live-discussion-models';

export function Document(props: { binding: Models.Channels.AChannel}) {
    const zone = Database.useZone();
    const [inputMessage, setInputMessage] = useState<string>('');
    
    const { user } = useAuth();
    const messages = Proposals.useRelation(Models.Channels.HasComment.stream(zone, props.binding))

    const sendMessage = async () => {
        if (!inputMessage.trim()) return;
        const timestamp = new Date().toISOString();
        const atTime_ = Temporal.DateTimeDomain.asString({ standard: 'iso8601', definition: 'DateTime' })?.from(timestamp);
        const hasAuthor_ = user && { author: Objects.Binding.from_bound(user.id)}

        const comment = Objects.Binding.from_bound(uuidv4());
        const atTime = Proposals.useScalarProperty(Models.Comments.AtTime.stream(zone, { comment }).scalar);
        const hasAuthor = Proposals.useRelation(Models.Comments.HasAuthor.stream(zone, { comment }));
        const hasBody = Proposals.useScalarProperty(Models.Comments.HasBody.stream(zone, { comment }).scalar);
        const hasComment = Proposals.useRelation(Models.Channels.HasComment.stream(zone, props.binding));
        if(!atTime_ || !hasAuthor_ || !atTime.client || !hasAuthor.client || !hasBody.client || !hasComment.client) {
            console.error('Cannot upload comment');
        } else {
            document.body.style.zoom = '1';
            // Clear input before sending
            setInputMessage('');
            atTime.client.assign(atTime_);
            hasAuthor.client.assign([{ comment, ...hasAuthor_}])
        }
    };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };


  return (
    <Debug.Boundary name="channel-document-view">
      <div className="document channel">
        <Apropos.Header/>
        <div className="messages">
          {([...messages.entries]).reverse().map(entry => (
            <CommentCard me={user?.id || ''} binding={entry}/>
          ))}
        </div>
        <div className="input-area">
          <input 
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={"Type your message..." }
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </Debug.Boundary>
  );
};
