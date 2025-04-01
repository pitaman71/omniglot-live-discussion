// src/Channels.tsx
import _ from 'lodash';
import React, { useState } from 'react';
import { useInterval } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';
import { Objects, ProposeZone } from '@pitaman71/omniglot-live-data';
import { Temporal } from '@pitaman71/omniglot-live-domains';
import { Apropos, Database, Debug, Proposals, Rendering, Styles } from '@pitaman71/omniglot-live-reactjs';
import { useAuth } from '@pitaman71/auth-reactjs';
import { DateTime } from '@pitaman71/omniglot-live-logistics-reactjs';

import { Card as CommentCard } from './Comments';

import * as Models from '@pitaman71/omniglot-live-discussion-models';

// Define styles using the CSS-in-JS framework
const styles = Styles.createStyles('channels', {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: 'var(--bg-primary)',
    },
    card: {
        position: 'relative',
        borderRadius: 8,
        boxShadow: '0 2px 4px var(--shadow-color)',
        padding: 16,
        margin: 8,
        backgroundColor: 'var(--bg-secondary)',
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
            boxShadow: '0 4px 8px var(--shadow-color)',
        }
    },
    cardOverlay: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    },
    cardProp: {
        margin: 4,
        justifyContent: 'center'
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        color: 'var(--text-primary)',
    },
    author: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 14,
        color: 'var(--text-secondary)',
    },
    caption: {
        fontSize: 14,
        color: 'var(--text-secondary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    document: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        padding: 16,
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 8,
    },
    channelHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderBottom: '1px solid var(--border-color)',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    channelMessages: {
        display: 'flex',
        flexDirection: 'column-reverse',
        flex: 1,
        overflowY: 'auto',
        padding: 16,
        gap: 16,
        '&::-webkit-scrollbar': {
            width: 8,
        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: 'var(--scrollbar-track)',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'var(--scrollbar-thumb)',
            borderRadius: 4,
        },
        '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'var(--scrollbar-thumb-hover)',
        }
    },
    channelInputArea: {
        display: 'flex',
        padding: 12,
        borderTop: '1px solid var(--border-color)',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    input: {
        flex: 1,
        padding: 10,
        borderRadius: 20,
        border: '1px solid var(--input-border)',
        outline: 'none',
        fontSize: 14,
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        '&:focus': {
            borderColor: 'var(--button-bg)',
            boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.2)',
        }
    },
    sendButton: {
        marginLeft: 8,
        padding: '8px 16px',
        backgroundColor: 'var(--button-bg)',
        color: 'var(--button-text)',
        border: 'none',
        borderRadius: 20,
        cursor: 'pointer',
        fontWeight: 'bold',
        '&:hover': {
            backgroundColor: 'var(--button-hover)',
        },
        '&:active': {
            backgroundColor: 'var(--button-hover)',
        }
    }
});

interface Render {
    Image: Rendering.Image<Models.Participants.AParticipant>,
    Label: Rendering.Label<Models.Participants.AParticipant>
}
export function ParticipantImages(props: Rendering.OnProps & { 
    binding: Models.Channels.AChannel,
    render: Render,
    except: Objects.Binding<string>,
}) {
    const zone = Database.useZone();
    const participants = Models.Channels.asChat.to(props.binding);
    
    return <>{ participants
        .filter(participant => participant.objectId !== props.except.objectId).map((participant, index) => <props.render.Image key={participant.objectId || index} binding={{ participant }} {...Rendering.onProps(props)}/>) }</>
}

export function ParticipantNames(
    binding: Models.Channels.AChannel,
    render: Render,
    except: Objects.Binding<string>,
    empty?: string
) {
    const zone = Database.useZone();
    const participants = Models.Channels.asChat.to(binding);

    if(participants.length === 0) return empty || '';
    
    return participants.filter(participant => participant.objectId !== except.objectId).map((participant, index) => {
        const prefix = index > 0 ? ', ' : '';
        const suffix = render.Label({ participant });
        return prefix+suffix
    }).join('');
}

export function Card(props: Rendering.OnProps & { 
    binding: Models.Channels.AChannel,
    render: Render
}) {
    const zone = Database.useZone();
    const participants = Models.Channels.asChat.to(props.binding);
    const { user } = useAuth();
    const me = Objects.Binding.from_bound(user?.id || '?');    

    const messages = Proposals.useRelation(Models.Channels.HasComment.stream(zone, props.binding));
    const mostRecent = messages.entries.length ? messages.entries[messages.entries.length-1] : undefined;
    const atTime = Proposals.useScalarProperty(!mostRecent ? undefined : Models.Comments.AtTime.stream(zone, { comment: mostRecent.comment }).scalar);
    const hasBody = Proposals.useScalarProperty(!mostRecent ? undefined : Models.Comments.HasBody.stream(zone, { comment: mostRecent.comment }).scalar);
    return (
        <div className={styles.card}  {...Rendering.onProps(props)}>
            <div className={styles.cardOverlay}  {...Rendering.onProps(props)}>
                <div className={`${styles.cardProp} ${styles.title}`}  {...Rendering.onProps(props)}>
                    { ParticipantNames(props.binding, props.render, me) }
                { /* <DateTime.Summary kind="scalar" scalar={atTime}/> */ }
                </div>
                <div className={`${styles.cardProp} ${styles.author}`}  {...Rendering.onProps(props)}>
                <ParticipantImages {...props} except={me}  {...Rendering.onProps(props)}/>
                </div>
                <div className={`${styles.cardProp} ${styles.caption}`}  {...Rendering.onProps(props)}>
                {hasBody.value}
                </div>
            </div>
        </div>
    )
}

function Input(props: { 
    binding: Models.Channels.AChannel,
    render: Render
}) {
    const zone = Database.useZone();
    const [inputMessage, setInputMessage] = useState<string>('');
    const { user } = useAuth();
    const me = Objects.Binding.from_bound(user?.id || '?');    

    const sendMessage = async () => {
        if (!inputMessage.trim()) return;
        const timestamp = new Date().toISOString();
        const atTime_ = Temporal.DateTimeDomain.asString({ standard: 'iso8601', definition: 'DateTime' })?.from(timestamp);
        const hasAuthor_ = user && { author: me }
        
        const comment = Objects.Binding.from_bound(uuidv4());
        const clients = {
            atTime: Models.Comments.AtTime.stream(zone, { comment }).scalar?.stateful(),
            hasAuthor: Models.Comments.HasAuthor.stream(zone, { comment }).stateful(),
            hasBody: Models.Comments.HasBody.stream(zone, { comment }).scalar?.stateful(),
            hasComment: Models.Channels.HasComment.stream(zone, props.binding).stateful()
        };
        if(!atTime_ || !hasAuthor_ || !clients.atTime || !clients.hasAuthor || !clients.hasBody || !clients.hasComment) {
            console.error('Cannot upload comment');
        } else {
            document.body.style.zoom = '1';
            // Clear input before sending
            setInputMessage('');
            clients.atTime.assign(atTime_);
            clients.hasAuthor.assign([{ comment, ...hasAuthor_}]);
            clients.hasBody.assign(inputMessage);
            clients.hasComment.insert({ channel: props.binding.channel, comment });
            zone.commitAll();
        }
    };
    
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };
    
    return <>
        <input 
            className={styles.input}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={"Type your message to "+ParticipantNames(props.binding, props.render, me, 'the group')}
        />
        <button className={styles.sendButton} onClick={sendMessage}>Send</button>
    </>
}
export function Messages(props: Rendering.OnProps & { 
    binding: Models.Channels.AChannel,
    render: Render
}) {
    const zone = Database.useZone();
    const poll = Database.usePoll();
    useInterval(() => poll().catch(err => console.error(err)), 2000);

    const { user } = useAuth();
    const messages = Proposals.useRelation(Models.Channels.HasComment.stream(zone, props.binding))

    return ([...messages.entries]).reverse().map((entry, index) => (
            <CommentCard key={entry.comment.objectId || index} me={user?.id || ''} binding={entry}/>
        ));
}

export function Document(props: Rendering.OnProps & { 
    binding: Models.Channels.AChannel,
    render: Render
}) {    
    const { user } = useAuth();
    const me = Objects.Binding.from_bound(user?.id || '?');    
    
    return (
        <Debug.Boundary name="channel-document-view">
            <Database.AsEditor peerId="channel-messages">
            <div className={styles.document}>
                <div className={styles.channelHeader}>
                    <ParticipantImages {...props} except={me} {...Rendering.onProps(props)}/>
                </div>
                <div className={styles.channelMessages}>
                    <Messages {...props}/>
                </div>
                <div className={styles.channelInputArea}>
                    <Input {...props}/>
                </div>
            </div>
            </Database.AsEditor>
        </Debug.Boundary>
    );
};