import _ from 'lodash';
import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { Dot } from 'react-animated-dots';
import { Objects } from '@pitaman71/omniglot-live-data';
import { Temporal } from '@pitaman71/omniglot-live-domains';
import { Apropos, Database, Debug, Proposals, Styles } from '@pitaman71/omniglot-live-reactjs';

import { Comments as CommentsModel, Channels as ChannelsModel } from '@pitaman71/omniglot-live-discussion-models';

// Define styles using the CSS-in-JS framework
const styles = Styles.createStyles('comments', {
  message: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: '80%',
    wordBreak: 'break-word',
    '& p': {
      margin: 0,
    },
    '& pre': {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      padding: 8,
      borderRadius: 4,
      overflowX: 'auto',
    },
    '& code': {
      fontFamily: 'monospace',
    },
    '& a': {
      color: 'var(--button-bg)',
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      }
    }
  },
  userMessage: {
    backgroundColor: 'var(--message-user)',
    color: 'var(--text-primary)',
    alignSelf: 'flex-end',
    marginLeft: 'auto',
    borderBottomRightRadius: 2,
  },
  assistantMessage: {
    backgroundColor: 'var(--message-assistant)',
    color: 'var(--text-primary)',
    alignSelf: 'flex-start',
    marginRight: 'auto',
    borderBottomLeftRadius: 2,
  },
  messageContainer: {
    display: 'flex',
    width: '100%',
  }
});

export function Card(props: { me: string, binding: CommentsModel.AComment}) {
    const zone = Database.useZone();
    const comment = props.binding.comment;
    const atTime = Proposals.useScalarProperty(CommentsModel.AtTime.stream(zone, { comment }).scalar);
    const hasAuthor = Proposals.useRelation(CommentsModel.HasAuthor.stream(zone, { comment }));
    const hasBody = Proposals.useScalarProperty(CommentsModel.HasBody.stream(zone, { comment }).scalar);
    const hasComment = Proposals.useRelation(ChannelsModel.HasComment.stream(zone, props.binding));

    const isMe = hasAuthor.entries.filter(entry => entry.author.objectId === props.me).length > 0;

    return (
        <div className={styles.messageContainer}>
            <div 
                key={comment.objectId} 
                className={`${styles.message} ${isMe ? styles.userMessage : styles.assistantMessage}`}
            >
                <Markdown>{ hasBody.value }</Markdown>
            </div>
        </div>
    );
}